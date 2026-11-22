# Deuda técnica y decisiones pendientes
| ID | Descripción | Prioridad | Referencia |
|---|---|---|---|
| TECH-001 | Typecheck: no hay TypeScript todavía. Al añadir JavaScript de campus, adoptar TypeScript estricto (requiere aprobar dependencia). | Media | Art. 9 |
| TECH-002 | Autenticación (Google y PlacetaID) con Supabase Auth y PKCE. Requiere aprobar `@supabase/supabase-js` con versión fijada y esperar el enfriamiento de 14 días. | Alta | Art. 14, 23 |
| TECH-003 | Fijar por SHA las acciones de `.github/workflows/`. No se inventan SHAs sin red. | Alta (bloquea publicar) | Art. 24 |
| TECH-004 | Autoalojar Sora y Plus Jakarta Sans (OFL) en `src/fonts/`. Hasta entonces se usa la pila de sistema. | Media | Art. 26 |
| TECH-005 | Límite de intentos del canje de códigos y rate limiting en la API. | Alta | Art. 19 |
| TECH-006 | Pruebas de RLS por rol contra una base real. La migración no se ha ejecutado. | Alta (bloquea publicar) | Art. 57 |
| TECH-007 | Proveedor de pagos (ADR), importe de la matrícula simbólica, IVA y facturación. | Alta | Art. 13 |
| TECH-008 | Generación de certificados PDF y verificación pública. | Media | Art. 53 |
| TECH-009 | Auditoría WCAG 2.2 AA con axe y revisión manual. | Media | Art. 42 |
| TECH-010 | Medir LCP/INP/CLS con Lighthouse; no se afirma rendimiento sin medida. | Media | Art. 41 |
