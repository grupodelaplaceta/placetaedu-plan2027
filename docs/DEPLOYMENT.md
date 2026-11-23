# Despliegue en Vercel
**Estado:** configuración lista (`vercel.json`). El despliegue lo realiza una persona autorizada: ninguna herramienta automática tiene credenciales de Vercel ni permiso para publicar (Manual DEVAI, Art. 54 y 58).

## Qué hace Vercel
Instala con `npm ci --ignore-scripts`, ejecuta `npm run build` y publica `dist/` con las cabeceras de `vercel.json` (CSP estricta, HSTS, nosniff, etc.). Node 22.x. No hay variables de entorno en la fase 1.

## Pasos (una sola vez)
1. **Repositorio privado** en GitHub (organización del Grupo) y subida de las ramas:
   ```bash
   git remote add origin git@github.com:<organizacion>/placeta-edu.git
   git push -u origin devai
   git switch -c main && git push -u origin main   # main la crea una persona; no se trabaja directamente en ella
   ```
2. En Vercel: **Add New → Project → Import** el repositorio. Framework Preset: *Other*. No cambies Build Command, Output Directory ni Install Command (los toma de `vercel.json`).
3. **Production Branch = `main`.** Las ramas `devai` y las PR generan despliegues de *preview*.
4. En *Settings → Deployment Protection*, activa la protección de los despliegues de preview (hay textos legales en borrador y datos de ejemplo).
5. Dominio: asígnalo a producción solo cuando se cumplan las condiciones de más abajo.
6. Cada subida a `devai` o `main` despliega sola. Alternativa manual: `npx vercel` (preview) y `npx vercel --prod` (producción).

## Comprobaciones tras cada despliegue
- `bash scripts/check-headers.sh https://<url>` de la skill DEVAI (cabeceras y CSP).
- Abrir inicio, catálogo, ayuda, los cinco textos legales y `/ejemplo/certificado-ejemplo.pdf` (el PDF se sirve sin CSP de página para que el visor del navegador funcione).
- Lighthouse y axe (TECH-009, TECH-010).

## Condiciones para producción
Hasta que se cumplan, `src/robots.txt` cierra el sitio a buscadores y no debe asignarse el dominio definitivo:
1. Textos legales completados y revisados (TECH-014).
2. Acciones de CI fijadas por SHA (TECH-003).
3. Aprobación de la persona responsable y de una segunda persona revisora.
4. Cambiar `src/robots.txt` a `Allow: /`.

## Fase 2 (campus con cuentas)
Supabase se despliega aparte (migraciones con copia previa, plan de reversión y aprobación). Vercel pasará a necesitar variables `PUBLIC_*` y un entorno separado para staging y producción.
