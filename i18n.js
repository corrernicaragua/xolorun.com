/* Xolo Run · español e inglés en la landing, sin paso de compilación.
   El HTML queda en español (la fuente). Este archivo trae el diccionario en inglés y, si el idioma elegido es «en»,
   traduce cada nodo de texto al cargar (antes de que landing.js parta los títulos en palabras) y vigila el DOM con un
   MutationObserver para traducir lo que landing.js inserta después (mensajes de error, resultado, dorsal, cifras).
   El idioma se guarda en localStorage (xr-lang); ?lang=en|es lo fija desde un enlace. Cambiar de idioma recarga la
   página para que las animaciones y las palabras partidas se rehagan limpias.
   Textos que no están en el DOM (imagen para historias, texto de WhatsApp, título de la pestaña) usan window.XR_T. */
(() => {
  const EN = {
    // ─── cabecera, pestañas y pie ───
    'Xolo Run · Todas las carreras de Nicaragua, en un solo lugar': "Xolo Run · All of Nicaragua's races, in one place",
    'Ir al contenido': 'Skip to content', 'Nosotros': 'About us', 'Preguntas': 'FAQ', 'Aviso de privacidad': 'Privacy notice',
    'Inicio': 'Home', 'Encuesta': 'Survey', 'Lista de espera': 'Waitlist',
    'Xolo Run · Nicaragua. Hecho por gente que corre.': 'Xolo Run · Nicaragua. Made by people who run.',
    'Mismas rutas. Más gente.': 'Same routes. More people.', 'Xolo Run · Nicaragua': 'Xolo Run · Nicaragua',
    // ─── portada ───
    'Running en Nicaragua': 'Running in Nicaragua',
    'Inscribirte no debería ser una carrera.': "Signing up shouldn't be a race.",
    'Xolo Run es la app para las carreras de Nicaragua: las encontrás, te inscribís, pagás y llevás tu dorsal en el teléfono, todo en un solo lugar. Todavía no sale. Anotate y te avisamos primero.':
      "Xolo Run is the app for Nicaragua's races: find them, sign up, pay and carry your bib on your phone, all in one place. It isn't out yet. Join the list and we'll tell you first.",
    'Quiero mi dorsal': 'I want my bib', 'Ver cómo funciona': 'See how it works', 'Próximamente en': 'Coming soon on',
    'personas ya tienen su dorsal': 'people already have their bib',
    // el teléfono del caos y las pantallas de muestra
    '¿Hay cupos todavía?': 'Any spots left?', 'Mandé la foto ayer': 'Sent the photo yesterday', 'Se acabaron los cupos': 'Spots sold out',
    '¿Te confirmaron?': 'Did they confirm?', 'Sin señal aquí': 'No signal here', 'Notificaciones': 'Notifications', 'Organización': 'Organizers',
    'Foto del comprobante, por favor': 'Photo of the receipt, please', 'Grupo Corredores 10K': '10K Runners group', '¿Todavía hay cupos?': 'Any spots left?',
    '¿Me mandás la captura?': 'Can you send me the screenshot?', '¿Ya te confirmaron?': 'Did they confirm you yet?', 'Batería': 'Battery', 'Queda 5 %': '5 % left',
    'Quedan pocos cupos': 'Few spots left', 'Yo pagué y todavía nada': 'I paid and still nothing', '¿Alguien sabe dónde pagar?': 'Anyone know where to pay?',
    'Carreras': 'Races', 'Todas': 'All', 'Media maratón': 'Half marathon', 'Domingo · 05:30 · Managua': 'Sunday · 05:30 · Managua', 'Carrera 10K': '10K race',
    'Sábado · 06:00 · Granada': 'Saturday · 06:00 · Granada', 'Carrera 5K': '5K race', 'Domingo · 06:00 · León': 'Sunday · 06:00 · León',
    'Reto de la semana': 'Challenge of the week', 'de 25 km': 'of 25 km', 'Crews cerca de tu zona': 'Crews near you', 'Crew madrugador': 'Early-bird crew',
    'Managua · Sábado 05:30': 'Managua · Saturday 05:30', 'Unido': 'Joined', 'Crew de domingo': 'Sunday crew', 'Masaya · Domingo 05:45': 'Masaya · Sunday 05:45',
    'Unirme': 'Join', 'Crew nocturno': 'Night crew', 'Granada · Miércoles 18:00': 'Granada · Wednesday 18:00', 'Sin señal': 'No signal', 'Mi dorsal': 'My bib',
    '21K · Categoría libre': '21K · Open category', 'Pago confirmado': 'Payment confirmed', 'Mostrá este QR en la entrega de kits.': 'Show this QR at kit pickup.',
    'Tu dorsal funciona sin conexión.': 'Your bib works offline.', 'Kit entregado': 'Kit delivered', 'Cerca de tu zona': 'Near you',
    'Inscripción · paso 2 de 3': 'Registration · step 2 of 3', 'Distancia': 'Distance', 'Talla de camiseta': 'Shirt size', 'Contacto de emergencia': 'Emergency contact',
    'Listo': 'Done', 'Continuar al pago': 'Continue to payment', 'Inscripción · paso 3 de 3': 'Registration · step 3 of 3', 'Pago por transferencia': 'Bank transfer payment',
    'Tu comprobante': 'Your receipt', 'Subido desde la app': 'Uploaded from the app', 'Comprobante enviado': 'Receipt sent', 'Revisado por el equipo del evento': 'Reviewed by the event team',
    'Tu dorsal ya está en la app.': 'Your bib is already in the app.', 'Salida': 'Start', 'Meta': 'Finish',
    // ─── lo que nos contaron ───
    'Hoy, inscribirse a una carrera': 'Signing up for a race today',
    'Lo que nos contaron 179 personas que corren en Nicaragua': 'What 179 people who run in Nicaragua told us',
    'Antes de construir, preguntamos. Estas son sus respuestas, con su base. Son el mapa de lo que Xolo Run tiene que resolver.':
      'Before building, we asked. These are their answers, with their base. They map what Xolo Run has to solve.',
    'Encuesta «Running en Nicaragua», respuestas completas del 6 al 8 de octubre de 2026, sin las pruebas del equipo. Los porcentajes son sobre quienes respondieron cada pregunta.':
      '«Running in Nicaragua» survey, complete responses from 6 to 8 October 2026, excluding team tests. Percentages are of those who answered each question.',
    'Sumate a la encuesta': 'Take the survey',
    'quiso inscribirse a una carrera en el último año y al final no lo hizo.': "wanted to sign up for a race in the last year and in the end didn't.",
    'Qué pasó': 'What happened', 'La fecha no le quedaba': "The date didn't work", 'Se enteró tarde': 'Found out too late', 'No tenía con quién ir': 'Had nobody to go with',
    'Base: 88 que ya corrieron una carrera; razones de las 63 que no se inscribieron.': "Base: 88 who have run a race; reasons from the 63 who didn't sign up.",
    'Ves cada carrera con tiempo y te inscribís en pocos pasos.': 'You see every race in time and sign up in a few steps.',
    'de quienes pagaron por transferencia tuvo que mandar foto del comprobante para que le confirmaran.': 'of those who paid by bank transfer had to send a photo of the receipt to get confirmed.',
    'Cómo pagó su última carrera': 'How they paid for their last race', 'Transferencia': 'Bank transfer', 'Fue gratis': 'It was free', 'Tarjeta en línea': 'Card online', 'Efectivo': 'Cash',
    'Base: 41 que pagaron por transferencia. El 46 % de quienes pagaron no quedó confirmado al instante.': "Base: 41 who paid by transfer. 46 % of those who paid weren't confirmed right away.",
    'Subís tu comprobante en la app y ves el estado de tu pago.': 'You upload your receipt in the app and see your payment status.',
    'tuvo un problema la última vez que mostró algo en el teléfono en la calle.': 'had a problem the last time they showed something on their phone outdoors.',
    'Qué le pasó': 'What happened', 'El sol no dejaba ver': "Couldn't see in the sun", 'No había señal ni datos': 'No signal or data', 'La batería estaba baja': 'Battery was low',
    'Base: 122 a quienes les tocó mostrar algo. El 21 % esperó más de 30 minutos por su kit.': 'Base: 122 who had to show something. 21 % waited over 30 minutes for their kit.',
    'Tu dorsal con QR funciona sin conexión, y el kit se entrega con un escaneo.': 'Your QR bib works offline, and kits are handed out with one scan.',
    'nunca ha estado en un grupo para salir a correr o caminar.': 'have never been in a group to go running or walking.',
    'Por qué no': 'Why not', 'No conoce ninguno cerca': "Don't know one nearby", 'No lo había pensado': "Hadn't thought about it", 'Prefiere ir sin grupo': 'Prefer going without a group',
    'Los horarios no le quedan': "The schedules don't work", 'Base: 179. El 55 % salió sin compañía la última vez.': 'Base: 179. 55 % went out alone last time.',
    'Crews por zona y un reto cada semana, para que nadie corra solo.': 'Crews by area and a weekly challenge, so nobody runs alone.',
    // ─── la ruta ───
    'Así es con Xolo Run': 'This is how it goes with Xolo Run', 'Paso 1': 'Step 1', 'Paso 2': 'Step 2', 'Paso 3': 'Step 3', 'Paso 5': 'Step 5', 'Paso 6': 'Step 6',
    'Paso 4 · El tramo de encuentro': 'Step 4 · The meeting stretch', 'La meta': 'The finish',
    'Encontrás tu carrera.': 'You find your race.',
    'Todas las carreras de Nicaragua, en un solo lugar. Las de tu zona, primero, y con tiempo para decidir.': "All of Nicaragua's races in one place. The ones near you first, with time to decide.",
    'Te inscribís desde el teléfono.': 'You sign up from your phone.',
    'Distancia, talla y contacto de emergencia en pocos pasos. Tus datos quedan guardados para la próxima.': 'Distance, shirt size and emergency contact in a few steps. Your details are saved for next time.',
    'Pagás. Confirmado.': 'You pay. Confirmed.',
    'Subís tu comprobante en la app y ves el estado de tu pago. Sin capturas por chat, sin preguntar si llegó.': 'Upload your receipt in the app and see your payment status. No screenshots over chat, no asking whether it arrived.',
    'Tu crew te espera.': 'Your crew is waiting.',
    'Tu dorsal, aunque no haya señal.': 'Your bib, even without signal.',
    'Tu dorsal con QR funciona sin conexión, con sol directo y con poca batería.': 'Your QR bib works offline, in direct sun and on low battery.',
    'Recogés tu kit con un escaneo.': 'You pick up your kit with one scan.',
    'El equipo del evento escanea tu QR y listo. Sin lista de papel ni comprobante impreso.': "The event team scans your QR and that's it. No paper list, no printed receipt.",
    'Tu única preocupación:': 'Your only worry:', 'correr.': 'running.',
    'La ruta que recorriste es nuestro logo. Mismas rutas. Más gente.': 'The route you just ran is our logo. Same routes. More people.',
    // ─── el trato ───
    'Mientras la construimos': 'While we build it', 'Un trato claro entre quienes corren y nosotros': 'A clear deal between runners and us',
    'Lo que te damos': 'What you get', 'Tu número en la fila': 'Your number in line',
    'Un dorsal con tu nombre, tu zona y tu lugar. Es tuyo desde hoy.': 'A bib with your name, your area and your spot. Yours from today.',
    'El aviso antes que nadie': 'The heads-up before anyone',
    'Cuando Xolo Run abra, te escribimos primero por WhatsApp o por correo.': 'When Xolo Run opens, we message you first on WhatsApp or by email.',
    'Gente de tu zona': 'People near you',
    'Si querés, te invitamos al grupo de WhatsApp de tu zona cuando lo abramos.': "If you want, we'll invite you to your area's WhatsApp group when we open it.",
    'Tu enlace para tu crew': 'Your link for your crew',
    'El QR de tu dorsal es tu enlace: quien lo escanee se anota con vos.': 'The QR on your bib is your link: whoever scans it joins the line with you.',
    'Lo que te pedimos': 'What we ask', 'Un minuto': 'One minute',
    'Tu nombre, dónde corrés, cómo corrés y un contacto. Nada más.': 'Your name, where you run, how you run and one contact. Nothing else.',
    'Tu historia, si podés': 'Your story, if you can',
    'La encuesta es anónima y dura de 3 a 8 minutos. Con ella decidimos qué construir primero.': 'The survey is anonymous and takes 3 to 8 minutes. It decides what we build first.',
    'Que corrás la voz': 'Spread the word',
    'Compartí tu enlace con quien corre con vos. Más gente en la fila, más carreras en la app.': 'Share your link with the people you run with. More people in line, more races in the app.',
    'Sin promesas que no podamos cumplir': "No promises we can't keep",
    'No anunciamos fechas, cupos ni precios hasta que sean seguros. No vendemos ni compartimos tus datos, y podés pedir que los borremos cuando querás.':
      "We don't announce dates, spots or prices until they're certain. We don't sell or share your data, and you can ask us to delete it whenever you want.",
    // ─── dos caminos y tiendas ───
    'Dos caminos, los dos cortos': 'Two paths, both short', 'Elegí por dónde empezar': 'Choose where to start', 'Reclamá tu dorsal': 'Claim your bib',
    'Tu número en la fila, el aviso cuando abramos y tu enlace para invitar a tu crew.': 'Your number in line, the heads-up when we open and your link to invite your crew.',
    'Encuesta «Running en Nicaragua»': '«Running in Nicaragua» survey', 'Contanos cómo corrés': 'Tell us how you run',
    'Anónima, de 3 a 8 minutos. Sirve aunque no corrás carreras. 179 personas ya respondieron.': "Anonymous, 3 to 8 minutes, in Spanish. Useful even if you don't race. 179 people have already answered.",
    'Responder la encuesta': 'Take the survey', 'La app': 'The app',
    'Próximamente en App Store y Google Play.': 'Coming soon on the App Store and Google Play.',
    'Sin fecha todavía: no la anunciamos hasta que sea segura. Quienes están en la lista se enteran primero.': "No date yet: we won't announce one until it's certain. People on the list hear first.",
    // ─── pestaña encuesta ───
    'Contanos cómo corrés.': 'Tell us how you run.',
    'Anónima, de 3 a 8 minutos. Sirve aunque no corrás carreras. Con lo que nos contés decidimos qué construir primero.': "Anonymous, 3 to 8 minutes, in Spanish for now. Useful even if you don't race. What you tell us decides what we build first.",
    '179 personas ya respondieron': '179 people have already answered', 'No pedimos tu nombre ni tu contacto': "We don't ask for your name or contact",
    'Se guarda sola: podés seguir después': 'It saves itself: you can continue later',
    'Anónima · de 3 a 8 minutos · sirve aunque no corrás carreras': 'Anonymous · 3 to 8 minutes · in Spanish for now',
    'Abrir en otra pestaña': 'Open in a new tab', 'Cargando la encuesta…': 'Loading the survey…', 'Si no aparece, abrila aquí': "If it doesn't show, open it here",
    // ─── lista de espera ───
    'Nº en la fila': 'No. in line', 'Sin número todavía': 'No number yet', 'Tu nombre': 'Your name', 'Tu zona': 'Your area', 'Sin reclamar': 'Unclaimed',
    'QR · tu enlace': 'QR · your link', 'Ya hay': 'There are already', 'personas en la fila': 'people in line',
    'Tu dorsal te espera': 'Your bib is waiting',
    'Cada respuesta se imprime en tu dorsal. Al final te damos tu número en la fila y te avisamos primero cuando abramos.': "Every answer gets printed on your bib. At the end you get your number in line, and we'll tell you first when we open.",
    '¿Cómo te llamamos?': 'What should we call you?', 'Así aparece en tu dorsal.': 'This is how it appears on your bib.', 'Seguir': 'Next', 'Atrás': 'Back',
    '¿Dónde corrés?': 'Where do you run?', '¿Cómo corrés hoy?': 'How do you run today?', '¿Dónde te avisamos?': 'Where should we reach you?',
    'Tu WhatsApp': 'Your WhatsApp', 'Tu correo': 'Your email',
    'Son 8 dígitos, como 8888 8888. Te avisamos cuando abramos. Nada más.': "8 digits, like 8888 8888. We'll message you when we open. Nothing else.",
    'Te avisamos por correo cuando abramos. Nada más.': "We'll email you when we open. Nothing else.",
    'Prefiero dejar mi correo': "I'd rather leave my email", 'Prefiero dejar mi WhatsApp': "I'd rather leave my WhatsApp",
    'Quiero entrar al grupo de WhatsApp de mi zona cuando lo abramos.': "I want to join my area's WhatsApp group when it opens.",
    'Acepto que Xolo Run guarde estos datos para avisarme del lanzamiento y del piloto. Puedo pedir que los borren cuando quiera.': 'I agree that Xolo Run keeps this data to notify me about the launch and the pilot. I can ask for it to be deleted at any time.',
    'Recibir mi número': 'Get my number', 'Para anotarte necesitás activar JavaScript en tu navegador.': 'To join the list you need JavaScript enabled in your browser.',
    'León o Chinandega': 'León or Chinandega', 'El Norte': 'The North', 'Otra zona': 'Another area', 'Fuera de Nicaragua': 'Outside Nicaragua',
    'Estoy empezando o quiero empezar': "I'm starting or want to start", 'Corro por salud o por gusto': 'I run for health or for fun', 'Entreno para carreras': 'I train for races',
    'Organizo carreras o un crew': 'I organize races or a crew', 'Acompaño a alguien que corre': 'I accompany someone who runs',
    '¿Cómo te llamamos? Basta tu nombre.': 'What should we call you? Your first name is enough.', 'Elegí dónde corrés.': 'Choose where you run.',
    'Elegí la que más se parezca a vos.': 'Choose the one that fits you best.', 'Escribí tu correo para avisarte.': 'Enter your email so we can reach you.',
    'Escribí tu WhatsApp para avisarte.': 'Enter your WhatsApp so we can reach you.',
    'Revisá el correo: falta algo, como la @ o el dominio.': "Check the email: something's missing, like the @ or the domain.",
    'Revisá el número: son 8 dígitos, como 8888 8888. Si no es de Nicaragua, empieza con + y el código del país.': "Check the number: 8 digits, like 8888 8888. If it isn't a Nicaraguan number, start with + and your country code.",
    'Para anotarte necesitamos tu permiso para guardar estos datos.': 'To join we need your permission to keep this data.',
    'Guardando tu lugar…': 'Saving your spot…',
    'No pudimos guardar tus datos. Revisá que estén bien escritos e intentá otra vez.': "We couldn't save your details. Check them and try again.",
    'No pudimos guardar tu lugar': "We couldn't save your spot",
    'Algo en los datos no pasó. Volvé a llenar el formulario, toma un minuto.': "Something in the details didn't go through. Fill in the form again, it takes a minute.",
    'Volver a intentarlo': 'Try again', 'Tu lugar está apartado': 'Your spot is saved',
    'Lo guardamos en este teléfono y lo enviamos apenas tengás señal. Si podés, no cerrés esta página hasta ver tu número.': 'We saved it on this phone and will send it as soon as you have signal. If you can, keep this page open until you see your number.',
    'Ya estabas en la fila': 'You were already in line', 'Prueba guardada': 'Test saved', 'Las pruebas del equipo no reciben número en la fila.': "Team tests don't get a number in line.",
    'Listo. Nos vemos en la ruta.': 'Done. See you on the route.', 'Invitar a mi crew': 'Invite my crew', 'Guardar mi dorsal para historias': 'Save my bib for Stories',
    'Copiar mi enlace': 'Copy my link', 'Enlace copiado': 'Link copied', '¿Nos ayudás con unos minutos?': 'Can you spare a few minutes?',
    'Respondé la encuesta «Running en Nicaragua». Es anónima y nos ayuda a diseñar la app con lo que de verdad pasa.': "Take the «Running in Nicaragua» survey (in Spanish). It's anonymous and helps us design the app around what really happens.",
    'Dorsal reclamado': 'Bib claimed', 'Tu dorsal está en camino': 'Your bib is on its way', 'Tu dorsal ya es tuyo': 'Your bib is yours', 'En la fila': 'In line',
    'Preparando tu dorsal…': 'Preparing your bib…', 'Tu dorsal para historias': 'Your bib for Stories',
    'Mantené presionada la imagen y elegí «Guardar imagen». Después subila a tu historia.': 'Press and hold the image and choose «Save image». Then post it to your story.',
    'Me anoté en Xolo Run, la app para las carreras de Nicaragua': "I joined Xolo Run, the app for Nicaragua's races", ', y tengo el #': ", and I'm #", ' en la fila': ' in line', '. Sacá tu dorsal: ': '. Get your bib: ',
    'Ya tengo': "I've got", 'mi dorsal': 'my bib', 'LISTA DE ESPERA': 'WAITLIST', 'Nº EN LA FILA': 'NO. IN LINE', 'QR · ESCANEALO Y ANOTATE': 'QR · SCAN IT AND JOIN', 'Sacá tu dorsal aquí': 'Get your bib here',
    'Encuesta · Xolo Run': 'Survey · Xolo Run', 'Lista de espera · Xolo Run': 'Waitlist · Xolo Run', 'en confirmación': 'pending',
    // ─── preguntas y aviso ───
    '¿Qué es Xolo Run?': 'What is Xolo Run?',
    'Una app para las carreras de Nicaragua: ver todas en un solo calendario, inscribirte y pagar desde el teléfono, llevar tu dorsal con QR y recoger tu kit con un escaneo. También crews por zona y un reto cada semana.':
      "An app for Nicaragua's races: see them all in one calendar, sign up and pay from your phone, carry your QR bib and pick up your kit with one scan. Plus crews by area and a weekly challenge.",
    '¿Cuándo sale?': 'When does it launch?',
    'Todavía no tiene fecha. Quienes están en la lista se enteran primero, y no vamos a anunciar una fecha hasta que sea segura.': "No date yet. People on the list hear first, and we won't announce a date until it's certain.",
    '¿Cuesta algo anotarme?': 'Does joining cost anything?', 'No. Anotarte en la lista no cuesta nada y no te compromete a nada.': 'No. Joining the list is free and commits you to nothing.',
    '¿La encuesta y la lista son lo mismo?': 'Are the survey and the list the same thing?',
    'No. La encuesta es anónima: nos cuenta cómo se vive correr aquí. La lista de espera guarda tu contacto para avisarte. Podés hacer una, las dos o ninguna.':
      'No. The survey is anonymous: it tells us how running is lived here. The waitlist keeps your contact so we can reach you. You can do one, both or neither.',
    '¿Qué hacen con mis datos?': 'What do you do with my data?',
    'Los usamos solo para avisarte del lanzamiento y del piloto y, si lo marcaste, para invitarte al grupo de WhatsApp de tu zona. No los vendemos ni los compartimos. Podés pedir que los borremos cuando querás. El detalle está en el':
      "We use it only to notify you about the launch and the pilot and, if you ticked it, to invite you to your area's WhatsApp group. We don't sell or share it. You can ask us to delete it whenever you want. The details are in the",
    'aviso de privacidad': 'privacy notice', '¿Quiénes están detrás de Xolo Run?': 'Who is behind Xolo Run?',
    'Tres nicaragüenses: Saymond Montoya (producto y tecnología), Kenneth Rosales (operaciones y cumplimiento) y Bigarny Gutiérrez (comercial y alianzas). Nuestra misión, visión y valores están en':
      'Three Nicaraguans: Saymond Montoya (product and technology), Kenneth Rosales (operations and compliance) and Bigarny Gutiérrez (sales and partnerships). Our mission, vision and values are in',
    'Organizo carreras o tengo un crew': 'I organize races or have a crew',
    'Al anotarte, marcá «Organizo carreras o un crew» y te escribimos para contarte cómo funciona Xolo Run para organizadores y crews.': "When you join, tick «I organize races or a crew» and we'll write to tell you how Xolo Run works for organizers and crews.",
    'Aviso de privacidad de la lista de espera': 'Waitlist privacy notice', 'Responsable': 'Controller', 'Qué guardamos': 'What we keep',
    'Tu nombre, tu WhatsApp o tu correo, tu zona, cómo corrés, si querés entrar al grupo de tu zona y el enlace por el que llegaste.': "Your name, your WhatsApp or email, your area, how you run, whether you want to join your area's group and the link you arrived through.",
    'Para qué': 'What for',
    'Para avisarte del lanzamiento y del piloto de Xolo Run, invitarte al grupo de WhatsApp de tu zona si lo pediste y saber qué canales funcionan. No vendemos ni compartimos tus datos.':
      "To notify you about Xolo Run's launch and pilot, invite you to your area's WhatsApp group if you asked, and learn which channels work. We don't sell or share your data.",
    'Dónde': 'Where', 'En una base de datos de Supabase, en servidores de Estados Unidos, con acceso solo del equipo de Xolo Run.': 'In a Supabase database on servers in the United States, accessible only to the Xolo Run team.',
    'Cuánto tiempo': 'How long', 'Visitas': 'Visits',
    'Contamos las visitas al sitio en nuestra propia base, solo como sumas por día, canal, tipo de dispositivo y país. Sin cookies, sin dirección IP ni nada que identifique a una persona.':
      'We count site visits in our own database, only as daily totals by channel, device type and country. No cookies, no IP addresses, nothing that identifies a person.',
    'Tus derechos': 'Your rights',
    'Podés pedir ver, corregir o borrar tus datos, o retirar tu permiso, en cualquier momento (Ley 787 de Protección de Datos Personales). Escribinos a': 'You can ask to see, correct or delete your data, or withdraw your permission, at any time (Law 787 on Personal Data Protection). Write to us at',
    'Versión': 'Version', 'Cerrar': 'Close',
    // fuera del DOM (landing.js los pide con XR_T)
    'Mi dorsal de Xolo Run': 'My Xolo Run bib', 'Tu dorsal de Xolo Run con tu número y tu QR': 'Your Xolo Run bib with your number and your QR',
    // atributos de la landing (meta, og, aria-label)
    'Xolo Run es la app para las carreras de Nicaragua: las encontrás, te inscribís, pagás y llevás tu dorsal en el teléfono. Todavía no sale: anotate en la lista de espera o contanos cómo corrés.':
      "Xolo Run is the app for Nicaragua's races: find them, sign up, pay and carry your bib on your phone. It isn't out yet: join the waitlist or tell us how you run.",
    'Xolo Run · Mismas rutas. Más gente.': 'Xolo Run · Same routes. More people.',
    'La app para las carreras de Nicaragua. Todavía no sale: anotate y te avisamos primero.': "The app for Nicaragua's races. Not out yet: join the list and we'll tell you first.",
    'Xolo Run, inicio': 'Xolo Run, home', 'Secciones': 'Sections', 'Cifras de la encuesta': 'Survey figures', 'Dónde va a estar la app': 'Where the app will be',
    // ─── página Nosotros (nosotros/index.html) ───
    'Nosotros · Xolo Run': 'About us · Xolo Run',
    'Misión, visión, valores y el equipo detrás de Xolo Run, la app nicaragüense que reúne las carreras del país en un solo lugar.': "Mission, vision, values and the team behind Xolo Run, the Nicaraguan app that brings the country's races together in one place.",
    'Misión, visión, valores y el equipo detrás de Xolo Run.': 'Mission, vision, values and the team behind Xolo Run.',
    'Xolo Run, ir al inicio': 'Xolo Run, go to home', 'Especialidades': 'Specialties',
    'Por qué hacemos Xolo Run': 'Why we make Xolo Run',
    'Somos una app nicaragüense para quienes corren y para quienes organizan las carreras. La construimos a partir de lo que nos cuenta la gente que corre aquí.':
      "We're a Nicaraguan app for people who run and for people who organize races. We build it from what the people who run here tell us.",
    'Misión': 'Mission', '· lo que hacemos': '· what we do', 'Visión': 'Vision', '· hacia dónde vamos': "· where we're going",
    'Ayudar a corredores y organizadores de Nicaragua a encontrar, inscribirse y vivir las carreras en un solo lugar, de forma clara, sin trámites y junto a su gente.':
      'To help runners and organizers in Nicaragua find, sign up for and live the races in one place, clearly, without paperwork and alongside their people.',
    'Ser la casa del running en Nicaragua: donde se organizan, se inscriben y se consultan las carreras, y donde cada corredor lleva su historia.':
      'To be the home of running in Nicaragua: where races are organized, signed up for and looked up, and where every runner carries their story.',
    'Nuestros valores': 'Our values', 'Cómo queremos hacer las cosas': 'How we want to do things', 'Así no': 'Not like this',
    'Claros': 'Clear', 'Decimos lo que hacemos y lo que cuesta, sin letra chica.': 'We say what we do and what it costs, no fine print.', 'Promesas vagas.': 'Vague promises.',
    'Fieles a lo real': "True to what's real", 'Personas reales con su permiso, carreras confirmadas y cifras con su fuente.': 'Real people with their permission, confirmed races and figures with their source.',
    'Testimonios, fechas o aliados inventados.': 'Made-up testimonials, dates or partners.',
    'Juntos': 'Together', 'Correr es mejor acompañado. Cada ruta es un punto de encuentro entre personas, barrios y crews.': 'Running is better with company. Every route is a meeting point between people, neighbourhoods and crews.',
    'Cada quien por su lado.': 'Everyone on their own.',
    'Cercanos': 'Approachable', 'Hablamos como la gente, con lenguaje de corredor.': "We talk like people do, in runners' language.", 'Tono frío o de trámite.': 'A cold, bureaucratic tone.',
    'Orgullo nicaragüense': 'Nicaraguan pride', 'Lo de aquí es nuestra fortaleza: rutas, lugares y gente.': "What's from here is our strength: routes, places and people.", 'Folclor de postal.': 'Postcard folklore.',
    'Cuidadosos en el detalle': 'Careful with the details', 'Pocas cosas, bien hechas. La calidad se nota.': 'Few things, done well. Quality shows.', 'Hacer por cumplir.': 'Doing it just to tick the box.',
    'El equipo': 'The team', 'Tres personas de aquí, una misma ruta': 'Three people from here, one shared route',
    'Los tres estudiamos ingeniería industrial: lo nuestro es ordenar procesos y quitar los pasos que sobran. Venimos de años en operaciones, pagos y atención al cliente en fintech, software como servicio, logística y el mundo corporativo, y ahora lo ponemos al servicio de las carreras de Nicaragua.':
      "All three of us studied industrial engineering: our thing is putting processes in order and removing the steps that get in the way. We come from years in operations, payments and customer service in fintech, software as a service, logistics and the corporate world, and now we put that to work for Nicaragua's races.",
    'Producto': 'Product', 'Operaciones': 'Operations', 'Comercial': 'Sales', 'En Xolo Run': 'At Xolo Run', 'De dónde viene': 'Background',
    'Cofundador · Producto y tecnología': 'Co-founder · Product and technology', 'Cofundador · Operaciones y cumplimiento': 'Co-founder · Operations and compliance', 'Cofundador · Comercial y alianzas': 'Co-founder · Sales and partnerships',
    'Diseña y construye la app, para que encontrar una carrera, inscribirte y llevar tu dorsal sea simple.': 'Designs and builds the app, so that finding a race, signing up and carrying your bib is simple.',
    'Más de cinco años en software como servicio (SaaS) y seguros: automatiza operaciones con datos e inteligencia artificial y coordina lanzamientos con equipos de desarrollo. Antes dio soporte técnico a clientes corporativos.':
      'Over five years in software as a service (SaaS) and insurance: automates operations with data and artificial intelligence and coordinates launches with development teams. Before that, technical support for corporate clients.',
    'Automatización e IA': 'Automation and AI', 'Datos': 'Data', 'Ingeniería industrial · UAM': 'Industrial engineering · UAM', 'Ingeniería industrial · UAC': 'Industrial engineering · UAC',
    'Se encarga de la operación: pagos confiables, datos cuidados y una entrega de kits ordenada.': 'Runs the operation: reliable payments, well-kept data and an orderly kit pickup.',
    'Más de seis años en fintech, servicios legales y el mundo corporativo. En fintech pasó de investigador de fraude a gerente de un equipo internacional y luego a gerente asociado de programas.':
      'Over six years in fintech, legal services and the corporate world. In fintech, went from fraud investigator to manager of an international team and then to associate program manager.',
    'Riesgo y fraude': 'Risk and fraud', 'Procesos': 'Processes',
    'Trabaja con organizadores y marcas para que las carreras de Nicaragua lleguen a la app.': "Works with organizers and brands so that Nicaragua's races make it into the app.",
    'Viene de la logística de última milla, el comercio minorista y la venta automotriz: atendió cuentas clave, resolvió envíos y reclamos con las bodegas y trabajó en ventas y servicio al cliente.':
      'Comes from last-mile logistics, retail and car sales: handled key accounts, sorted out shipments and claims with the warehouses, and worked in sales and customer service.',
    'Cuentas clave': 'Key accounts', 'Ventas': 'Sales', 'Logística': 'Logistics',
    'Todavía no sale': 'Not out yet', 'Corré la ruta con nosotros desde el principio.': 'Run the route with us from the start.',
    'Anotate en la lista de espera y te avisamos primero cuando Xolo Run abra.': "Join the waitlist and we'll tell you first when Xolo Run opens.", 'Volver al inicio': 'Back to home'
  };
  // textos con un número o una variante adentro
  const RULES = [
    [/^Paso (\d) de 4$/, (m) => 'Step ' + m[1] + ' of 4'],
    [/^Tenés el #(\d+) en la fila\. Te escribimos por (WhatsApp|correo) cuando abramos\. El QR de tu dorsal es tu enlace: quien lo escanee se anota con vos\.$/,
      (m) => "You're #" + m[1] + ' in line. We’ll message you ' + (m[2] === 'correo' ? 'by email' : 'on WhatsApp') + ' when we open. The QR on your bib is your link: whoever scans it joins the line with you.'],
    [/^Ese contacto ya se había anotado, así que conservás tu lugar\. Te escribimos por (WhatsApp|correo) cuando abramos\.$/,
      (m) => 'That contact was already on the list, so you keep your spot. We’ll message you ' + (m[1] === 'correo' ? 'by email' : 'on WhatsApp') + ' when we open.'],
    [/^Tu enlace: (.+)$/, (m) => 'Your link: ' + m[1]],
    [/^LinkedIn de (.+) \(se abre en otra pestaña\)$/, (m) => m[1] + "'s LinkedIn (opens in a new tab)"]
  ];

  const params = new URLSearchParams(location.search);
  const store = { get() { try { return localStorage.getItem('xr-lang'); } catch (e) { return null; } }, set(v) { try { localStorage.setItem('xr-lang', v); } catch (e) {} } };
  const asked = (params.get('lang') || '').toLowerCase();
  if (asked === 'en' || asked === 'es') store.set(asked);
  const lang = store.get() === 'en' ? 'en' : 'es';
  window.XR_LANG = lang;
  window.XR_T = (s) => (lang === 'en' && Object.prototype.hasOwnProperty.call(EN, s)) ? EN[s] : s;

  const toEn = (t) => {
    const k = t.replace(/\s+/g, ' ').trim();
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(EN, k)) return EN[k];
    for (const [re, f] of RULES) { const m = k.match(re); if (m) return f(m); }
    return null;
  };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA']);
  function textNode(n) {
    const v = n.nodeValue; if (!v || !/\S/.test(v)) return;
    if (n.__xr === v) return;   // ya traducido por nosotros
    const p = n.parentElement; if (!p || SKIP.has(p.tagName) || p.closest('[data-no-i18n]')) return;
    const en = toEn(v); if (en == null) return;
    const lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    n.__xr = lead + en + trail; n.nodeValue = n.__xr;
  }
  function walk(root) {
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list = []; while (it.nextNode()) list.push(it.currentNode);
    list.forEach(textNode);
  }
  // atributos con texto (descripción y og de la cabecera, aria-label, title, alt, placeholder): el mismo diccionario y las mismas reglas
  function attrs() {
    const sel = 'meta[name="description"], meta[property="og:title"], meta[property="og:description"], [aria-label], [title], [alt], [placeholder]';
    for (const e of document.querySelectorAll(sel)) for (const a of ['content', 'aria-label', 'title', 'alt', 'placeholder']) {
      const v = e.getAttribute(a); if (!v) continue;
      const en = toEn(v); if (en != null) e.setAttribute(a, en);
    }
    const loc = document.querySelector('meta[property="og:locale"]'); if (loc) loc.setAttribute('content', 'en_US');
  }
  function translateAll() {
    document.documentElement.lang = 'en';
    document.title = XR_T(document.title);
    attrs();
    walk(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData') textNode(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // el conmutador en la cabecera: «EN» cuando estamos en español, «ES» cuando estamos en inglés; cambiar recarga
  function addToggle() {
    const box = document.querySelector('.toplinks'); if (!box) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lang'; b.setAttribute('data-no-i18n', '');
    b.textContent = lang === 'en' ? 'ES' : 'EN';
    b.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    b.title = b.getAttribute('aria-label');
    // la dirección cambia (?lang=…) para que sea una navegación de verdad: con la misma dirección y un #ancla el navegador solo salta al ancla
    b.addEventListener('click', () => { const next = lang === 'en' ? 'es' : 'en'; store.set(next); const u = new URL(location.href); u.searchParams.set('lang', next); location.replace(u.href); });
    box.appendChild(b);
  }
  if (lang === 'en') translateAll();
  addToggle();
})();
