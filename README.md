# xolorun.com

La landing de Xolo Run: el enlace de la bio de Instagram. Una sola página con tres pestañas:

- **Inicio** (`/#inicio`): qué es Xolo Run y lo que nos contaron las personas que respondieron la encuesta.
- **Encuesta** (`/#encuesta`): la encuesta de descubrimiento, que vive en este mismo sitio en `/encuesta/` (carpeta `encuesta/`; también funciona sola, por ejemplo desde el QR del cartel).
- **Lista de espera** (`/#lista`): anotarse y recibir el número en la fila (Supabase, RPC `join_waitlist`).

Estático, sin build: `index.html`, `landing.css`, `landing.js`, `marca/` (logos e íconos), `og.jpg`. Se publica con GitHub Pages desde `main` en `xolorun.com` (archivo `CNAME`).

Enlaces con atribución: `?c=<canal>&campana=<campaña>&creator=<quién>&ref=<código>` y la pestaña al final (`#lista`, `#encuesta`). Las pruebas se hacen con `?c=prueba` (no se asigna número).
