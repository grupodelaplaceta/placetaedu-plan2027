# Deuda técnica y decisiones pendientes
| ID | Descripción | Prioridad | Referencia |
|---|---|---|---|
| TECH-001 | Typecheck: no hay TypeScript todavía. Al añadir JavaScript de campus, adoptar TypeScript estricto (requiere aprobar dependencia). | Media | Art. 9 |
| TECH-002 | Autenticación (Google y PlacetaID) con Supabase Auth y PKCE. Requiere aprobar `@supabase/supabase-js` con versión fijada y esperar el enfriamiento de 14 días. | Alta | Art. 14, 23 |
| TECH-003 | Fijar por SHA las acciones de `.github/workflows/`. No se inventan SHAs sin red. | Alta (bloquea publicar) | Art. 24 |
| TECH-004 | Autoalojar Sora y Plus Jakarta Sans (OFL) en `src/fonts/`. Hasta entonces se usa la pila de sistema. | Media | Art. 26 |
| TECH-005 | Límite de intentos del canje de códigos y rate limiting en la API. | Alta | Art. 19 |
| TECH-006 | Pruebas de RLS por rol contra una base real. La migración no se ha ejecutado. | Alta (bloquea publicar) | Art. 57 |
| TECH-007 | Proveedor de pagos (ADR), IVA y facturación de la matrícula simbólica (1 € a 5 € por estudiante, fijada en el convenio) y de la matrícula Cisco según tipo de curso. | Alta | Art. 13 |
| TECH-008 | Certificados PDF: el generador (`scripts/pdf.mjs`) y la muestra existen. Falta emitirlos desde el servidor con datos reales, sus tipografías de marca (Sora) y la página de verificación pública. | Media | Art. 53 |
| TECH-009 | Auditoría WCAG 2.2 AA con axe y revisión manual. | Media | Art. 42 |
| TECH-010 | Medir LCP/INP/CLS con Lighthouse; no se afirma rendimiento sin medida. | Media | Art. 41 |
| TECH-015 | Examen real en servidor: banco de preguntas, intentos, tiempo y corrección según `docs/CAMPUS.md`; reautenticación y límites por IP o dispositivo; pruebas de autorización de las funciones `exam_*`. | Alta | Art. 19, 57 |
| TECH-016 | Proceso de alta en Cisco Networking Academy (cómo se solicita, qué datos devuelve y cómo se notifican los errores). | Alta | Art. 13 |
| TECH-011 | Integrar PlacetaID (plid26, `id.laplaceta.org`): alta como solicitante, `client_id`, `redirect_uri` y uso del DIP como identidad. | Alta | Art. 14 |
| TECH-012 | Exponer la API que Placeta Joven espera de PlacetaEDU (`GET /pathways`; PlacetaEDU es la fuente de verdad de cursos, actividades, progreso y certificados). | Media | Art. 13 |
| TECH-013 | Recompensas en Pz y becas sobre la matrícula: dependen de Banco de La Placeta y RSP. Al activarlas, reevaluar a nivel 3 (ADR 0002). | Alta | Art. 6 |
| TECH-014 | Alinear los textos legales con los vigentes del Grupo (servidos desde el BOLP). Ver `docs/LEGAL-SOURCES.md`. | Alta (bloquea publicar) | Art. 26 |
