# ADR 0002: nivel DEVAI 2 para PlacetaEDU
**Estado:** decidido por la skill DEVAI el 2026-11-22; pendiente de ratificación por el responsable (Mikel Alegre Marcos).
**Decisión: nivel 2.**
**Motivos:** la plataforma trata datos personales de estudiantes (algunos menores, a través de centros), cuentas con roles, pagos de matrícula simbólica y certificados. No trata categorías especiales de datos ni opera a escala masiva sobre menores de 14 años ni gestiona dinero propio. Esto pide controles de nivel estándar: RLS, MFA en administración, axe y presupuesto de rendimiento en CI, revisión por otra persona.
**Cuándo pasar a nivel 3** (reevaluar antes de activarlo): recompensas en Pz o becas con Banco de La Placeta (TECH-013); menores de 14 años como usuarios directos; datos de categorías especiales; o una evaluación de impacto (EIPD) que lo exija.
**Límite de esta decisión:** la skill no incluye el texto del Art. 6 del Manual con las definiciones de cada nivel. La decisión se basa en el resumen de controles por nivel que sí contiene (Art. 55-57) y debe contrastarse con el Manual completo.
