# Arquitectura
**Fase 1 (esta versión):** sitio estático generado en build (`scripts/build.mjs`), sin JavaScript en el navegador ni recursos de terceros.
**Fase 2:** campus autenticado sobre Supabase (Auth, PostgreSQL con RLS, Storage privado) y funciones de servidor para pagos y certificados.

Flujo previsto: navegador -> Supabase Auth (Google / PlacetaID) -> API con RLS -> funciones `redeem_enrollment_code` y `enroll_open_course`. Los pagos y los certificados los escribe solo el servidor con `service_role`.

Versiones y soporte: Node 22 (LTS). PostgreSQL gestionado por Supabase. Revisar fin de soporte cada trimestre (Art. 39).
Integraciones: Google OAuth, PlacetaID (protocolo por confirmar, se asume OIDC), Cisco Networking Academy (proceso de matrícula por definir), proveedor de pagos (ADR pendiente).
Modalidades: `open` (gratis), `convenio` (código de grupo + matrícula simbólica) y `cisco` (matrícula Cisco incluida por convenio).
