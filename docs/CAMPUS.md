# Campus virtual: diseño funcional
Estado: prototipo visual y funcional con datos ficticios (`src/demo/campus.html`, `src/demo/curso.html`, `src/js/campus-demo.js`) y modelo de datos propuesto (`supabase/migrations/0002_campus.sql`, sin ejecutar). La lógica real irá en el servidor (fase 2).

## Pantalla de inicio
1. **Mis cursos:** carrusel horizontal bajo el nombre. Cada tarjeta muestra portada, modalidad y origen (por ejemplo «Cisco NetAcademy» o el centro), título y progreso. El progreso se muestra en porcentaje o en unidades según `courses.progress_mode`.
2. **Tarjeta «+»:** ofrece ver el catálogo o introducir un código de inscripción. El código se canjea con `redeem_enrollment_code` y da de alta en el curso del grupo; si lo paga el centro por convenio, se avisa en notificaciones.
3. **Calendario de tareas:** entregas (`due_at`), cierres de unidad (`closes_at`) y exámenes. Origen de datos: vista `my_calendar`.
4. **Notificaciones:** estado del alta en Cisco (confirmada con sus datos, pendiente o con error), matrícula, plazos, certificados y exámenes. Origen: `notifications` y `cisco_enrollments`, escritos solo por el servidor.
5. **Calificaciones** y **Certificados** (PDF con código de verificación), más catálogo y ayuda.

## Entorno del curso
Pantalla de carga con la roseta original animada (colores planos, respeta «reducir movimiento»). A la izquierda, módulos, unidades y el examen final con su estado; a la derecha, el contenido abierto: teoría, vídeo con transcripción, imágenes con texto alternativo, cuestionarios, laboratorio con entrega y examen.

## Cálculo de notas
`course_grade(enrollment)`: media ponderada de las actividades evaluables (`graded`, `weight`) y del examen (mejor intento no invalidado).
- Media = Σ(nota × peso) / Σ(pesos con nota). Mientras falten notas es provisional.
- Aprobado = todas las notas presentes y media ≥ `courses.passing_grade` (nota mínima de cada curso).
- Se puede exigir además una nota mínima por actividad o por examen (`min_score`).
- La media de un grupo y los aprobados se calculan con la misma función sobre cada matrícula.

## Examen final: protecciones
Ningún control del navegador evita el fraude por sí solo. Las protecciones que cuentan son del servidor; las del navegador disuaden y dejan rastro.
| Capa | Medida |
|---|---|
| Servidor | Solo se abre con todas las unidades obligatorias completas (`exam_unlocked`) |
| Servidor | Intentos limitados y un único intento abierto (`max_attempts`, índice único) |
| Servidor | El tiempo y la nota los fija el servidor (`deadline_at`, `exam_finish`); las respuestas tardías no cuentan |
| Servidor | Banco de preguntas más amplio que el examen; selección y orden de respuestas por intento |
| Servidor | Las respuestas correctas viven en `exam_answer_keys`, sin ningún permiso para clientes |
| Servidor | Una pregunta cada vez (`exam_question`); no se entrega el examen entero |
| Servidor | Registro de eventos y revisión por el instructor (`review`: pendiente, válido, inválido); un intento inválido no cuenta |
| Navegador | Cambios de pestaña o de ventana, copiar, pegar y menú contextual se bloquean o se registran; aviso al salir |
| Navegador | Declaración de honestidad antes de empezar |
| Pendiente | Identidad reforzada (reautenticar con PlacetaID), límites por IP y dispositivo (TECH-015) |
Límite conocido: no se puede impedir que alguien use un segundo dispositivo. Para exámenes de alto valor, combinar con supervisión del centro.

## Cisco
La alta en Cisco depende del tipo de curso. El estado se guarda en `cisco_enrollments` y cada cambio genera una notificación. El proceso real de alta con Cisco Networking Academy está por definir (TECH-016).
