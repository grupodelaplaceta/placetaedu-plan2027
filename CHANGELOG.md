# Changelog
Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## [Sin publicar]
### Añadido
- Campus virtual de demostración: carrusel de cursos, calendario, notificaciones, calificaciones y entorno de curso con pantalla de carga, todos los tipos de contenido y examen final protegido.
- Migración `0002_campus.sql` (módulos, notificaciones, alta Cisco, exámenes con claves en servidor, notas ponderadas) y `docs/CAMPUS.md`.
- Diseño en colores planos (sin degradados ni sombras, con regla de lint), portadas con la roseta original del logo y logo de Cisco Networking Academy.
- Certificado de muestra en portada y generador de certificados PDF (`scripts/pdf.mjs`) con PDF de ejemplo.
- Centro de ayuda multipágina (8 páginas) y campus virtual de demostración con vistas de estudiante e instructor.
- Matrícula simbólica de 1 € a 5 € por estudiante fijada por convenio (por grupo en la base de datos); matrícula Cisco según tipo de curso.
- Responsable técnico y de seguridad, nivel DEVAI 2 (ADR 0002) y fuentes públicas del Grupo (`docs/LEGAL-SOURCES.md`).
- Campo `profiles.dip` para la identidad de PlacetaID.
- Sitio público: inicio comercial, catálogo con portadas, acceso provisional y páginas legales (aviso legal, privacidad, cookies, condiciones, accesibilidad).
- Generador estático, lint de seguridad y pruebas sin dependencias.
- Esquema SQL propuesto con RLS y su reversión.
- Cabeceras de seguridad (`_headers`), CI, CodeQL y Dependabot.
- Documentación y gobierno del proyecto según el Manual DEVAI.
