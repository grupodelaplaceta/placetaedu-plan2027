# Despliegue
Entornos: local, development, staging y production con datos y credenciales separados. `devai` -> development/staging; `main` -> production con aprobación manual.
Fase 1: publicar el contenido de `dist/` en un alojamiento estático **que aplique el archivo `_headers`** (o su equivalente) y fuerce HTTPS. Hosting: PENDIENTE.
Antes de publicar: completar los marcadores PENDIENTE de `src/legal/`, añadir las fuentes (`src/fonts/`, licencia OFL), revisión jurídica, `scripts/check-headers.sh <url>` y la lista del Anexo I.
Migraciones: copia previa, aplicación por una persona autorizada, plan de reversión y smoke tests.
