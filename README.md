# PlacetaEDU

Campus online del Departamento de Educación de Grupo de La Placeta: formación accesible, acompañada y orientada a oportunidades reales.

**Estado:** activo (v0.1.0, fase 1: sitio público y base de datos propuesta) · **Nivel DEVAI:** nivel 2 (asumido, pendiente de confirmar) · **Manual DEVAI:** 2.0

## Finalidad y funcionalidades
- Registro con Google o PlacetaID. Roles: estudiante e instructor (un instructor también puede cursar).
- Cursos abiertos gratuitos, cursos por convenio con un centro (código de inscripción y matrícula simbólica) y cursos con matrícula Cisco Networking Academy.
- Actividades de teoría, vídeo, imágenes, cuestionarios y laboratorios. Certificados oficiales en PDF.
- Textos legales para España y la UE (`src/legal/`).

**Hecho en v0.1.0:** sitio público (inicio, catálogo, textos legales), portadas de curso, cabeceras de seguridad, esquema SQL con RLS (propuesto) y CI.
**Pendiente:** autenticación, campus autenticado, pagos, generación de PDF (ver `docs/TECH-DEBT.md`).

## Tecnologías
Node.js >= 22 (`.nvmrc`), HTML y CSS estáticos, generador propio sin dependencias (`scripts/build.mjs`), PostgreSQL con Supabase (RLS). Sin dependencias npm de ejecución ni de desarrollo.

## Instalación y ejecución
```bash
nvm use            # Node 22
npm run check      # lint + build + pruebas
npm run build      # genera dist/
```
Para verlo en local: sirve `dist/` con cualquier servidor estático.

## Comandos
| Comando | Qué hace |
|---|---|
| `npm run lint` | Reglas de seguridad y calidad (XSS, CSP, terceros, secretos) |
| `npm run build` | Genera `dist/` (páginas, portadas SVG, cabeceras) |
| `npm test` | Pruebas (`node:test`): estructura, accesibilidad básica, legal, CSP, RLS |
| `npm run check` | Los tres anteriores |

## Variables de entorno
Solo nombres, en `.env.example`: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor), `PAYMENT_PROVIDER_WEBHOOK_SECRET`. La fase 1 no las usa.

## Estructura
`src/` sitio (páginas, `legal/`, `partials/`, `css/`, `img/`, `data/courses.json`) · `scripts/` build y lint · `tests/` · `supabase/migrations/` · `docs/` · `.github/`.

## Integraciones
Google y PlacetaID (acceso), Cisco Networking Academy (matrícula y certificados Cisco), proveedor de pagos por definir. Detalle en `docs/ARCHITECTURE.md`.

## Documentación
`docs/ARCHITECTURE.md` · `docs/DATABASE.md` · `docs/SECURITY-MODEL.md` · `docs/DEPLOYMENT.md` · `docs/TECH-DEBT.md` · `docs/decisions/` · `docs/releases/` · `docs/audits/` · [SECURITY.md](SECURITY.md) · [CHANGELOG.md](CHANGELOG.md)

## Responsables técnicos y de seguridad
| Técnico | Identificación DIP | Rol |
|---|---|---|
| PENDIENTE | PENDIENTE | Responsable técnico |
| PENDIENTE | PENDIENTE | Responsable de seguridad |

Para notificar una vulnerabilidad, consulta [SECURITY.md](SECURITY.md).
