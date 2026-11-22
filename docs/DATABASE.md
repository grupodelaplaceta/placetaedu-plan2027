# Base de datos
Fuente de verdad: `supabase/migrations/0001_init.sql` (**propuesta, sin ejecutar: No verificado**).
Tablas: `profiles`, `user_roles`, `courses`, `activities`, `groups`, `enrollments`, `activity_progress`, `payments`, `certificates`. Todas con RLS.
- Identidad: `profiles.dip` guarda el DIP de PlacetaID (clave del ecosistema del Grupo); nulo hasta integrar el acceso.
- Roles: todo usuario nuevo es `student` (trigger). `instructor` y `admin` solo los concede el servidor.
- Códigos de inscripción: solo se guarda el hash SHA-256; se canjean con `redeem_enrollment_code`.
- Matrícula simbólica: se fija en el convenio y se guarda por grupo (`groups.enrollment_fee_cents`): 0, o de 100 a 500 céntimos (1 € a 5 € por estudiante). La matrícula Cisco depende del tipo de curso (`courses.cisco_matricula`).
- Altas de matrícula, pagos y certificados: sin política de escritura para clientes; escribe el servidor o funciones `SECURITY DEFINER` con `search_path` fijado.
- Verificación pública de certificados: `verify_certificate(code)` devuelve solo curso, titular y fecha.
Reversión: `0001_init.down.sql` (destructiva; copia previa y aprobación humana).
