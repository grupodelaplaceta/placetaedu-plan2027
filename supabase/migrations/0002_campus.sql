-- PlacetaEDU · campus: modulos, progreso, calendario, notificaciones, Cisco, examenes y notas.
-- ESTADO: propuesta sin ejecutar en PostgreSQL (No verificado). Reversion: 0002_campus.down.sql.
-- Principio del examen: el navegador nunca recibe las respuestas correctas ni decide el tiempo ni la nota.

alter table public.courses
  add column passing_grade numeric(5,2) not null default 50 check (passing_grade between 0 and 100),
  add column progress_mode text not null default 'percent' check (progress_mode in ('percent', 'units'));

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position int not null check (position >= 0),
  title text not null check (char_length(title) between 1 and 200),
  unique (course_id, position)
);
alter table public.activities
  add column module_id uuid references public.modules (id) on delete set null,
  add column required boolean not null default true,
  add column graded boolean not null default false,
  add column weight numeric(5,2) not null default 0 check (weight between 0 and 100),
  add column min_score numeric(5,2) check (min_score between 0 and 100),
  add column opens_at timestamptz,
  add column due_at timestamptz,
  add column closes_at timestamptz;

create type public.notification_kind as enum
  ('cisco_enrolled', 'cisco_pending', 'cisco_error', 'enrollment', 'deadline', 'certificate', 'exam', 'system');
create type public.cisco_status as enum ('pending', 'requested', 'active', 'error');
create type public.attempt_status as enum ('in_progress', 'submitted', 'expired', 'invalidated');
create type public.review_status as enum ('pending', 'valid', 'invalid');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null check (char_length(title) <= 200),
  body text not null check (char_length(body) <= 1000),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

create table public.cisco_enrollments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  status public.cisco_status not null default 'pending',
  cisco_username text,
  class_ref text,
  error_code text,
  error_message text check (char_length(error_message) <= 500),
  requested_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null unique references public.courses (id) on delete cascade,
  title text not null default 'Examen final',
  duration_minutes int not null check (duration_minutes between 1 and 360),
  question_count int not null check (question_count > 0),
  max_attempts int not null default 1 check (max_attempts between 1 and 10),
  weight numeric(5,2) not null check (weight between 0 and 100),
  min_score numeric(5,2) check (min_score between 0 and 100),
  opens_at timestamptz,
  closes_at timestamptz
);
create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array')   -- [{"id":"a","text":"..."}]; la clave de respuesta vive en otra tabla
);
create table public.exam_answer_keys (                               -- NUNCA accesible desde el cliente
  question_id uuid primary key references public.exam_questions (id) on delete cascade,
  correct_option_id text not null
);
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  submitted_at timestamptz,
  question_order uuid[] not null,
  status public.attempt_status not null default 'in_progress',
  score numeric(5,2) check (score between 0 and 100),
  review public.review_status not null default 'pending'
);
create unique index exam_one_open_attempt on public.exam_attempts (exam_id, user_id) where status = 'in_progress';
create table public.exam_answers (
  attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  question_id uuid not null references public.exam_questions (id) on delete cascade,
  option_id text not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);
create table public.exam_events (
  id bigint generated always as identity primary key,
  attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  kind text not null check (kind in ('tab_hidden', 'window_blur', 'copy', 'paste', 'cut', 'context_menu', 'fullscreen_exit', 'offline')),
  at timestamptz not null default now()
);
create index on public.exam_events (attempt_id);

-- Progreso por matricula (unidades obligatorias completadas)
create view public.course_progress with (security_invoker = true) as
  select e.id as enrollment_id, e.course_id, e.user_id,
         count(a.id) filter (where a.required) as units_total,
         count(p.activity_id) filter (where a.required) as units_done
    from public.enrollments e
    join public.activities a on a.course_id = e.course_id
    left join public.activity_progress p on p.activity_id = a.id and p.user_id = e.user_id
   group by e.id;

-- Calendario: entregas y cierres pendientes de mis matriculas activas
create view public.my_calendar with (security_invoker = true) as
  select a.id, a.course_id, c.title as course_title, a.title,
         coalesce(a.due_at, a.closes_at) as at,
         case when a.due_at is not null then 'entrega' else 'cierre' end as kind
    from public.activities a
    join public.courses c on c.id = a.course_id
    join public.enrollments e on e.course_id = a.course_id and e.user_id = auth.uid() and e.status = 'active'
   where coalesce(a.due_at, a.closes_at) is not null
     and not exists (select 1 from public.activity_progress p where p.activity_id = a.id and p.user_id = auth.uid())
  union all
  select x.id, x.course_id, c.title, x.title, x.closes_at, 'examen'
    from public.exams x
    join public.courses c on c.id = x.course_id
    join public.enrollments e on e.course_id = x.course_id and e.user_id = auth.uid() and e.status = 'active'
   where x.closes_at is not null;

-- Funciones de examen (SECURITY DEFINER, search_path fijado)
create function public.exam_unlocked(eid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (
    select 1 from public.exams x
      join public.activities a on a.course_id = x.course_id and a.required
     where x.id = eid
       and not exists (select 1 from public.activity_progress p where p.activity_id = a.id and p.user_id = auth.uid()));
$$;

create function public.start_exam_attempt(eid uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare x public.exams; aid uuid; usados int; orden uuid[];
begin
  if auth.uid() is null then raise exception 'No autenticado' using errcode = '28000'; end if;
  select * into x from public.exams where id = eid;
  if not found or not public.is_enrolled(x.course_id) then raise exception 'Examen no disponible' using errcode = 'P0002'; end if;
  if (x.opens_at is not null and now() < x.opens_at) or (x.closes_at is not null and now() > x.closes_at) then
    raise exception 'Fuera de plazo' using errcode = 'P0001'; end if;
  if not public.exam_unlocked(eid) then raise exception 'Completa antes las unidades obligatorias' using errcode = 'P0001'; end if;
  select id into aid from public.exam_attempts where exam_id = eid and user_id = auth.uid() and status = 'in_progress' and deadline_at > now();
  if aid is not null then return aid; end if;                        -- reanudar el intento abierto
  update public.exam_attempts set status = 'expired' where exam_id = eid and user_id = auth.uid() and status = 'in_progress';
  select count(*) into usados from public.exam_attempts where exam_id = eid and user_id = auth.uid();
  if usados >= x.max_attempts then raise exception 'Sin intentos disponibles' using errcode = 'P0001'; end if;
  select array_agg(id) into orden from (select id from public.exam_questions where exam_id = eid order by random() limit x.question_count) q;
  if orden is null or array_length(orden, 1) < x.question_count then raise exception 'Banco de preguntas insuficiente' using errcode = 'P0001'; end if;
  insert into public.exam_attempts (exam_id, user_id, deadline_at, question_order)
  values (eid, auth.uid(), now() + make_interval(mins => x.duration_minutes), orden) returning id into aid;
  return aid;
end $$;

create function public.exam_question(aid uuid, n int)
returns table (question_id uuid, prompt text, options jsonb, total int, deadline_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select q.id, q.prompt,
         (select jsonb_agg(o order by md5(a.id::text || (o ->> 'id'))) from jsonb_array_elements(q.options) o),
         array_length(a.question_order, 1), a.deadline_at
    from public.exam_attempts a
    join public.exam_questions q on q.id = a.question_order[n]
   where a.id = aid and a.user_id = auth.uid() and a.status = 'in_progress' and a.deadline_at > now();
$$;

create function public.exam_answer(aid uuid, qid uuid, oid text) returns void
language plpgsql security definer set search_path = '' as $$
declare a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = aid and user_id = auth.uid() and status = 'in_progress' and deadline_at > now();
  if not found or not (qid = any (a.question_order)) then raise exception 'Intento no valido' using errcode = 'P0001'; end if;
  insert into public.exam_answers (attempt_id, question_id, option_id) values (aid, qid, oid)
  on conflict (attempt_id, question_id) do update set option_id = excluded.option_id, answered_at = now();
end $$;

create function public.exam_log_event(aid uuid, k text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.exam_events (attempt_id, kind)
  select aid, k from public.exam_attempts where id = aid and user_id = auth.uid() and status = 'in_progress';
end $$;

create function public.exam_finish(aid uuid) returns numeric
language plpgsql security definer set search_path = '' as $$
declare a public.exam_attempts; ok int; nota numeric;
begin
  select * into a from public.exam_attempts where id = aid and user_id = auth.uid() and status = 'in_progress';
  if not found then raise exception 'Intento no valido' using errcode = 'P0001'; end if;
  select count(*) into ok from public.exam_answers an join public.exam_answer_keys k on k.question_id = an.question_id and k.correct_option_id = an.option_id
   where an.attempt_id = aid and an.answered_at <= a.deadline_at;
  nota := round(100.0 * ok / array_length(a.question_order, 1), 2);
  update public.exam_attempts set submitted_at = now(), score = nota, status = case when now() > a.deadline_at then 'expired' else 'submitted' end where id = aid;
  return nota;
end $$;

-- Nota del curso: media ponderada de actividades evaluables y examen (mejor intento no invalidado)
create function public.course_grade(eid uuid)
returns table (average numeric, graded_weight numeric, complete boolean, passed boolean, passing_grade numeric)
language sql stable security definer set search_path = '' as $$
  with e as (select * from public.enrollments where id = eid and (user_id = auth.uid() or public.is_course_owner(course_id))),
  items as (
    select a.weight, p.score from e join public.activities a on a.course_id = e.course_id and a.graded and a.weight > 0
      left join public.activity_progress p on p.activity_id = a.id and p.user_id = e.user_id
    union all
    select x.weight, (select max(t.score) from public.exam_attempts t where t.exam_id = x.id and t.user_id = e.user_id and t.status in ('submitted', 'expired') and t.review <> 'invalid')
      from e join public.exams x on x.course_id = e.course_id
  )
  select coalesce(round(sum(score * weight) / nullif(sum(weight) filter (where score is not null), 0), 2), 0),
         coalesce(sum(weight) filter (where score is not null), 0),
         bool_and(score is not null),
         bool_and(score is not null) and coalesce(sum(score * weight) / nullif(sum(weight), 0), 0) >= (select c.passing_grade from e join public.courses c on c.id = e.course_id),
         (select c.passing_grade from e join public.courses c on c.id = e.course_id)
    from items;
$$;

-- Permisos y RLS
revoke all on public.modules, public.notifications, public.cisco_enrollments, public.exams, public.exam_questions,
  public.exam_answer_keys, public.exam_attempts, public.exam_answers, public.exam_events, public.course_progress, public.my_calendar
  from anon, authenticated;
revoke all on function public.exam_unlocked(uuid), public.start_exam_attempt(uuid), public.exam_question(uuid, int),
  public.exam_answer(uuid, uuid, text), public.exam_log_event(uuid, text), public.exam_finish(uuid), public.course_grade(uuid)
  from public, anon, authenticated;
grant execute on function public.exam_unlocked(uuid), public.start_exam_attempt(uuid), public.exam_question(uuid, int),
  public.exam_answer(uuid, uuid, text), public.exam_log_event(uuid, text), public.exam_finish(uuid), public.course_grade(uuid)
  to authenticated;
grant select on public.modules, public.exams, public.cisco_enrollments, public.exam_attempts, public.exam_answers,
  public.exam_events, public.course_progress, public.my_calendar, public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant update (review) on public.exam_attempts to authenticated;
-- exam_questions y exam_answer_keys: sin ningun permiso para clientes (solo funciones y service_role)

alter table public.modules enable row level security;
alter table public.notifications enable row level security;
alter table public.cisco_enrollments enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_answer_keys enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_events enable row level security;

create policy modules_select on public.modules for select to authenticated using (public.is_course_owner(course_id) or public.is_enrolled(course_id));
create policy notifications_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cisco_select_own on public.cisco_enrollments for select to authenticated
  using (exists (select 1 from public.enrollments e where e.id = enrollment_id and (e.user_id = auth.uid() or public.is_course_owner(e.course_id))));
create policy exams_select on public.exams for select to authenticated using (public.is_course_owner(course_id) or public.is_enrolled(course_id));
create policy attempts_select on public.exam_attempts for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.exams x where x.id = exam_id and public.is_course_owner(x.course_id)));
create policy attempts_review_owner on public.exam_attempts for update to authenticated
  using (exists (select 1 from public.exams x where x.id = exam_id and public.is_course_owner(x.course_id)))
  with check (exists (select 1 from public.exams x where x.id = exam_id and public.is_course_owner(x.course_id)));
create policy answers_select on public.exam_answers for select to authenticated
  using (exists (select 1 from public.exam_attempts t where t.id = attempt_id and t.user_id = auth.uid()));
create policy events_select on public.exam_events for select to authenticated
  using (exists (select 1 from public.exam_attempts t join public.exams x on x.id = t.exam_id
                  where t.id = attempt_id and (t.user_id = auth.uid() or public.is_course_owner(x.course_id))));
-- Sin politicas para exam_questions ni exam_answer_keys; sin insert en notifications, cisco_enrollments, intentos, respuestas ni eventos desde clientes.
