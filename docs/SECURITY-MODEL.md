# Modelo de seguridad (Nivel 2)
- **Navegador:** CSP estricta (`src/_headers`), sin scripts ni estilos inline, sin terceros; fuentes autoalojadas (RGPD).
- **Autorización:** denegar por defecto; RLS en toda tabla; permisos concedidos tabla a tabla.
- **Códigos de inscripción:** hash en BD, comparación en servidor, límite de intentos en la API (pendiente, TECH-005).
- **Roles privilegiados:** MFA obligatorio para `admin` e `instructor` (N2 exige admin) cuando exista el campus.
- **Datos personales:** minimización; menores de 14 años con consentimiento de tutores (LOPDGDD art. 7). Sin datos reales en pruebas.
- **Secretos:** nunca en el repositorio; `service_role` solo en servidor.
## Exámenes
Las respuestas correctas no salen del servidor, el tiempo y la nota los calcula el servidor y los intentos quedan registrados. Detalle en `docs/CAMPUS.md`.
## Pruebas de autorización pendientes (TECH-006)
Cada rol (anónimo, estudiante, instructor, administrador) contra cada tabla y función: lectura de datos ajenos (IDOR), canje con código caducado o completo, escritura directa en `enrollments`, `payments`, `certificates` y `user_roles`.
