# xolorun.com

La landing de Xolo Run: el enlace de la bio de Instagram. Una sola página con tres pestañas:

- **Inicio** (`/#inicio`): qué es Xolo Run y lo que nos contaron las personas que respondieron la encuesta.
- **Encuesta** (`/#encuesta`): la encuesta de descubrimiento, que vive en este mismo sitio en `/encuesta/` (carpeta `encuesta/`; también funciona sola, por ejemplo desde el QR del cartel).
- **Lista de espera** (`/#lista`): anotarse y recibir el número en la fila (Supabase, RPC `join_waitlist`).

Aparte, sin pestaña en la landing:

- **Encuesta para organizadores** (`/organizadores/`): para quienes organizan carreras de running. Pregunta por el último evento real; las respuestas son anónimas (`organizer_responses`) y al final se puede dejar el contacto o postularse como Organizador Fundador (`submit_organizer_lead`, tabla `organizer_leads`). El esquema es la migración `0017_encuesta_organizadores.sql` de `runapp`. Enlaces con `?c=<canal>` y `?ref=<quién del equipo>`; `?c=reunion` cuando se llena hablando con el equipo. Las visitas se suman con `track_hit` (`site = 'organizadores'`).

Estático, sin build: `index.html`, `landing.css`, `landing.js`, `marca/` (logos e íconos), `og.jpg`. Se publica con GitHub Pages desde `main` en `xolorun.com` (archivo `CNAME`).

Enlaces con atribución: `?c=<canal>&campana=<campaña>&creator=<quién>&ref=<código>` y la pestaña al final (`#lista`, `#encuesta`). Las pruebas se hacen con `?c=prueba` (no se asigna número).
