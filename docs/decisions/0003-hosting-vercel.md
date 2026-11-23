# ADR 0003: alojamiento del sitio en Vercel
**Estado:** propuesta; pendiente de aprobación del responsable.
**Contexto:** el Grupo ya usa Vercel y Supabase en otros servicios (Placeta Joven). El sitio de la fase 1 es estático.
**Decisión:** desplegar `dist/` en Vercel con Git (preview desde `devai`, producción desde `main`) y cabeceras en `vercel.json`. `_headers` se mantiene para otros alojamientos y un test impide que ambos difieran.
**Consecuencias:** Vercel es encargado del tratamiento (ya figura como proveedor previsible en la política de privacidad, por confirmar). Las páginas de preview deben estar protegidas mientras haya borradores. Para la fase 2 hay que decidir la región de las funciones y de Supabase dentro de la UE.
