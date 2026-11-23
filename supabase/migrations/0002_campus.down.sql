-- Reversion de 0002_campus.sql. DESTRUCTIVA: copia previa y aprobacion humana (Art. 59).
drop function if exists public.course_grade(uuid), public.exam_finish(uuid), public.exam_log_event(uuid, text),
  public.exam_answer(uuid, uuid, text), public.exam_question(uuid, int), public.start_exam_attempt(uuid), public.exam_unlocked(uuid);
drop view if exists public.my_calendar, public.course_progress;
drop table if exists public.exam_events, public.exam_answers, public.exam_attempts, public.exam_answer_keys,
  public.exam_questions, public.exams, public.cisco_enrollments, public.notifications, public.modules;
alter table public.activities drop column if exists module_id, drop column if exists required, drop column if exists graded,
  drop column if exists weight, drop column if exists min_score, drop column if exists opens_at, drop column if exists due_at, drop column if exists closes_at;
alter table public.courses drop column if exists passing_grade, drop column if exists progress_mode;
drop type if exists public.review_status, public.attempt_status, public.cisco_status, public.notification_kind;
