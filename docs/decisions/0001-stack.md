# ADR 0001: sitio estático sin dependencias y Supabase para el campus
**Estado:** propuesta, pendiente de aprobación humana.
**Contexto:** el proyecto necesita un sitio público rápido, legal y seguro, y después un campus con cuentas, roles y datos personales de alumnado.
**Decisión:** fase 1 con generador estático propio (cero dependencias, superficie de ataque mínima, CSP estricta). Fase 2 con Supabase (Auth, PostgreSQL con RLS) por cubrir Google OAuth, roles y almacenamiento privado.
**Consecuencias:** no hay typecheck ni framework hasta la fase 2. Cada dependencia nueva exige verificación (Art. 23) y aprobación.
**Alternativas:** Moodle (descartada: no encaja con el diseño de marca ni con el modelo de roles previsto, a validar), Next.js (más dependencias en fase 1).
