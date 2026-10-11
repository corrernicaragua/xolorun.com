# Traspaso · Encuesta para organizadores

Para Saymond, de parte de Kenneth (11 oct 2026). En esta carpeta está el borrador de la encuesta para organizadores de carreras. Funciona, pero sigue en vista previa: no envía nada mientras `SUPABASE_KEY` esté vacía. Este archivo tiene el prompt para que tu Claude Code aplique las correcciones y la publique en `https://xolorun.com/organizadores/`.

**Recomendado:** corré el prompt **sobre la rama de esta solicitud** (`gh pr checkout <número>`) y fusioná cuando esté verificado. Si la fusionás antes, la página queda visible en vista previa, con el aviso «todavía no envía respuestas».

Contenido de la carpeta:
- `index.html`: el borrador.
- `supabase/0001_encuesta_organizadores.sql`: el esquema. No está aplicado en ningún proyecto.
- `og.jpg` y `herramientas/og.html`: la vista previa del enlace y la página que la genera.
- Íconos de la marca.

La estrategia completa y la razón de cada pregunta están en un repo privado de Kenneth, `gamerbrosz833-ops/xolorun-organizadores`. Pedile acceso si lo necesitás; el prompt ya trae todas las decisiones.

---

## Prompt (copiar desde aquí)

> Vas a terminar y publicar la **encuesta para organizadores de carreras** de Xolo Run en este sitio, en `organizadores/` (URL final `https://xolorun.com/organizadores/`). El borrador ya está en `organizadores/index.html` de esta rama. Lee también `encuesta/index.html`, `index.html`, `landing.css` y `landing.js` de este repo, porque vas a reusar sus componentes.
>
> **Objetivo de la página.** La encuesta tiene tres usos: decidir qué construir primero en el perfil de organizador; obtener datos de negocio (tamaño de eventos, precios, comisiones que ya pagan, horas dedicadas, patrocinios); y servir de herramienta de acercamiento híbrido, ya sea que el equipo la mande por mensaje, la llene junto al organizador o se comparta de forma abierta. Empieza anónima. Al final ofrece, de forma opcional, dejar el contacto para conversar o postularse como **Organizador Fundador**. Siempre se pregunta por el último evento real, no por lo que «le gustaría».
>
> **Correcciones (ya decididas, aplícalas tal cual):**
>
> 1. **Reusar los componentes de la landing, la lista de espera y la encuesta** en lugar de los estilos propios del borrador, para que se sienta parte del mismo sitio. Reusa como mínimo:
>    - Los botones `.cta` y `.go`, con la flecha en círculo y el texto que rueda (`.roll`), y el borde que barre en el botón final.
>    - La casilla que dibuja su marca y el campo con etiqueta flotante de la lista de espera.
>    - El mosaico de opciones y la opción con anillo.
>    - La línea que conecta las pestañas con el punto que viaja.
>    - La pista de corredores en canvas de `encuesta/index.html` (`TrackScene`, `drawRunner`): para la salida y la meta, y si encaja, también como medidor de avance.
>    - El confeti y la medalla de la meta.
>    - Los tokens de color, tipografía y movimiento de `landing.css`.
>
>    Toma del borrador la estructura de datos de las preguntas, la cola sin señal, el `client_id` y el modo de vista previa. La piel y los componentes vienen del sitio.
>
>    Un detalle a conservar: la salida de una pregunta no puede depender solo de que termine la animación (`onfinish`). Ya está resuelto con un temporizador de respaldo, porque con la pestaña oculta la encuesta se trababa.
> 2. **L1 «¿Qué tipo de evento fue?».** No es invasiva: describe el evento, no a la persona ni su dinero. Se conserva, con una ayuda más amable: «Si tuvo varias, elegí la que más te representa.»
> 3. **Preguntas condicionales** (solo aparecen según la respuesta anterior, son opcionales y llevan el botón «Saltar»). Se agregan solo estas:
>    - **L4b**, solo si en L4 marcó «Una plataforma de inscripción de otra empresa»: «¿Te acordás cuál?», en texto corto, con la ayuda «Si no querés decirlo, podés saltarla.». Se pregunta como un dato más del evento.
>    - **L10b**, solo si en L10 marcó «Con chip, contratando a una empresa»: «¿Con qué empresa?», en texto corto y opcional.
>    - **L9b**, solo si en L9 marcó «Hubo filas largas»: «¿Cuánto duraba la fila, más o menos?» (menos de 15 min · 15 a 30 · 30 a 60 · más de 1 hora).
>
>    No agregues otras: más preguntas alargan la encuesta y cualquier pregunta sobre dinero exacto se vuelve invasiva.
> 4. **N4 y la plataforma.** N4 («¿Pagaste por alguna plataforma o servicio para las inscripciones?») se queda. Para que no se repita la pregunta: si en L4 no marcó «plataforma», N4 va igual. Si sí la marcó, N4 cambia a «¿Cómo te cobraba esa plataforma?» (comisión por inscripción · tarifa fija · no me cobraba · no sé), y N5 («cuánto, en proporción») aparece solo si eligió comisión o tarifa fija.
> 5. **Móvil, sobre todo iPhone (Safari).**
>    - Campos de al menos 16 px para que iOS no haga zoom.
>    - `100dvh` y `env(safe-area-inset-*)` en la barra fija de abajo.
>    - La barra de «Siguiente» no debe tapar el campo cuando aparece el teclado: usa `visualViewport` o el desplazamiento del campo enfocado.
>    - Áreas táctiles de 44 px como mínimo, sin efectos que dependan del hover, y `touch-action: manipulation`.
>    - Los atajos de teclado (1–9) solo con puntero fino.
>    - Prueba en 375×812 y 390×844, con letra grande, y con movimiento reducido.
> 6. **L7.** Nueva redacción: «En la semana antes del evento, ¿cuántas horas al día se te iban respondiendo WhatsApp y mensajes de la gente?». Ayuda: «Dudas de inscripción, pagos, tallas, kits… sumando a todo tu equipo. Un aproximado basta.»
> 7. **N8.** Nueva redacción: «Cuando hay que escoger con quién trabajar (inscripciones, cronometraje, camisetas…), ¿quién tiene la última palabra?». Opciones: «Yo» · «Lo decidimos entre socios» · «Un comité o una junta» · «El patrocinador o la institución» · «Otro».
> 8. **Z2.** Cambia «La estoy llenando en una llamada o reunión con Xolo Run» por «La estoy llenando junto a alguien de Xolo Run». Mantén el canal `?c=reunion` para quien la llena junto al organizador.
> 9. **Un hilo discreto hacia el final** (lo más importante del diseño). Los beneficios de fundador no se revelan antes de la meta, pero se insinúan desde el inicio, integrados en la progresión visual de la ruta:
>    - En la portada no se habla de beneficios. Basta una sola línea suave, por ejemplo «Al final de la ruta hay algo pensado para quienes organizan».
>    - La meta de la ruta (el último puesto de control) es un **sello en silueta**, apagado y sin texto legible. Con cada bloque terminado se revela un poco más: primero el contorno, luego el anillo de texto que se va escribiendo y por último el color arcilla. En la meta se completa, gira y se abre la tarjeta de Organizadores Fundadores.
>    - Los avisos de bloque terminado alternan reconocimiento con curiosidad, sin explicar: «Listo: tu perfil.», «Vas por la mitad. Lo mejor está en la meta.», «Último tramo.». Uno por bloque, nunca en cada pregunta.
>    - En escritorio, el riel lateral muestra la meta como «Meta · ?» hasta que se llega.
>
>    La regla es que nada diga «premio», «regalo» ni «beneficios» antes de la meta: la sensación de avance y la curiosidad hacen el trabajo, sin promesas. Respeta `prefers-reduced-motion`: en ese caso, el sello se revela por pasos sin animación.
> 10. **El informe.** Cambia «Recibir el informe de resultados» por «Recibir el resumen de lo que respondieron los organizadores», con la nota «Cifras del sector, sin nombres de nadie». Usa la misma idea en el beneficio «El informe del sector, primero».
> 11. **Quita «Mejor no, gracias»** del formulario de contacto. Quien no quiera dejar contacto ya tiene «Terminar sin dejar contacto» en la pantalla de la meta. En el formulario solo queda «Enviar».
>
> **No cambies:** las claves de las preguntas (O1, L4…) salvo las nuevas (L4b, L9b, L10b), la oferta de fundadores (cinco beneficios, sin precios, sin «gratis», sin descuentos), el aviso del filtro («No todas entran en la primera ronda… Postularte no tiene costo ni te compromete a nada»), el «En construcción» al mostrar lo que hacemos, el tono (voseo nicaragüense, sin emojis) y la separación entre respuestas anónimas y contacto.
>
> **Base de datos.** Aplica `organizadores/supabase/0001_encuesta_organizadores.sql` en el proyecto de Supabase del sitio, el mismo de la encuesta y la lista de espera, como migración nueva en `runapp/supabase/migrations/` con el número que siga. Antes:
> - Agrega `L4B`, `L9B` y `L10B` como claves válidas. Ya cumplen el patrón `^[A-Z][A-Z0-9]{1,3}$`: guárdalas en mayúsculas.
> - Para contar visitas, reusa `track_hit` con `p_site: 'organizadores'` en lugar de crear `organizer_funnel`, si `track_hit` ya cubre los eventos `visita`, `inicio`, `fin`, `contacto` y `compartir`.
> - Corre `get_advisors` de seguridad después de aplicar.
>
> Después pon en la página `SUPABASE_URL` y la clave publicable de ese proyecto (hoy apunta a un proyecto de prueba de Kenneth). Cuando la migración viva en `runapp`, borra `organizadores/supabase/` de este repo.
>
> **Aviso de privacidad (Ley 787).** Muestra lo que hoy está en `PRIVACY`: responsable «Xolo Run, proyecto nicaragüense en formación», contacto Instagram @xolorun y retención de 24 meses. Kenneth tiene que confirmar esos tres datos antes de difundir; si no están confirmados, publica con ellos y avísale.
>
> **Publicación.**
> - Pon el `og:image` absoluto: `https://xolorun.com/organizadores/og.jpg`. Cambia también `og:url` y `canonical`.
> - Decide con Kenneth si la landing lleva un enlace a la encuesta (por ejemplo en el pie o en «Preguntas»). No agregues una pestaña nueva sin acordarlo.
> - Publica con `publicar.sh`. Prueba con `?c=prueba`, que no cuenta en los números.
>
> **Verificación antes de dar por terminado:**
> - El recorrido completo para quien ya organizó y para quien prepara su primer evento, incluidas las tres condicionales.
> - El formulario: errores, foco y envío real con `?c=prueba`, comprobando que la fila aparece en `organizer_leads` y la respuesta en `organizer_responses`.
> - Sin señal, se envía solo al volver la conexión.
> - Vista de iPhone con teclado abierto y con letra grande, y movimiento reducido.
> - Cero errores de consola.
>
> Al terminar, borra las filas de prueba, anota en el CHANGELOG qué publicaste y borra este `TRASPASO.md`.

## Fin del prompt

---

**Estado probado del borrador** (11 oct 2026, vista previa local, sin envíos):
- Recorrido de 28 preguntas para quien ya organizó y de 9 para quien prepara su primer evento.
- El formulario muestra el resumen de errores y lleva el foco donde corresponde.
- El envío está simulado y funciona en teléfono y escritorio, sin errores de consola.

**Pendientes que no son de código:**
- Que Kenneth confirme el aviso de privacidad.
- Definir quién del equipo lleva cada contacto (`owner`).
- El video para la publicación dirigida a organizadores.
