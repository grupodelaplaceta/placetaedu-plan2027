# Changelog
Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## [Sin publicar]
### Cambiado
- Interfaz en superficies de color sólido y sin bordes (el certificado conserva su marco).
- Las miniaturas de curso salen de una única fuente (`coverHtml`) y son idénticas en catálogo, campus, notificaciones, certificados y curso; prueba automática que lo comprueba.
- Cuestionarios rehechos: 5 preguntas, aviso si faltan respuestas, explicación de cada una, nota, repetición y unidad completada al aprobar. Examen con banco de 14 preguntas, avance y registro al salir de la pantalla.
- Cálculo de notas aislado en `src/js/calificar.js` con 8 pruebas unitarias.
- El sitio y el campus se muestran siempre en modo claro, con independencia del tema del dispositivo.

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
