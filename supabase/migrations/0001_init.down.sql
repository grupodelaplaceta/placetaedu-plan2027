-- Reversion de 0001_init.sql. DESTRUCTIVA: hacer copia previa (Art. 59) y aprobacion humana.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user(), public.enroll_open_course(uuid), public.redeem_enrollment_code(text),
  public.verify_certificate(text), public.has_role(public.app_role), public.is_course_owner(uuid), public.is_enrolled(uuid);
drop table if exists public.certificates, public.payments, public.activity_progress, public.enrollments,
  public.groups, public.activities, public.courses, public.user_roles, public.profiles;
drop type if exists public.payment_status, public.enrollment_status, public.activity_kind,
  public.publish_status, public.course_modality, public.app_role;
