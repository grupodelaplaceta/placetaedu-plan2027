-- PlacetaEDU · esquema inicial con RLS (DEVAI Art. 22).
-- ESTADO: propuesta sin ejecutar en PostgreSQL (No verificado). Requiere revision humana
-- antes de aplicarse en cualquier entorno. Reversion: 0001_init.down.sql.
create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('student', 'instructor', 'admin');
create type public.course_modality as enum ('open', 'convenio', 'cisco');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.activity_kind as enum ('theory', 'video', 'image', 'lab', 'quiz');
create type public.enrollment_status as enum ('pending_payment', 'active', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  dip text unique,                          -- identificador PlacetaID (plid26); se rellena al integrar el acceso
  display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  title text not null check (char_length(title) between 3 and 160),
  summary text not null check (char_length(summary) <= 600),
  modality public.course_modality not null,
  status public.publish_status not null default 'draft',
  hours int check (hours > 0),
  owner_id uuid not null references auth.users (id),
  cisco_course_ref text,
  cisco_matricula text,                     -- la matricula Cisco depende del tipo de curso (descripcion por definir)
  created_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null check (position >= 0),
  kind public.activity_kind not null,
  title text not null check (char_length(title) between 1 and 200),
  content jsonb not null default '{}'::jsonb,
  unique (course_id, position)
);
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  instructor_id uuid not null references auth.users (id),
  center_name text not null check (char_length(center_name) between 2 and 160),
  code_hash text not null unique,           -- sha256 del codigo; el codigo en claro no se guarda
  max_seats int check (max_seats > 0),
  -- Matricula simbolica fijada en el convenio: 0 (sin matricula) o de 1 EUR (100) a 5 EUR (500) por estudiante
  enrollment_fee_cents int not null default 0 check (enrollment_fee_cents = 0 or enrollment_fee_cents between 100 and 500),
  currency char(3) not null default 'EUR',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.enrollment_status not null,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);
create table public.activity_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  completed_at timestamptz not null default now(),
  score numeric(5,2) check (score between 0 and 100),
  primary key (user_id, activity_id)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete restrict,
  amount_cents int not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR',
  status public.payment_status not null default 'pending',
  provider text not null,
  provider_ref text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_ref)           -- idempotencia de webhooks
);
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete restrict,
  user_id uuid not null references auth.users (id),
  course_id uuid not null references public.courses (id),
  holder_name text not null,
  verification_code text not null unique,
  issued_at timestamptz not null default now(),
  pdf_path text
);
create index on public.enrollments (user_id);
create index on public.enrollments (group_id);
create index on public.activities (course_id);
create index on public.groups (course_id);

-- Funciones auxiliares (SECURITY DEFINER con search_path fijado, Art. 22)
create function public.has_role(r public.app_role) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = r);
$$;
create function public.is_course_owner(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.courses where id = cid and owner_id = auth.uid());
$$;
create function public.is_enrolled(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.enrollments
    where course_id = cid and user_id = auth.uid() and status in ('active', 'completed'));
$$;
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Estudiante'), 120));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Apuntarse a un curso abierto (unica via de alta sin codigo)
create function public.enroll_open_course(cid uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare eid uuid;
begin
  if auth.uid() is null then raise exception 'No autenticado' using errcode = '28000'; end if;
  insert into public.enrollments (course_id, user_id, status)
  select id, auth.uid(), 'active' from public.courses
   where id = cid and modality = 'open' and status = 'published'
  on conflict (course_id, user_id) do nothing
  returning id into eid;
  return eid;
end $$;

-- Unirse con codigo de inscripcion. El limite de intentos se aplica en la capa de API (Art. 19).
create function public.redeem_enrollment_code(code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare g public.groups; c public.courses; eid uuid; seats int;
begin
  if auth.uid() is null then raise exception 'No autenticado' using errcode = '28000'; end if;
  select * into g from public.groups
   where code_hash = encode(extensions.digest(upper(trim(code)), 'sha256'), 'hex')
     and (expires_at is null or expires_at > now());
  if not found then raise exception 'Codigo no valido' using errcode = 'P0002'; end if;
  select * into c from public.courses where id = g.course_id and status = 'published';
  if not found then raise exception 'Codigo no valido' using errcode = 'P0002'; end if;
  if g.max_seats is not null then
    select count(*) into seats from public.enrollments where group_id = g.id;
    if seats >= g.max_seats then raise exception 'Grupo completo' using errcode = 'P0001'; end if;
  end if;
  insert into public.enrollments (course_id, group_id, user_id, status)
  values (c.id, g.id, auth.uid(), case when g.enrollment_fee_cents > 0 then 'pending_payment' else 'active' end)
  on conflict (course_id, user_id) do nothing
  returning id into eid;
  return eid;
end $$;

-- Verificacion publica de certificados: devuelve solo lo imprescindible
create function public.verify_certificate(code text)
returns table (valid boolean, course_title text, holder_name text, issued_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select true, c.title, ce.holder_name, ce.issued_at
    from public.certificates ce join public.courses c on c.id = ce.course_id
   where ce.verification_code = code;
$$;

-- Permisos minimos: se retira todo y se concede por tabla
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.enroll_open_course(uuid), public.redeem_enrollment_code(text) to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
grant execute on function public.has_role(public.app_role), public.is_course_owner(uuid), public.is_enrolled(uuid) to authenticated;
grant select on public.profiles, public.user_roles, public.courses, public.activities, public.groups,
  public.enrollments, public.activity_progress, public.payments, public.certificates to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant insert, update on public.courses, public.activities, public.groups to authenticated;
grant insert, update on public.activity_progress to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses enable row level security;
alter table public.activities enable row level security;
alter table public.groups enable row level security;
alter table public.enrollments enable row level security;
alter table public.activity_progress enable row level security;
alter table public.payments enable row level security;
alter table public.certificates enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy roles_select_own on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy courses_select on public.courses for select to authenticated
  using (status = 'published' or owner_id = auth.uid() or public.has_role('admin'));
create policy courses_insert_instructor on public.courses for insert to authenticated
  with check (owner_id = auth.uid() and public.has_role('instructor'));
create policy courses_update_owner on public.courses for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy activities_select on public.activities for select to authenticated
  using (public.is_course_owner(course_id) or public.is_enrolled(course_id));
create policy activities_write_owner on public.activities for insert to authenticated with check (public.is_course_owner(course_id));
create policy activities_update_owner on public.activities for update to authenticated
  using (public.is_course_owner(course_id)) with check (public.is_course_owner(course_id));

create policy groups_select_instructor on public.groups for select to authenticated using (instructor_id = auth.uid());
create policy groups_insert_instructor on public.groups for insert to authenticated
  with check (instructor_id = auth.uid() and public.has_role('instructor') and public.is_course_owner(course_id));
create policy groups_update_instructor on public.groups for update to authenticated
  using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

create policy enrollments_select on public.enrollments for select to authenticated
  using (user_id = auth.uid() or public.is_course_owner(course_id)
         or exists (select 1 from public.groups g where g.id = group_id and g.instructor_id = auth.uid()));

create policy progress_select_own on public.activity_progress for select to authenticated using (user_id = auth.uid());
create policy progress_insert_own on public.activity_progress for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.activities a where a.id = activity_id and public.is_enrolled(a.course_id)));
create policy progress_update_own on public.activity_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy payments_select_own on public.payments for select to authenticated
  using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid()));
create policy certificates_select_own on public.certificates for select to authenticated using (user_id = auth.uid());
-- Sin politicas de insert/update/delete en enrollments, payments, certificates ni user_roles:
-- solo escribe el servidor (service_role) o las funciones SECURITY DEFINER anteriores.
