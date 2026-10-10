/* Xolo Run · landing del enlace de la bio. Tres pestañas en una sola página: Inicio (la historia), Encuesta (incrustada)
   y Lista de espera (el dorsal). Sin paso de compilación: HTML, CSS y este archivo. GSAP solo adorna: sin él, la página
   funciona igual con transiciones de CSS. Con «reducir movimiento» activado, todo queda quieto y completo. */
(() => {
  'use strict';

  // ───────── Configuración ─────────
  const SUPABASE_URL = 'https://mwiroczcgigmapzkzeba.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bZ6aEB26mibNyVdc3Q4JkA_N3Jl2dBI';
  const CONSENT_VERSION = '2026-10-06';
  // Pendiente antes de publicar (ticket 86aktb1qp): quién responde por los datos, su contacto y el plazo
  const CONTROLLER = { name: '', contact: '', retention: '' };
  const SURVEY_URL = new URL('encuesta/', location.href).href;   // la encuesta vive en este mismo sitio (xolorun.com/encuesta/)
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const STORE = 'xolo-dorsal-v1', QUEUE = 'xolo-fila-pendiente-v1', ORIGIN = 'xolo-origen-v1';
  // los enlaces de invitación y los QR siempre con la dirección oficial (https, sin www), aunque se haya entrado por http o por www
  // (con el protocolo de la visita: http solo mientras GitHub emite el certificado; con HTTPS forzado todos llegan por https)
  const PUBLIC_URL = /(^|\.)xolorun\.com$/.test(location.hostname) ? location.protocol + '//xolorun.com/' : location.origin + location.pathname;
  const MIN_FILA = 25;   // la cantidad de personas en la fila se muestra solo a partir de aquí

  const ZONES = [['managua', 'Managua'], ['carazo', 'Carazo'], ['masaya', 'Masaya'], ['granada', 'Granada'], ['leon', 'León o Chinandega'],
    ['rivas', 'Rivas'], ['norte', 'El Norte'], ['otra', 'Otra zona'], ['fuera', 'Fuera de Nicaragua']];
  const PROFILES = [['empiezo', 'Estoy empezando o quiero empezar'], ['gusto', 'Corro por salud o por gusto'], ['carreras', 'Entreno para carreras'],
    ['organizo', 'Organizo carreras o un crew'], ['acompano', 'Acompaño a alguien que corre']];
  // Cifras de la encuesta «Correr en Nicaragua» (179 respuestas completas, 6 al 8 de octubre de 2026). Consulta: lista-espera/herramientas/cifras-encuesta.sql
  const STATS = [
    { n: 72, u: '%', say: 'quiso inscribirse a una carrera en el último año y al final no lo hizo.', cap: 'Qué pasó',
      bars: [['La fecha no le quedaba', 33], ['Se acabaron los cupos', 27], ['Se enteró tarde', 25], ['No tenía con quién ir', 25]],
      base: 'Base: 88 que ya corrieron una carrera; razones de las 63 que no se inscribieron.', xo: 'Ves cada carrera con tiempo y te inscribís en pocos pasos.' },
    { n: 71, u: '%', say: 'de quienes pagaron por transferencia tuvo que mandar foto del comprobante para que le confirmaran.', cap: 'Cómo pagó su última carrera',
      bars: [['Transferencia', 47], ['Fue gratis', 28], ['Tarjeta en línea', 10], ['Efectivo', 8]],
      base: 'Base: 41 que pagaron por transferencia. El 46 % de quienes pagaron no quedó confirmado al instante.', xo: 'Subís tu comprobante en la app y ves el estado de tu pago.' },
    { n: 62, u: '%', say: 'tuvo un problema la última vez que mostró algo en el teléfono en la calle.', cap: 'Qué le pasó',
      bars: [['El sol no dejaba ver', 38], ['No había señal ni datos', 34], ['La batería estaba baja', 15]],
      base: 'Base: 122 a quienes les tocó mostrar algo. El 21 % esperó más de 30 minutos por su kit.', xo: 'Tu dorsal con QR funciona sin conexión, y el kit se entrega con un escaneo.' },
    { n: 73, u: '%', say: 'nunca ha estado en un grupo para salir a correr o caminar.', cap: 'Por qué no',
      bars: [['No conoce ninguno cerca', 64], ['No lo había pensado', 25], ['Prefiere ir sin grupo', 20], ['Los horarios no le quedan', 18]],
      base: 'Base: 179. El 55 % salió sin compañía la última vez.', xo: 'Crews por zona y un reto cada semana, para que nadie corra solo.' }
  ];

  // ───────── Utilidades ─────────
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 760px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap || null;
  const EASE = 'power2.out';   // cercano a cubic-bezier(.33, 1, .68, 1) del manual
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // ───────── De dónde llegó: canal, campaña, creador y código de quien invitó ─────────
  // Instagram: el enlace de la bio lleva ?c=ig&campana=bio; las historias ?c=ig-historia&campana=…; la encuesta ?c=encuesta
  const params = new URLSearchParams(location.search);
  const slug = (v, max) => { v = (v || '').trim().toLowerCase(); return new RegExp('^[a-z0-9_-]{1,' + max + '}$').test(v) ? v : ''; };
  // Instagram agrega solo ?utm_source=ig&utm_medium=social&utm_content=link_in_bio al enlace de la bio: eso es la bio, no un creador
  const igBio = params.get('utm_content') === 'link_in_bio';
  const fresh = {
    channel: slug(params.get('c') || params.get('utm_source'), 40),
    campaign: slug(params.get('campana') || params.get('utm_campaign'), 60) || (igBio ? 'bio' : ''),
    creator: slug(params.get('creador') || (igBio ? '' : params.get('utm_content')), 40),
    ref: slug(params.get('ref'), 24)
  };
  // la visita que trae datos de origen reemplaza a la anterior (no se mezcla el canal de hoy con la campaña de ayer);
  // solo el código de quien invitó se conserva si la visita nueva no trae otro
  const saved = store.get(ORIGIN) || {};
  const hasFresh = Object.values(fresh).some(Boolean);
  const origin = hasFresh ? { ...fresh, ref: fresh.ref || saved.ref || '' } : { channel: saved.channel || '', campaign: saved.campaign || '', creator: saved.creator || '', ref: saved.ref || '' };
  if (hasFresh) store.set(ORIGIN, origin);
  const testing = origin.channel === 'prueba';

  // ───────── Contador de visitas (sin datos personales) ─────────
  // Solo suma eventos en nuestra base (track_hit, migración 0016): por día, canal, campaña y tipo de dispositivo.
  // Nada por persona: sin cookies, sin IP ni identificadores. Las marcas «ya conté esto» viven solo en este navegador.
  // No cuenta en local ni en pruebas del equipo (?c=prueba).
  const inApp = /Instagram/i.test(navigator.userAgent) ? 'instagram' : /FBAN|FBAV|FB_IAB/i.test(navigator.userAgent) ? 'facebook' : /WhatsApp/i.test(navigator.userAgent) ? 'whatsapp' : '';
  const hitSeen = (k) => { try { if (sessionStorage.getItem('xr-h-' + k)) return true; sessionStorage.setItem('xr-h-' + k, '1'); } catch (e) {} return false; };
  const MEDIR = params.get('medir') === '1';   // solo para el QA en local: deja salir las llamadas, que la base simulada registra
  function hit(event, once) {
    if ((testing || LOCAL) && !MEDIR) return;
    if (once && hitSeen(event)) return;
    try {
      fetch(SUPABASE_URL + '/rest/v1/rpc/track_hit', { method: 'POST', keepalive: true, headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_site: 'landing', p_event: event, p_channel: origin.channel || 'directo', p_campaign: origin.campaign || '', p_device: mobile.matches ? 'movil' : 'escritorio', p_in_app: inApp }) }).catch(() => {});
    } catch (e) {}
  }
  hit('visita', true);
  // una persona por día: una marca con la fecha en este navegador, sin enviar ningún identificador
  try { const d = new Date(), today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); if (store.get('xr-dia') !== today) { store.set('xr-dia', today); hit('visita_dia'); } } catch (e) {}
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="https://wa.me"]')) hit('compartir_whatsapp');
    const tl = e.target.closest('[data-tab-link]'); if (tl) hit('cta_' + tl.dataset.tabLink);
  });

  // ───────── Aviso de privacidad ─────────
  const pend = '<span class="pending">en confirmación</span>';
  $('[data-controller]').innerHTML = CONTROLLER.name ? esc(CONTROLLER.name) : pend;
  $('[data-contact]').innerHTML = CONTROLLER.contact ? esc(CONTROLLER.contact) : pend;
  $('[data-retention]').innerHTML = CONTROLLER.retention ? esc(CONTROLLER.retention) : pend;
  $('[data-version]').textContent = CONSENT_VERSION;

  // ───────── Texto que entra palabra por palabra ─────────
  function splitWords(el) {
    if (el.dataset.split) return $$('.w', el);
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => '<span class="wm" aria-hidden="true"><span class="w">' + esc(w) + '</span></span>').join(' ');
    el.dataset.split = '1';
    return $$('.w', el);
  }
  function riseWords(el, delay = 0) {
    const ws = splitWords(el);
    if (!G || reduced) return;
    G.fromTo(ws, { yPercent: 110 }, { yPercent: 0, duration: .8, ease: 'power3.out', stagger: .045, delay });
  }
  function riseIn(els, delay = 0) {
    if (!G || reduced) return;
    G.fromTo(els, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, ease: EASE, stagger: .08, delay });
  }
  // lo que aparece al hacer scroll (fuera de la portada): una sola vez
  const seen = new WeakSet();
  const io = new IntersectionObserver((ents) => {
    for (const e of ents) {
      if (!e.isIntersecting || seen.has(e.target)) continue;
      seen.add(e.target); io.unobserve(e.target);
      const t = e.target;
      if (t.hasAttribute('data-words')) riseWords(t);
      else if (t.hasAttribute('data-rise')) riseIn([t]);
      if (t.id === 'stats') playStats();
    }
  }, { threshold: .25 });
  function watchReveals(root) {
    for (const el of $$('[data-words], [data-rise], #stats', root)) {
      if (el.closest('#hero')) continue;
      if (G && !reduced) {
        if (el.hasAttribute('data-words')) G.set(splitWords(el), { yPercent: 110 });   // con GSAP, no con transform en línea: GSAP lo leía como píxeles y las palabras nunca subían
        else if (el.hasAttribute('data-rise')) G.set(el, { autoAlpha: 0 });
      }
      io.observe(el);
    }
  }

  // ───────── Pestañas: inicio, encuesta, lista ─────────
  // La barra es una ruta: una línea conecta las tres y el tramo arcilla corre de una a otra (idea de Pradeepsaranbishnoi/big-swan-35).
  // Al cambiar, el «aparato» de la pestaña que se va (el teléfono, el dorsal) viaja y se convierte en el de la que llega;
  // detrás pasan líneas de velocidad (anand_4957/moody-ladybug-99). Sin GSAP o con «reducir movimiento», el cambio es directo.
  const TABS = ['inicio', 'encuesta', 'lista'];
  const tabsEl = $('#tabs'), ind = $('.ind', tabsEl), trk = $('.trk', tabsEl), seg = $('.seg', tabsEl), speed = $('#speed'), ghost = $('#ghost');
  const panels = Object.fromEntries(TABS.map((t) => [t, $('#' + t)]));
  const tabBtns = Object.fromEntries(TABS.map((t) => [t, $('[data-tab="' + t + '"]')]));
  let tab = 'inicio', switching = false, ghosting = false;
  const scrollPos = { inicio: 0, encuesta: 0, lista: 0 };
  function tabX(name) { const r = tabBtns[name].getBoundingClientRect(), p = tabsEl.getBoundingClientRect(); return { l: r.left - p.left, w: r.width, c: r.left - p.left + r.width / 2 }; }
  function placeInd(name, keepSeg) {
    const t = tabX(name), a = tabX('inicio'), z = tabX('lista');
    ind.style.width = t.w + 'px'; ind.style.transform = 'translateX(' + (t.l - 4) + 'px)';
    trk.style.setProperty('--x0', a.c + 'px'); trk.style.setProperty('--x1', (z.c - a.c) + 'px');
    // el punto va delante de la etiqueta, en el relleno izquierdo de la pestaña (padding-left 26 px)
    if (!keepSeg) { if (G) G.set(seg, { x: t.l + 12, scale: 1 }); else seg.style.transform = 'translateX(' + (t.l + 12) + 'px)'; }
  }
  function runSeg(from, to) {   // el corredor: el punto corre hasta la pestaña nueva dejando una estela arcilla detrás, y llega con un latido
    const a = tabX(from).l + 12, b = tabX(to).l + 12;
    tabsEl.dataset.dir = b > a ? 'r' : 'l';
    tabsEl.classList.add('running');
    G.timeline({ onComplete: () => tabsEl.classList.remove('running') })
      .fromTo(seg, { x: a }, { x: b, duration: .55, ease: 'power3.inOut' }, 0)
      .add(() => tabsEl.classList.remove('running'), .3)   // la estela se apaga antes de llegar: así nunca queda sobre la etiqueta de destino
      .to(seg, { scale: 1.6, duration: .16, ease: 'power2.out' }, .5)
      .to(seg, { scale: 1, duration: .28, ease: 'back.out(2)' }, .66);
  }
  // el aparato de cada pestaña, si está a la vista: el teléfono de la portada o el de la ruta, el teléfono con la encuesta, el dorsal
  const onScreen = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 40 && r.bottom > 70 && r.top < innerHeight - 70 ? r : null; };
  function deviceOf(name) {
    if (name === 'inicio') return onScreen(heroPhone) ? heroPhone : (onScreen($('#route-phone')) ? $('#route-phone') : null);
    if (name === 'encuesta') return $('#enc-phone');
    if (name === 'lista') return $('#bib .bcard');
    return null;
  }
  const radiusOf = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  function ghostAt(r, radius) {
    G.set(ghost, { x: r.left, y: r.top, width: r.width, height: r.height, borderRadius: radius, autoAlpha: 1 });
  }
  function tabFromHash() { const h = location.hash.replace('#', ''); return TABS.includes(h) ? h : (h === 'privacidad' ? 'lista' : 'inicio'); }
  function showTab(name, opts = {}) {
    hit('pestana_' + name, true);
    if (!TABS.includes(name)) name = 'inicio';
    const { push = true, quiet = false } = opts;
    // durante una transición no se pierde el toque ni el «atrás» del navegador: se aplica el último pedido apenas termine
    if (switching) { pendingTab = [name, opts]; return; }
    if (name === tab && !quiet) { if (push) history.replaceState({ tab: name }, '', '#' + name); return; }
    const old = tab, dir = TABS.indexOf(name) > TABS.indexOf(old) ? 1 : -1;
    const animated = G && !reduced && !quiet && old !== name;
    const fromEl = animated ? deviceOf(old) : null, startR = fromEl ? fromEl.getBoundingClientRect() : null, fromRadius = fromEl ? radiusOf(fromEl) : 0;
    scrollPos[old] = window.scrollY;
    tab = name;
    for (const t of TABS) { tabBtns[t].setAttribute('aria-selected', t === name ? 'true' : 'false'); tabBtns[t].tabIndex = t === name ? 0 : -1; }
    if (push) history.pushState({ tab: name }, '', '#' + name);
    document.title = name === 'encuesta' ? 'Encuesta · Xolo Run' : name === 'lista' ? 'Lista de espera · Xolo Run' : 'Xolo Run · Todas las carreras de Nicaragua, en un solo lugar';
    const show = () => {
      panels[old].hidden = true; panels[name].hidden = false;
      window.scrollTo({ top: name === 'inicio' ? scrollPos.inicio : 0, behavior: 'instant' });
      if (name === 'encuesta') openSurvey();
      if (name === 'lista') openLista(quiet || ghosting);
      if (name === 'inicio') { route.resize(); if (!heroPlayed) playHero(); }
    };
    if (!animated) { show(); placeInd(name); return; }
    switching = true;
    placeInd(name, true); runSeg(old, name);
    speed.classList.toggle('back', dir < 0); speed.classList.add('on');
    G.fromTo(speed, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12 });
    G.to(speed, { autoAlpha: 0, duration: .35, delay: .5, onComplete: () => speed.classList.remove('on') });
    if (startR) { ghostAt(startR, fromRadius); fromEl.style.visibility = 'hidden'; ghosting = true; }
    G.to(panels[old], { autoAlpha: 0, scale: .985, duration: .18, ease: 'power2.in', onComplete: () => {
      G.set(panels[old], { clearProps: 'all' });
      if (fromEl) fromEl.style.visibility = '';
      show();
      const toEl = deviceOf(name), endR = toEl ? toEl.getBoundingClientRect() : null;
      G.fromTo(panels[name], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .45, ease: EASE, clearProps: 'transform' });
      if (!endR) { G.to(ghost, { autoAlpha: 0, duration: .2 }); ghosting = false; endSwitch(); return; }
      if (!startR) {   // no había aparato a la vista: el tramo de la pestaña crece hasta ser el aparato
        const b = tabBtns[name].getBoundingClientRect();
        ghostAt({ left: b.left + b.width / 2 - 13, top: b.top + b.height - 10, width: 26, height: 6 }, 3); ghosting = true;
      }
      toEl.style.visibility = 'hidden';
      G.to(ghost, { x: endR.left, y: endR.top, width: endR.width, height: endR.height, borderRadius: radiusOf(toEl), duration: .62, ease: 'power3.inOut', onComplete: () => {
        toEl.style.visibility = '';
        toEl.classList.remove('land-pop'); void toEl.offsetWidth; toEl.classList.add('land-pop');
        G.to(ghost, { autoAlpha: 0, duration: .16, onComplete: () => { ghosting = false; } });
        endSwitch();
      } });
    } });
  }
  let pendingTab = null;
  function endSwitch() {
    switching = false;
    if (!pendingTab) return;
    const [n, o] = pendingTab; pendingTab = null;
    // el «atrás» ya cambió la dirección: se muestra la pestaña de la dirección; un toque agrega su propia entrada al historial
    if (n !== tab) showTab(n, o);
    else if (o.push === false && location.hash !== '#' + tab) history.replaceState({ tab }, '', '#' + tab);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-tab-link]');
    if (!a) return;
    e.preventDefault();
    showTab(a.dataset.tabLink);
    if (a.dataset.tabLink === 'lista') { const t = $('#t-lista'); if (t) setTimeout(() => t.focus({ preventScroll: true }), 600); }
  });
  for (const b of Object.values(tabBtns)) b.addEventListener('click', () => showTab(b.dataset.tab));
  tabsEl.addEventListener('keydown', (e) => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]; showTab(n); tabBtns[n].focus(); }
  });
  window.addEventListener('popstate', (e) => {
    showTab((e.state && e.state.tab) || tabFromHash(), { push: false });
    if (location.hash === '#privacidad') openSheet(() => { $('#privacidad').open = true; });   // un enlace a #privacidad dentro de la página
    else if (location.hash === '#preguntas') openSheet();
  });
  // en celular la barra de pestañas flota abajo: se aparta mientras se escribe
  document.addEventListener('focusin', (e) => { if (e.target.matches('input, textarea')) tabsEl.classList.add('away'); });
  document.addEventListener('focusout', (e) => { if (e.target.matches('input, textarea')) setTimeout(() => { if (!document.activeElement || !document.activeElement.matches('input, textarea')) tabsEl.classList.remove('away'); }, 80); });
  const top = $('#top');
  const onScrollTop = () => top.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScrollTop, { passive: true });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll]');
    if (!a) return;
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64 + 2, behavior: reduced ? 'instant' : 'smooth' });
  });

  for (const r of $$('[data-roll]')) { const t = r.textContent.trim(); r.innerHTML = '<span>' + esc(t) + '</span><span aria-hidden="true">' + esc(t) + '</span>'; }

  // ───────── Ilustraciones de las pantallas (sin fotos: una ruta por carrera, un QR de ejemplo) ─────────
  const LANDS = [
    'M-10 70 C 30 40 60 90 100 55 S 170 20 230 60',
    'M-10 60 C 40 90 70 20 120 50 S 200 95 230 40',
    'M-10 45 C 50 20 80 80 130 70 S 190 30 230 75'
  ];
  for (const l of $$('.land')) {
    const i = +l.dataset.land || 0;
    l.innerHTML = '<svg viewBox="0 0 220 100" preserveAspectRatio="none" aria-hidden="true"><path d="' + LANDS[i % 3] + '" fill="none" stroke="#12383B" stroke-width="10" stroke-linecap="round"/><path d="' + LANDS[i % 3] + '" pathLength="1" stroke-dasharray=".16 1" stroke-dashoffset="-' + (.3 + i * .18) + '" fill="none" stroke="#C65A3D" stroke-width="10"/></svg>' + l.innerHTML;
  }
  for (const q of $$('[data-qr-ill]')) {   // un patrón fijo que parece un QR; no es un código real
    const r = rng(11), cells = [];
    const finder = (x, y) => (cx, cy) => (cx >= x && cx < x + 7 && cy >= y && cy < y + 7) && ((cx === x || cx === x + 6 || cy === y || cy === y + 6) || (cx >= x + 2 && cx <= x + 4 && cy >= y + 2 && cy <= y + 4));
    const fs = [finder(0, 0), finder(14, 0), finder(0, 14)];
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      const inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (inF ? fs.some((f) => f(x, y)) : r() < .42) cells.push('M' + x + ' ' + y + 'h1v1h-1z');
    }
    q.innerHTML = '<path d="' + cells.join('') + '" fill="#12383B"/>';
  }

  // ───────── La portada ─────────
  const hero = $('#hero'), scene = $('#scene'), heroPhone = $('#hero-phone'), sweepC = $('#sweep-c'), sweepSvg = $('#sweep');
  const hr = { svg: $('#hero-route'), base: $('#hr-base'), seg: $('#hr-seg') };
  function catmull(P) {
    let d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function layoutHeroRoute() {
    const w = hero.clientWidth, h = hero.clientHeight, hb = hero.getBoundingClientRect();
    const cr = $('.copy', hero).getBoundingClientRect(), sr = heroPhone.getBoundingClientRect();
    const px = sr.left - hb.left + sr.width / 2, py = sr.top - hb.top + sr.height / 2;
    let P;
    if (mobile.matches) {
      const y0 = cr.bottom - hb.top + 26;
      P = [[-.1 * w, y0 + 10], [.25 * w, y0 - 6], [.55 * w, y0 + 14], [.9 * w, py - sr.height * .35], [px + sr.width * .3, py + sr.height * .05], [.2 * w, py + sr.height * .42], [-.1 * w, py + sr.height * .3]];
    } else {
      const yb = cr.bottom - hb.top + 40;
      P = [[-.06 * w, yb + 20], [.22 * w, yb], [cr.right - hb.left + .02 * w, yb - 10], [px - sr.width * .9, py + sr.height * .36], [px + sr.width * .05, py - sr.height * .05], [px + sr.width * .7, py - sr.height * .44], [1.06 * w, py - sr.height * .5]];
    }
    hr.svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    const d = catmull(P);
    hr.base.setAttribute('d', d); hr.seg.setAttribute('d', d);
    hr.base.style.strokeDasharray = '1 1'; hr.seg.style.strokeDasharray = '.09 1';
  }
  let heroPlayed = false;
  function playHero() {
    if (heroPlayed) return; heroPlayed = true;
    layoutHeroRoute();
    const nts = $$('.nt', heroPhone), bubs = $$('.bub', scene), caos = $('[data-s="caos"]', heroPhone), app = $('[data-s="app"]', heroPhone);
    document.documentElement.classList.add('ready');
    if (!G || reduced) {   // sin movimiento: el teléfono ya muestra la app, la ruta ya está dibujada
      caos.classList.remove('on'); app.classList.add('on');
      hr.seg.style.strokeDashoffset = '-.55';
      return;
    }
    const h1 = $('#t-hero');
    splitWords(h1);
    const tl = G.timeline({ defaults: { ease: EASE } });
    tl.fromTo($$('.w', h1), { yPercent: 110 }, { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .05 }, .1)
      .fromTo($$('[data-rise]', hero), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .09 }, .35)
      .fromTo(scene, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9 }, .2)
      .fromTo(hr.base, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, .3)
      .fromTo(hr.seg, { strokeDashoffset: .4, autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, 1.7)
      // el caos: los avisos se apilan y los chats brotan alrededor
      .fromTo(nts, { autoAlpha: 0, y: -14, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .3, stagger: .26 }, .9)
      .fromTo(bubs, { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .4, ease: 'back.out(1.6)', stagger: .34 }, 1.3)
      .to(heroPhone, { keyframes: [{ x: 3, duration: .05 }, { x: -3, duration: .05 }, { x: 2, duration: .05 }, { x: 0, duration: .05 }], repeat: 6, repeatDelay: .25 }, 2.1)
      // el barrido de la marca: un círculo de arena con borde lago limpia el caos y entra la app
      .add(() => {
        const sb = scene.getBoundingClientRect(), pb = heroPhone.getBoundingClientRect();
        sweepSvg.setAttribute('viewBox', '0 0 ' + sb.width + ' ' + sb.height);
        sweepC.setAttribute('cx', pb.left - sb.left + pb.width / 2); sweepC.setAttribute('cy', pb.top - sb.top + pb.height / 2);
      }, 4.2)
      .fromTo(sweepC, { attr: { r: 0 }, opacity: 1 }, { attr: { r: Math.max(scene.clientWidth, scene.clientHeight) * .8 }, duration: .8, ease: 'power2.out' }, 4.25)
      .to(bubs, { autoAlpha: 0, scale: .3, duration: .3, ease: 'power2.in', stagger: .03 }, 4.5)
      .add(() => { app.classList.add('on'); }, 4.6)
      .fromTo(app, { xPercent: 100 }, { xPercent: 0, duration: .5, ease: 'power3.inOut' }, 4.6)
      .to(caos, { xPercent: -30, duration: .5, ease: 'power3.inOut', onComplete: () => { caos.classList.remove('on'); G.set(caos, { clearProps: 'all' }); } }, 4.6)
      .to(sweepC, { opacity: 0, duration: .4 }, 4.7)
      .add(() => { idleHero(); }, 5.2);
    // el tramo encendido corre despacio por la ruta
    G.to(hr.seg, { strokeDashoffset: -.69, duration: 16, ease: 'none', repeat: -1, delay: 1.9 });
  }
  function idleHero() {
    if (!G || reduced) return;
    G.to(heroPhone, { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const scrs = ['app', 'crews', 'dorsal'].map((n) => $('[data-s="' + n + '"]', heroPhone));
    let k = 0;
    setInterval(() => {
      if (document.hidden || tab !== 'inicio' || !onScreen(heroPhone) || switching) return;
      const from = scrs[k], to = scrs[k = (k + 1) % scrs.length];
      to.classList.add('on');
      G.fromTo(to, { xPercent: 100 }, { xPercent: 0, duration: .5, ease: 'power3.inOut' });
      G.fromTo(from, { xPercent: 0 }, { xPercent: -30, duration: .5, ease: 'power3.inOut', onComplete: () => { from.classList.remove('on'); G.set(from, { clearProps: 'transform' }); } });
    }, 5200);
    if (finePointer) {
      const rx = G.quickTo(heroPhone, 'rotationX', { duration: .6, ease: EASE }), ry = G.quickTo(heroPhone, 'rotationY', { duration: .6, ease: EASE });
      hero.addEventListener('pointermove', (e) => {
        const r = scene.getBoundingClientRect();
        ry(clamp((e.clientX - (r.left + r.width / 2)) / r.width, -.6, .6) * 22);
        rx(clamp((e.clientY - (r.top + r.height / 2)) / r.height, -.6, .6) * -16);
      });
      hero.addEventListener('pointerleave', () => { ry(0); rx(0); });
    } else {
      window.addEventListener('scroll', () => { if (tab === 'inicio') G.set(heroPhone, { rotationY: clamp(window.scrollY / 30, 0, 18), rotationX: clamp(window.scrollY / 60, 0, 8) }); }, { passive: true });
    }
  }

  // ───────── Las cifras ─────────
  const statsEl = $('#stats');
  statsEl.innerHTML = STATS.map((S, i) => '<article class="stat" style="--i:' + i + '"><p class="n"><span data-n="' + S.n + '">0</span><small>' + S.u + '</small></p><p class="say">' + esc(S.say) + '</p>' +
    '<p class="cap">' + esc(S.cap) + '</p><ul class="bars">' + S.bars.map(([l, v]) => '<li><span>' + esc(l) + '</span><b>' + v + ' %</b><span class="tr"><i data-v="' + (v / 100).toFixed(2) + '"></i></span></li>').join('') + '</ul>' +
    '<p class="base">' + esc(S.base) + '</p><p class="xo"><span>Con Xolo Run</span>' + esc(S.xo) + '</p></article>').join('');
  function countTo(el, to, dur = 1.1, delay = 0) {
    if (!G || reduced) { el.textContent = to; return; }
    const o = { v: 0 };
    G.to(o, { v: to, duration: dur, delay, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
  }
  function playStats() {
    $$('.stat', statsEl).forEach((card, i) => {
      if (G && !reduced) G.fromTo(card, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: EASE, delay: i * .1 });
      countTo($('[data-n]', card), +$('[data-n]', card).dataset.n, 1.2, i * .1 + .2);
      setTimeout(() => { $$('[data-v]', card).forEach((b, j) => { b.style.transitionDelay = (j * 90) + 'ms'; b.style.setProperty('--v', b.dataset.v); }); }, 300 + i * 100);
    });
  }
  if (G && !reduced) G.set($$('.stat', statsEl), { autoAlpha: 0 });
  else $$('[data-v]', statsEl).forEach((b) => b.style.setProperty('--v', b.dataset.v));
  if (finePointer && G && !reduced) {
    for (const card of $$('.stat', statsEl)) {
      card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(); G.to(card, { rotationY: ((e.clientX - r.left) / r.width - .5) * 8, rotationX: ((e.clientY - r.top) / r.height - .5) * -8, transformPerspective: 900, duration: .4, ease: EASE }); });
      card.addEventListener('pointerleave', () => G.to(card, { rotationY: 0, rotationX: 0, duration: .6, ease: EASE }));
    }
  }

  // ───────── La ruta: el teléfono recorre el símbolo y la cámara lo sigue ─────────
  // El símbolo es la ruta (como en el video): salida en la tapa izquierda, cima, el tramo arcilla, el lazo derecho y la meta.
  const route = (() => {
    const sec = $('#ruta'), stage = $('#stage'), world = $('#world'), svg = $('#world-svg'), g = $('#world-g');
    const guide = $('#w-guide'), trail = $('#w-trail'), tramo = $('#w-tramo'), capa = $('#w-capa'), capb = $('#w-capb'), stopsG = $('#w-stops'), nameG = $('#w-name');
    const tagS = $('#tag-salida'), tagM = $('#tag-meta'), tape = $('#tape'), carrier = $('#carrier'), phone = $('#route-phone'), remate = $('#remate'), firmaEnd = $('#firma-end');
    const steps = $$('.step', $('#steps'));
    // con «reducir movimiento» la ruta no se anima: los siete pasos se leen como una lista, sin el escenario
    const STATIC = reduced;
    if (STATIC) sec.classList.add('static');
    else {
      // los lectores de pantalla leen los siete pasos de una vez, en una lista oculta; los pasos animados quedan solo a la vista
      const ol = document.createElement('ol'); ol.className = 'vh';
      ol.innerHTML = steps.map((s) => '<li>' + esc([...s.querySelectorAll('.label, .h2, p:not(.label)')].map((e) => e.textContent.trim()).join('. ').replace(/\.\./g, '.')) + '</li>').join('');
      $('#t-ruta').after(ol);
      steps.forEach((s) => s.querySelectorAll('.label, .h2, p').forEach((e) => e.setAttribute('aria-hidden', 'true')));
    }
    const SYM = 'M64.055 181.954 C29.867 180.330 26.659 135.927 62.000 132.000 C90.000 129.000 94.000 74.000 126.000 74.000 C160.000 74.000 168.000 126.000 196.000 130.000 C234.000 135.000 232.000 182.000 198.000 182.000 C168.000 182.000 154.000 164.000 128.000 164.000 C118.509 164.000 111.416 166.399 104.874 169.445';
    const SEG = 'M138.345 76.546 C151.023 82.054 159.594 95.556 168.386 107.642';
    const ANCH = [[36, 158], [94, 100], [126, 74], null, [198, 131], [226, 160]];   // dónde para el teléfono (null = en medio del tramo arcilla)
    const N = 6, SLOT = 1 / 7, DW = .55;   // seis paradas y la meta; en cada tramo el teléfono se queda el 55 % y viaja el resto
    const M = 320;
    let S = 5, pw = 220, WW = 0, WH = 0, L = 0, samples = [], stops = [], metaF = .97, tapeF = .94, segA = .45, segB = .55, kFit = .5;
    let swPx = 22, zz = 0;
    let idx = -1, active = false, raf = 0, cam = { x: 0, y: 0, k: 1 }, want = { x: 0, y: 0, k: 1 }, snapped = false, kitPlayed = false, nameOn = false;
    guide.setAttribute('d', SYM); trail.setAttribute('d', SYM); tramo.setAttribute('d', SEG);
    capa.setAttribute('cx', 64.055); capa.setAttribute('cy', 181.954); capb.setAttribute('cx', 104.874); capb.setAttribute('cy', 169.445);
    function toWorld(x, y) { return [M + (x - 24.918) * S, M + (y - 62) * S]; }
    function layout() {
      const sw = stage.clientWidth, sh = stage.clientHeight;
      if (!sw || !sh) return;
      pw = mobile.matches ? clamp(Math.min(sw * .42, sh * .38), 120, 172) : clamp(sh * .3, 190, 250);   // en celular cabe entero en el escenario
      S = mobile.matches ? clamp(sw * 1.9 / 211, 2.8, 4) : clamp(sw * 1.8 / 211, 4.2, 7.5);              // mundo más chico en celular: menos textura que mover
      WW = 211.08 * S + 2 * M; WH = 132 * S + 2 * M;
      world.style.setProperty('--ww', WW + 'px'); world.style.setProperty('--wh', WH + 'px');
      swPx = clamp(S * 4.2, 14, 30);
      svg.setAttribute('viewBox', '0 0 ' + WW + ' ' + WH);
      g.setAttribute('transform', 'translate(' + M + ' ' + M + ') scale(' + S + ') translate(-24.918 -62)');
      const ns = S / 1.4394;
      nameG.setAttribute('transform', 'translate(' + (M + 365.829 * ns) + ' ' + (M + 45 * ns) + ') scale(' + ns + ')');
      phone.style.setProperty('--pw', pw + 'px');
      // muestras a lo largo de la ruta, en coordenadas del mundo
      L = guide.getTotalLength(); samples = [];
      for (let i = 0; i <= 700; i++) { const q = guide.getPointAtLength(L * i / 700); const [x, y] = toWorld(q.x, q.y); samples.push([x, y, i / 700]); }
      const nearF = (ax, ay) => { const [wx, wy] = toWorld(ax, ay); let b = 0, bd = Infinity; for (const [x, y, f] of samples) { const d = (x - wx) ** 2 + (y - wy) ** 2; if (d < bd) { bd = d; b = f; } } return b; };
      segA = nearF(138.345, 76.546); segB = nearF(168.386, 107.642);
      stops = ANCH.map((a) => a ? nearF(a[0], a[1]) : (segA + segB) / 2);
      metaF = nearF(104.874, 169.445) - .006; tapeF = metaF - .035;
      // las paradas marcadas sobre la ruta, la salida y la meta
      stopsG.innerHTML = stops.map((f) => { const q = guide.getPointAtLength(L * f); return '<circle class="stopd" cx="' + q.x.toFixed(2) + '" cy="' + q.y.toFixed(2) + '" r="' + (8 / S).toFixed(3) + '"/>'; }).join('');
      const s0 = toWorld(64.055, 181.954), s1 = toWorld(104.874, 169.445), tp = at(tapeF);
      tagS.style.left = s0[0] + 'px'; tagS.style.top = (s0[1] + S * 8) + 'px';
      tagM.style.left = (s1[0] + S * 2) + 'px'; tagM.style.top = (s1[1] + S * 8) + 'px';
      tape.style.left = tp.x + 'px'; tape.style.top = tp.y + 'px'; tape.style.width = clamp(S * 28, 110, 190) + 'px'; tape.style.transform = 'translate(-50%,-50%) rotate(' + (tp.a + 90) + 'deg)';
      // el encuadre final: el símbolo entero con su nombre al lado, como el logo horizontal
      const lw = 1167.83 * ns, lh = 132 * S;
      kFit = Math.min((sw - (mobile.matches ? 36 : 80)) / lw, (sh * (mobile.matches ? .5 : .62)) / lh);
      place(true);
    }
    function at(fr) {   // punto y ángulo de la ruta en la fracción fr
      const i = clamp(fr, 0, 1) * 700, a = Math.floor(i), b = Math.min(700, a + 1), t = i - a;
      const x = mix(samples[a][0], samples[b][0], t), y = mix(samples[a][1], samples[b][1], t);
      const c = samples[Math.min(700, a + 3)], d = samples[Math.max(0, a - 3)];
      return { x, y, a: Math.atan2(c[1] - d[1], c[0] - d[0]) * 180 / Math.PI };
    }
    // ── el avance: q es el paso (continuo: 2.5 = a medio camino entre la parada 3 y la 4), z el alejamiento final ──
    let q = 0, z = 0, cur = 0, tl = null, auto = 0, touched = false;
    const SLOW = reduced || !G;
    function frac() {
      const i = Math.min(N, Math.floor(q)), u = clamp(q - i, 0, 1);
      if (i >= N) return metaF;
      return mix(stops[i], i < N - 1 ? stops[i + 1] : metaF, easeInOut(u));
    }
    function place(hard) {
      if (!samples.length) return;
      const i = Math.min(N, Math.floor(q)), u = clamp(q - i, 0, 1), fr = frac(), qp = at(fr);
      const traveling = i < N ? Math.sin(u * Math.PI) : 0, near = Math.round(q);
      const dir = Math.cos(qp.a * Math.PI / 180) >= 0 ? 1 : -1;
      carrier.style.transform = 'translate(' + qp.x.toFixed(1) + 'px,' + qp.y.toFixed(1) + 'px)';
      phone.style.transform = 'translate(-50%,' + (mobile.matches ? -50 : -56) + '%) perspective(1500px) rotateY(' + (dir * 16 * traveling).toFixed(2) + 'deg) rotateX(' + (6 * traveling).toFixed(2) + 'deg) rotate(' + (clamp(Math.sin(qp.a * Math.PI / 180) * -6, -8, 8) * traveling).toFixed(2) + 'deg)';
      trail.style.strokeDasharray = '1 1'; trail.style.strokeDashoffset = (1 - fr).toFixed(4);
      capa.classList.toggle('on', fr > .004); capb.classList.toggle('on', fr >= metaF - .002);
      $$('.stopd', stopsG).forEach((d, k) => { d.classList.toggle('on', stops[k] <= fr + .004); d.classList.toggle('now', near === k && traveling < .3); });
      // la cinta de meta
      if (fr >= tapeF && !snapped) { snapped = true; snapTape(); }
      else if (fr < tapeF - .02 && snapped) { snapped = false; resetTape(); }
      // la cámara: sigue al teléfono; al final se aleja y la ruta resulta ser el logo
      const sw = stage.clientWidth, sh = stage.clientHeight, cx = sw * .5, cy = sh * .5;
      zz = easeInOut(z);
      let k = mix(1, kFit, zz), ex = qp.x, ey = qp.y;
      if (zz > 0) {
        const ns = S / 1.4394, lcx = M + (1167.83 / 2) * ns, lcy = M + 66 * S;
        ex = mix(qp.x, lcx, zz); ey = mix(qp.y, lcy, zz);
      }
      phone.style.opacity = String(1 - clamp(z / .3, 0, 1));
      tagM.style.opacity = tagS.style.opacity = String(1 - clamp((z - .1) / .3, 0, 1));
      const on = z > .7;
      if (on !== nameOn) {
        nameOn = on;
        if (G && !reduced) { G.to(nameG, { attr: { opacity: on ? 1 : 0 }, duration: .6, ease: EASE }); G.to(firmaEnd, { autoAlpha: on ? 1 : 0, y: on ? 0 : 10, duration: .5, ease: EASE }); }
        else { nameG.setAttribute('opacity', on ? 1 : 0); firmaEnd.style.opacity = on ? 1 : 0; }
      }
      // la línea engorda hasta el grosor real del símbolo mientras la cámara se aleja: la ruta resulta ser el logo
      const swU = mix(swPx / S, 24, zz);
      guide.style.strokeWidth = trail.style.strokeWidth = tramo.style.strokeWidth = swU.toFixed(3);
      capa.setAttribute('r', (swU / 2).toFixed(3)); capb.setAttribute('r', (swU / 2).toFixed(3));
      stopsG.style.opacity = String(1 - zz);
      want.x = cx - ex * k; want.y = cy - ey * k; want.k = k;
      if (hard) { cam.x = want.x; cam.y = want.y; cam.k = want.k; paintCam(); }
    }
    // el texto y la pantalla cambian juntos, a mitad del viaje
    function syncIdx() { setIdx(clamp(Math.floor(q + .5), 0, N)); }
    const drv = { get q() { return q; }, set q(v) { q = v; syncIdx(); place(); }, get z() { return z; }, set z(v) { z = v; place(); } };
    // La ruta es una animación continua, como un anuncio: recorre los pasos sola, llega a la meta, vuelve al inicio y
    // repite, sin detenerse nunca (Saymond, 9 oct). Tocar un punto o deslizar solo salta de paso; el ciclo sigue.
    function goTo(n, byUser) {
      n = clamp(n, 0, N);
      stopAuto();
      if (n === cur) { startAuto(); return; }
      const from = cur; cur = n;
      if (tl) tl.kill();
      if (SLOW) { q = n; z = n === N ? 1 : 0; syncIdx(); place(true); startAuto(); return; }
      tl = G.timeline({ onComplete: () => { tl = null; startAuto(); } });
      if (from === N && n === 0 && !byUser) {
        // de la meta al inicio: un corte con fundido, como cuando un anuncio vuelve a empezar
        tl.to(stage, { autoAlpha: 0, duration: .4, ease: 'power2.in' })
          .add(() => { drv.z = 0; drv.q = 0; place(true); })
          .to(stage, { autoAlpha: 1, duration: .5, ease: 'power2.out' });
        return;
      }
      if (z > 0 && n < N) tl.to(drv, { z: 0, duration: .5, ease: 'power2.inOut' });
      tl.to(drv, { q: n, duration: .9 + .32 * Math.abs(n - from), ease: 'power2.inOut' });
      if (n === N) tl.to(drv, { z: 1, duration: 1.1, ease: 'power2.inOut' }, '>-.05');
    }
    // cada paso dura unos segundos; en la meta se queda un poco más y luego vuelve al inicio. El reloj corre siempre:
    // aunque la sección no esté a la vista o se esté en otra pestaña (entonces solo espera), al volver sigue en curso.
    const AUTO_MS = 4600, META_MS = 4200;
    function startAuto() {
      stopAuto();
      if (STATIC) return;   // sin GSAP también avanza, con saltos en vez de recorrido
      auto = setTimeout(() => { auto = 0; if (document.hidden || tab !== 'inicio' || tl) { startAuto(); return; } goTo(cur < N ? cur + 1 : 0); }, cur >= N ? META_MS : AUTO_MS);
    }
    function stopAuto() { if (auto) clearTimeout(auto); auto = 0; }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !auto && !tl) startAuto(); });
    const io2 = new IntersectionObserver((ents) => {
      for (const e of ents) {
        active = e.isIntersecting && e.intersectionRatio >= .45;
        if (active) { place(true); if (!raf) raf = requestAnimationFrame(tick); }   // al volver, la cámara se planta donde va la animación
      }
    }, { threshold: [0, .45, 1] });
    io2.observe(sec);
    function resize() { if (panels.inicio.hidden) return; layout(); place(true); }
    function paintCam() { world.style.transform = 'translate(' + cam.x.toFixed(1) + 'px,' + cam.y.toFixed(1) + 'px) scale(' + cam.k.toFixed(4) + ')'; }
    function tick() {
      const lag = reduced ? 1 : (mobile.matches ? .2 : .11);   // en celular la cámara sigue más de cerca: el escenario es bajo y el teléfono se salía
      cam.x += (want.x - cam.x) * lag; cam.y += (want.y - cam.y) * lag; cam.k += (want.k - cam.k) * lag;
      paintCam();
      raf = active ? requestAnimationFrame(tick) : 0;
    }
    function setIdx(n) {
      if (n === idx) return;
      const old = steps[idx], nu = steps[n];
      idx = n;
      const scr = $$('.scr', phone), name = n <= 5 ? ['carreras', 'inscripcion', 'pago', 'crews', 'dorsal', 'dorsal'][n] : 'dorsal';
      pushScreen(scr, name);
      if (n === 5 && !kitPlayed) { kitPlayed = true; playKit(); } else if (n !== 5 && n !== 6 && kitPlayed) { kitPlayed = false; resetKit(); }
      if (n === 2) playPago();
      if (!G || reduced) { steps.forEach((s, k) => s.classList.toggle('on', k === n)); return; }
      const show = () => { nu.classList.add('on'); G.fromTo($$('.label, .h2, p, .acts', nu), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, ease: EASE, stagger: .07 }); };
      if (old) G.to($$('.label, .h2, p, .acts', old), { y: -10, autoAlpha: 0, duration: .2, ease: 'power2.in', stagger: .02, onComplete: () => { old.classList.remove('on'); G.set($$('.label, .h2, p, .acts', old), { clearProps: 'all' }); show(); } });
      else show();
    }
    let curScr = 'carreras';
    function pushScreen(scr, name) {
      if (name === curScr) return;
      const from = scr.find((s) => s.dataset.s === curScr), to = scr.find((s) => s.dataset.s === name), fwd = scr.indexOf(to) > scr.indexOf(from);
      curScr = name;
      if (!G || reduced) { from.classList.remove('on'); to.classList.add('on'); return; }
      // si se toca rápido, se corta lo que estuviera en curso y solo quedan a la vista la que sale y la que entra
      G.killTweensOf(scr);
      scr.forEach((s) => { if (s !== from && s !== to) { s.classList.remove('on'); G.set(s, { clearProps: 'transform,opacity,visibility' }); } });
      to.classList.add('on');
      // la pantalla que queda encima (la última en el DOM) recorre todo el ancho; la de abajo solo acompaña un poco
      const toOnTop = scr.indexOf(to) > scr.indexOf(from);
      const dir = fwd ? 1 : -1;
      G.fromTo(to, { xPercent: toOnTop ? 100 * dir : 30 * dir, autoAlpha: 1 }, { xPercent: 0, autoAlpha: 1, duration: .42, ease: 'power3.inOut' });
      G.fromTo(from, { xPercent: 0, autoAlpha: 1 }, { xPercent: toOnTop ? -30 * dir : -100 * dir, autoAlpha: 1, duration: .42, ease: 'power3.inOut',
        onComplete: () => { from.classList.remove('on'); G.set(from, { clearProps: 'transform,opacity,visibility' }); } });
    }
    function playPago() {
      if (!G || reduced) return;
      const box = $('[data-okbox]', phone), last = $('[data-last]', phone);
      last.classList.remove('ok');
      G.set(box, { autoAlpha: 0, scale: .92 });
      G.timeline({ delay: .55 }).add(() => last.classList.add('ok')).to(box, { autoAlpha: 1, scale: 1, duration: .4, ease: 'back.out(1.5)' }, .15);
    }
    function playKit() {
      const sl = $('.sl', phone), fr = $('.fr', phone), toast = $('[data-toast]', phone), qr = $('.qr', phone);
      if (!G || reduced) { toast.style.opacity = 1; toast.style.transform = 'none'; fr.style.opacity = 1; return; }
      G.timeline({ delay: .5 })
        .to(fr, { opacity: 1, duration: .2 })
        .fromTo(sl, { top: '4%', opacity: 1 }, { top: '94%', duration: .7, ease: 'power1.inOut', repeat: 1, yoyo: true })
        .to(sl, { opacity: 0, duration: .15 })
        .fromTo(qr, { scale: 1 }, { scale: 1.06, duration: .12, yoyo: true, repeat: 1 }, '-=.1')
        .to(toast, { opacity: 1, y: 0, duration: .4, ease: 'back.out(1.6)' }, '-=.05');
    }
    function resetKit() {
      const sl = $('.sl', phone), fr = $('.fr', phone), toast = $('[data-toast]', phone);
      if (G) G.set([sl, fr], { opacity: 0 }); if (G) G.set(toast, { opacity: 0, y: 12 });
    }
    function snapTape() {
      const a = $('.a', tape), b = $('.b', tape);
      if (!G || reduced) { tape.style.opacity = 0; return; }
      G.to(a, { rotation: -70, x: -20, y: 30, opacity: 0, duration: .8, ease: 'power2.out' });
      G.to(b, { rotation: 70, x: 20, y: 30, opacity: 0, duration: .8, ease: 'power2.out' });
      const sr = stage.getBoundingClientRect(), q = at(tapeF);
      burst(sr.left + cam.x + q.x * cam.k, sr.top + cam.y + q.y * cam.k - pw * .4, 46);
    }
    function resetTape() { const a = $('.a', tape), b = $('.b', tape); if (G) G.set([a, b], { clearProps: 'all' }); tape.style.opacity = 1; }
    layout(); setIdx(0); place(true); startAuto();   // arranca desde la carga: cuando alguien llega a la sección, ya está en curso
    return { resize, goTo, get step() { return cur; }, get p() { return q / N; } };
  })();

  // ───────── Confeti de marca ─────────
  const confeti = $('#confeti');
  function burst(x, y, n = 54) {
    if (!G || reduced) return;
    const cols = ['#12383B', '#1F6366', '#C65A3D', '#B7C2BE', '#1F6366', '#12383B'], q = rng(7);
    confeti.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i'), wv = 7 + q() * 7, hv = 12 + q() * 14;
      el.style.cssText = 'width:' + wv + 'px;height:' + hv + 'px;background:' + cols[i % cols.length];
      confeti.appendChild(el);
      const vx = (q() - .5) * 900, vy = -500 - q() * 700, rot = (q() - .5) * 900;
      G.set(el, { x, y, rotation: q() * 180, opacity: 1 });
      G.to(el, { x: x + vx, duration: 1.6, ease: 'power1.out' });
      G.to(el, { keyframes: [{ y: y + vy * .55, duration: .5, ease: 'power2.out' }, { y: y + vy * .55 + 700, duration: 1.1, ease: 'power2.in' }] });
      G.to(el, { rotation: '+=' + rot, duration: 1.6, ease: 'none' });
      G.to(el, { autoAlpha: 0, duration: .4, delay: 1.25 });
    }
  }

  // ───────── Pestaña: la encuesta, incrustada ─────────
  const frame = $('#enc-frame'), encWait = $('#enc-wait'), encFallback = $('#enc-fallback'), encOpen = $('#enc-open');
  function surveyURL() {
    const base = SURVEY_URL;
    const q = testing ? 'c=prueba' : 'c=' + encodeURIComponent(origin.channel || 'landing') + '&campana=' + encodeURIComponent(origin.campaign || 'landing');
    return base + '?' + q;
  }
  encOpen.href = surveyURL(); encFallback.href = surveyURL();
  let surveyLoaded = false;
  function openSurvey() {
    if (surveyLoaded) return; surveyLoaded = true;
    frame.src = surveyURL() + '&embed=1';
    const t = setTimeout(() => { encFallback.hidden = false; }, 7000);
    frame.addEventListener('load', () => { clearTimeout(t); frame.classList.add('ready'); encWait.hidden = true; }, { once: true });
  }
  // la encuesta, al terminar, puede pedir abrir la lista de espera
  window.addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.xolo === 'lista') showTab('lista'); });

  // ───────── Pestaña: la lista de espera ─────────
  const form = $('#wiz'), steps = $$('.step', form), res = $('#res'), stepno = $('[data-stepno]'), pg = $$('#pg i'), stripes = $$('#stripes i');
  const bib = $('#bib'), tilt = $('#bib-tilt'), bName = $('[data-bib-name]'), bZone = $('[data-bib-zone]'), bNum = $('[data-bib-num]'), bState = $('[data-bib-state]'), bQR = $('[data-bib-qr]');
  const nameIn = $('#f-name'), nameField = $('[data-field="name"]'), contact = $('#f-contact'), cField = $('[data-field="contact"]');
  const filaN = $('#fila-n'), heroFila = $('#hero-fila');
  const state = { result: null };
  let si = 0, mail = false, busy = false, listaOpened = false;
  $('#tiles').innerHTML = ZONES.map(([v, l]) => '<label class="tile"><input type="radio" name="zone" value="' + v + '"><span>' + esc(l) + '</span></label>').join('');
  $('#orbit').innerHTML = PROFILES.map(([v, l]) => '<label class="orb"><input type="radio" name="profile" value="' + v + '"><span class="rc"></span><span class="rt">' + esc(l) + '</span></label>').join('');

  function qrSVG(text) {
    if (!window.qrcode) return '';
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    return '<svg class="code" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="Código QR de tu enlace"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + d + '" fill="#12383B"/></svg>';
  }
  function qrCells(text) {
    if (!window.qrcode) return null;
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    return { n: q.getModuleCount(), dark: (r, c) => q.isDark(r, c) };
  }
  const inviteLink = (code) => PUBLIC_URL + '?ref=' + code + '#lista';
  const odometer = (n) => String(n).split('').map((d) =>
    '<span class="odo" aria-hidden="true" data-d="' + d + '"><span>' + '0123456789'.split('').map((x) => '<i>' + x + '</i>').join('') + '</span></span>').join('');

  // el dorsal se inclina con el puntero
  if (finePointer && G && !reduced) {
    const side = $('.lista .side');
    side.addEventListener('pointermove', (e) => { const r = bib.getBoundingClientRect(); G.to(tilt, { rotationY: ((e.clientX - r.left) / r.width - .5) * 16, rotationX: ((e.clientY - r.top) / r.height - .5) * -12, duration: .5, ease: EASE }); });
    side.addEventListener('pointerleave', () => G.to(tilt, { rotationY: 0, rotationX: 0, duration: .8, ease: EASE }));
  }

  function paintProgress(n) {
    pg.forEach((d, k) => { d.classList.toggle('on', k < n); d.classList.toggle('now', k === n); });
    stripes.forEach((d, k) => { d.classList.toggle('on', k < n); d.classList.toggle('now', k === n && n < 4); });
  }
  function focusStep(arrived) {
    if (!res.hidden) { res.focus({ preventScroll: true }); return; }
    const s = steps[si], t = s.querySelector('input:checked') || s.querySelector('input:not(.hp)');
    if (arrived && !finePointer) { $('#t-lista').focus({ preventScroll: true }); return; }
    if (t) t.focus({ preventScroll: true });
  }
  function showStep(n) {
    hit('paso_' + (n + 1), true);
    const old = steps[si], nu = steps[n];
    si = n; stepno.textContent = 'Paso ' + (n + 1) + ' de ' + steps.length;
    paintProgress(n);
    if (old === nu) return;
    if (!G || reduced) { old.hidden = true; nu.hidden = false; focusStep(); return; }
    G.to(old, { autoAlpha: 0, y: -8, duration: .2, ease: 'power2.in', onComplete: () => {
      old.hidden = true; G.set(old, { clearProps: 'all' }); nu.hidden = false;
      G.fromTo(nu, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .5, ease: EASE }); focusStep();
    } });
  }
  function setErr(sel, msg, field) {
    const p = $(sel); if (p) p.textContent = msg || '';
    if (field) { field.classList.toggle('bad', !!msg); const inp = field.querySelector('input'); if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  }
  function shake() {
    if (reduced) return;
    tilt.classList.remove('shake'); void tilt.offsetWidth; tilt.classList.add('shake'); setTimeout(() => tilt.classList.remove('shake'), 560);
  }
  // el nombre se imprime letra por letra mientras escribes
  let printed = '';
  function printName(v) {
    if (!v) { bName.textContent = 'Tu nombre'; bName.classList.add('empty'); return; }
    bName.classList.remove('empty');
    bName.innerHTML = [...v].map((ch) => '<span>' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>').join('');
  }
  nameIn.addEventListener('input', () => {
    const v = Array.from(cleanName(nameIn.value)).slice(0, 20).join('');
    if (v.startsWith(printed) && v.length === printed.length + 1 && printed) {
      const sp = document.createElement('span'); sp.innerHTML = v.slice(-1) === ' ' ? '&nbsp;' : esc(v.slice(-1)); bName.appendChild(sp);
    } else printName(v);
    printed = v;
    if (nameField.classList.contains('bad')) setErr('#e-name', '', nameField);
  });
  function printZone(input) { bZone.textContent = input.nextElementSibling.textContent; bZone.classList.remove('empty', 'print'); void bZone.offsetWidth; bZone.classList.add('print'); }
  // contacto: WhatsApp o correo
  function applyMode() {
    $('#l-contact').textContent = mail ? 'Tu correo' : 'Tu WhatsApp';
    $('[data-swap]').textContent = mail ? 'Prefiero dejar mi WhatsApp' : 'Prefiero dejar mi correo';
    contact.type = mail ? 'email' : 'tel'; contact.inputMode = mail ? 'email' : 'tel';
    contact.autocomplete = mail ? 'email' : 'tel-national'; contact.maxLength = mail ? 254 : 24;
    cField.classList.toggle('mail', mail); cField.classList.toggle('tel', !mail);
    $('#h-contact').textContent = mail ? 'Te avisamos por correo cuando abramos. Nada más.' : 'Son 8 dígitos, como 8888 8888. Te avisamos cuando abramos. Nada más.';
    $('[data-group]').hidden = mail;
    setErr('#e-contact', '', cField);
  }
  $('[data-swap]').addEventListener('click', () => { mail = !mail; contact.value = ''; applyMode(); contact.focus(); });
  contact.addEventListener('input', () => {
    if (!mail) cField.classList.toggle('intl', /^\s*(\+|00)/.test(contact.value));
    if (cField.classList.contains('bad')) setErr('#e-contact', '', cField);
  });
  function normPhone(v) {
    let d = (v || '').replace(/[^\d+]/g, '');
    if (d.startsWith('00')) d = '+' + d.slice(2);
    if (d.startsWith('+')) {
      const g = d.slice(1).replace(/\D/g, '');
      if (g.startsWith('505')) return /^505[2578]\d{7}$/.test(g) ? '+' + g : null;     // Nicaragua: +505 y 8 dígitos
      // otros países: código y número, al menos 10 dígitos (con 8 la base lo tomaría por un número de Nicaragua)
      return g.length >= 10 && g.length <= 15 && g[0] !== '0' ? '+' + g : null;
    }
    d = d.replace(/\D/g, '');
    if (/^[2578]\d{7}$/.test(d)) return '+505' + d;
    if (/^505[2578]\d{7}$/.test(d)) return '+' + d;
    return null;
  }
  // el nombre sin caracteres invisibles y con al menos una letra o número; se corta por caracteres, no por mitades de emoji
  const cleanName = (v) => (v || '').replace(/[­​-‏⁠-⁤﻿]/g, '').trim().replace(/\s+/g, ' ');
  const nameOk = (v) => /[\p{L}\p{N}]/u.test(v);
  const normEmail = (v) => { v = (v || '').trim().toLowerCase(); return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(v) && v.length <= 254 ? v : null; };
  function readContact() {
    const v = contact.value.trim();
    if (!v) { setErr('#e-contact', mail ? 'Escribí tu correo para avisarte.' : 'Escribí tu WhatsApp para avisarte.', cField); return null; }
    const ok = mail ? normEmail(v) : normPhone(v);
    if (!ok) { setErr('#e-contact', mail ? 'Revisá el correo: falta algo, como la @ o el dominio.' : 'Revisá el número: son 8 dígitos, como 8888 8888. Si no es de Nicaragua, empieza con + y el código del país.', cField); return null; }
    setErr('#e-contact', '', cField);
    return ok;
  }
  // al tocar una opción con el dedo o el ratón, avanza solo; con el teclado se avanza con Enter
  let ptrAt = 0;
  form.addEventListener('pointerdown', (e) => { if (e.target.closest('.tile, .orb')) ptrAt = performance.now(); });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'zone') { setErr('#e-zone', ''); printZone(t); }
    if (t.name === 'profile') setErr('#e-profile', '');
    if (t.name === 'consent') { setErr('#e-consent', ''); $('[data-consent]').classList.remove('bad'); }
    if ((t.name === 'zone' || t.name === 'profile') && performance.now() - ptrAt < 900) {
      setTimeout(() => { if (steps[si].contains(t) && !busy) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }, 420);
    }
  });
  $$('[data-prev]', form).forEach((b) => b.addEventListener('click', () => showStep(si - 1)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    if (si === 0) {
      const nm = cleanName(nameIn.value);
      if (!nm || !nameOk(nm)) { setErr('#e-name', '¿Cómo te llamamos? Basta tu nombre.', nameField); shake(); nameIn.focus(); return; }
      setErr('#e-name', '', nameField); showStep(1); return;
    }
    if (si === 1) {
      if (!form.elements.zone.value) { setErr('#e-zone', 'Elegí dónde corrés.'); shake(); $('[name=zone]', form).focus(); return; }
      showStep(2); return;
    }
    if (si === 2) {
      if (!form.elements.profile.value) { setErr('#e-profile', 'Elegí la que más se parezca a vos.'); shake(); $('[name=profile]', form).focus(); return; }
      showStep(3); return;
    }
    const c = readContact(), consent = $('[name=consent]', form);
    let bad = c ? null : contact;
    if (!consent.checked) { setErr('#e-consent', 'Para anotarte necesitamos tu permiso para guardar estos datos.'); $('[data-consent]').classList.add('bad'); bad = bad || consent; }
    if (bad) { shake(); bad.focus(); return; }
    if ($('[name=sitio]', form).value) { showResult({ position: null, code: null, existing: true, via: 'wa' }); return; }
    const item = {
      p_client_id: uuid(), p_name: Array.from(cleanName(nameIn.value)).slice(0, 60).join(''), p_whatsapp: mail ? null : c, p_email: mail ? c : null,
      p_zone: form.elements.zone.value, p_profile: form.elements.profile.value, p_wants_group: !mail && $('[name=group]', form).checked,
      p_consent_version: CONSENT_VERSION, p_channel: origin.channel || null, p_campaign: origin.campaign || null,
      p_creator: origin.creator || null, p_ref: origin.ref || null
    };
    const btn = $('[data-final]', form), gl = $('.gl', btn);
    busy = true; btn.disabled = true; btn.classList.add('busy'); gl.textContent = 'Guardando tu lugar…'; if (btn.parentElement.classList.contains('sweep-w')) btn.parentElement.classList.add('on');
    setErr('[data-send]', '');
    store.set(QUEUE, item);
    const r = await send(item);
    busy = false; btn.disabled = false; btn.classList.remove('busy'); gl.textContent = 'Recibir mi número'; if (btn.parentElement.classList.contains('sweep-w')) btn.parentElement.classList.remove('on');
    if (r.ok) { store.set(QUEUE, null); showResult({ ...r.data, via: mail ? 'mail' : 'wa' }); }
    else if (r.retry) { showResult({ queued: true, via: mail ? 'mail' : 'wa' }); clearTimeout(retryT); retryT = setTimeout(flushQueue, 20000); }
    else { store.set(QUEUE, null); setErr('[data-send]', r.message); }
  });
  async function send(item) {
    try {
      const resp = await fetch(SUPABASE_URL + '/rest/v1/rpc/join_waitlist', {
        method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(item)
      });
      if (resp.ok) return { ok: true, data: await resp.json() };
      const body = await resp.json().catch(() => ({}));
      if (resp.status >= 500 || body.hint === 'reintentar' || resp.status === 429) return { retry: true };
      return { message: 'No pudimos guardar tus datos. Revisá que estén bien escritos e intentá otra vez.' };
    } catch (e) { return { retry: true }; }
  }
  // el lugar apartado se reenvía solo: al volver la señal, al abrir la pestaña y cada 20 s mientras la página esté abierta
  // (si la base estaba caída no hay evento «online» que avise)
  let retryT = 0, flushing = false;
  async function flushQueue() {
    clearTimeout(retryT);
    const item = store.get(QUEUE);
    if (!item || flushing) return;
    flushing = true;
    const r = await send(item);
    flushing = false;
    if (r.ok) { store.set(QUEUE, null); showResult({ ...r.data, via: item.p_email ? 'mail' : 'wa' }); }
    else if (r.retry) retryT = setTimeout(flushQueue, 20000);
    else {
      store.set(QUEUE, null);
      if (!res.hidden) res.innerHTML = '<h3>No pudimos guardar tu lugar</h3><p>Algo en los datos no pasó. Volvé a llenar el formulario, toma un minuto.</p><button class="textlink" type="button" onclick="location.reload()">Volver a intentarlo</button>';
    }
  }
  // cuántas personas hay en la fila: se muestra solo cuando ya son varias
  let filaCount = null;
  async function fetchCount() {
    if (filaCount !== null) return filaCount;
    try {
      const resp = await fetch(SUPABASE_URL + '/rest/v1/rpc/waitlist_count', { method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: '{}' });
      if (resp.ok) filaCount = +(await resp.json()) || 0;
    } catch (e) { filaCount = 0; }
    if (filaCount >= MIN_FILA) {
      $('[data-fila-n]').textContent = filaCount; filaN.hidden = false;
      heroFila.innerHTML = '<i style="width:22px;height:3px;background:linear-gradient(90deg,#12383B 0 60%,#C65A3D 60%);border-radius:2px"></i><span><b>' + filaCount + '</b> personas ya tienen su dorsal</span>';
    }
    return filaCount;
  }

  function bibNumber(n, quiet) {
    bNum.innerHTML = '<span class="hash" aria-hidden="true">#</span>' + odometer(n);
    bState.textContent = 'En la fila';
    const odos = $$('.odo', bNum);
    const place = () => odos.forEach((o, i) => { o.firstChild.style.transitionDelay = (i * 110) + 'ms'; o.firstChild.style.transform = 'translateY(' + (-o.dataset.d * .95) + 'em)'; });
    if (quiet || reduced) { odos.forEach((o) => { o.firstChild.style.transition = 'none'; }); place(); }
    else requestAnimationFrame(() => requestAnimationFrame(place));
  }
  function bibQR(code, quiet) {
    const svg = qrSVG(inviteLink(code));
    if (!svg) return;
    bQR.innerHTML = svg;
    if (!quiet && G && !reduced) G.fromTo(bQR.firstChild, { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .5, ease: EASE, delay: .6 });
  }
  function showResult(r, quiet) {
    state.result = r.queued ? null : r;
    if (!r.queued && !testing) store.set(STORE, { position: r.position, code: r.code, existing: !!r.existing, via: r.via, name: bName.classList.contains('empty') ? '' : bName.textContent, zone: bZone.classList.contains('empty') ? '' : bZone.textContent });
    const n = typeof r.position === 'number' ? r.position : null;
    if (!quiet) hit(r.queued ? 'inscripcion_pendiente' : r.existing ? 'inscripcion_repetida' : n === null ? 'inscripcion_prueba' : 'inscripcion');
    const link = r.code ? inviteLink(r.code) : PUBLIC_URL;
    const who = r.via === 'mail' ? 'por correo' : 'por WhatsApp';
    let html;
    if (r.queued) html = '<h3>Tu lugar está apartado</h3><p>Lo guardamos en este teléfono y lo enviamos apenas tengás señal. Si podés, no cerrés esta página hasta ver tu número.</p>';
    else if (r.existing) html = '<h3>Ya estabas en la fila</h3><p>Ese contacto ya se había anotado, así que conservás tu lugar. Te escribimos ' + who + ' cuando abramos.</p>';
    else if (n === null) html = '<h3>Prueba guardada</h3><p>Las pruebas del equipo no reciben número en la fila.</p>';
    else html = '<h3>Listo. Nos vemos en la ruta.</h3><p>Tenés el #' + n + ' en la fila. Te escribimos ' + who + ' cuando abramos. El QR de tu dorsal es tu enlace: quien lo escanee se anota con vos.</p>';
    if (!r.queued && r.code) {
      const text = 'Me anoté en Xolo Run, la app para las carreras de Nicaragua' + (n ? ', y tengo el #' + n + ' en la fila' : '') + '. Sacá tu dorsal: ' + link;
      html += '<div class="share">' +
        '<a class="go" href="https://wa.me/?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.6l4.7-1.2A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.8-.8.9-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>' +
        'Invitar a mi crew</a>' +
        (n ? '<button class="textlink" type="button" data-story><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/></svg>Guardar mi dorsal para historias</button>' : '') +
        '<button class="textlink" type="button" data-copy><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>Copiar mi enlace</button>' +
        '</div><p class="linkline">Tu enlace: ' + esc(link.replace(/^https?:\/\//, '')) + '</p>';
    }
    if (!r.queued) html += '<div class="enc-box"><p><b>¿Nos ayudás con unos minutos?</b></p><p>Respondé la encuesta «Correr en Nicaragua». Es anónima y nos ayuda a diseñar la app con lo que de verdad pasa.</p>' +
      '<button class="textlink" type="button" data-tab-link="encuesta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Responder la encuesta</button></div>';
    if (testing && !r.queued) html += '<details class="raw"><summary>Lo que se guardó (solo en modo prueba)</summary><pre>' + esc(JSON.stringify(r, null, 2)) + '</pre></details>';
    steps.forEach((s) => { s.hidden = true; }); stepno.textContent = 'Dorsal reclamado'; $('#sub').hidden = true; paintProgress(4);
    $('#t-lista').textContent = r.queued ? 'Tu dorsal está en camino' : 'Tu dorsal ya es tuyo';
    res.hidden = false; res.innerHTML = html;
    if (n !== null) bibNumber(n, quiet);
    if (r.code) bibQR(r.code, quiet);
    if (!quiet) {
      res.focus({ preventScroll: true });
      if (G && !reduced) {
        G.fromTo(res.children, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .07, duration: .5, ease: EASE, delay: .2 });
        if (n !== null) { const br = bib.getBoundingClientRect(); setTimeout(() => burst(br.left + br.width / 2, br.top + br.height * .35), 350); G.fromTo(tilt, { rotationY: -8, scale: .97 }, { rotationY: 0, scale: 1, duration: .9, ease: 'back.out(1.4)' }); }
      }
    }
  }
  document.addEventListener('click', async (e) => {
    const copy = e.target.closest('[data-copy]'), story = e.target.closest('[data-story]');
    if (copy) hit('copiar_enlace'); if (story) hit('guardar_historia');
    if (copy && state.result && state.result.code) {
      const link = inviteLink(state.result.code);
      // el portapapeles moderno no existe en http ni en algunos navegadores dentro de apps: se copia a la antigua y, si tampoco, se muestra el enlace
      let ok = false;
      try { await navigator.clipboard.writeText(link); ok = true; } catch (err) {
        const ta = document.createElement('textarea'); ta.value = link; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, link.length);
        try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove();
      }
      copy.lastChild.textContent = ok ? 'Enlace copiado' : link;
      setTimeout(() => { copy.lastChild.textContent = 'Copiar mi enlace'; }, 2400);
    }
    if (story && state.result && typeof state.result.position === 'number') saveStory(story, state.result.position, state.result.code);
  });
  function openLista(quiet) {
    fetchCount();
    if (listaOpened) return; listaOpened = true;
    const prev = store.get(STORE);
    if (prev && (typeof prev.position === 'number' || prev.existing)) {
      if (prev.name) printName(prev.name);
      if (prev.zone) { bZone.textContent = prev.zone; bZone.classList.remove('empty'); }
      showResult(prev, true);
    } else {
      // si quedó un lugar apartado sin enviar (sin señal o la base caída), se muestra como apartado, no el formulario vacío
      const q = store.get(QUEUE);
      if (q) {
        printName(Array.from(q.p_name || '').slice(0, 20).join(''));
        const z = ZONES.find(([v]) => v === q.p_zone); if (z) { bZone.textContent = z[1]; bZone.classList.remove('empty'); }
        showResult({ queued: true, via: q.p_email ? 'mail' : 'wa' }, true);
      }
      flushQueue();
      if (!q) hit('paso_1', true);   // el primer paso ya está a la vista al abrir: showStep no lo recorre
      if (!q && !quiet && G && !reduced && !ghosting) G.fromTo(tilt, { rotationY: 24, y: 20, autoAlpha: 0 }, { rotationY: 0, y: 0, autoAlpha: 1, duration: .9, ease: EASE, delay: .15 });
    }
  }

  // ───────── Imagen para historias: 1080 × 1920, el dorsal con tu QR ─────────
  async function logoImage(color) {
    // el navegador serializa <use …/> como <use …></use>: hay que aceptar las dos formas o el logo sale vacío en la imagen
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1167.83 190">' + $('#logo-h').innerHTML
      .replace(/<use href="#sym-g"\s*(\/>|><\/use>)/, $('#sym-g').innerHTML).replace(/<use href="#name-g"\s*(\/>|><\/use>)/, '<g fill="currentColor">' + $('#name-g').innerHTML + '</g>')
      .replace(/currentColor/g, color) + '</svg>';
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode(); return img;
  }
  async function makeStory(n, code) {
    for (const f of ['700 300px "Space Grotesk"', '600 60px "Space Grotesk"', '500 40px Inter', 'italic 400 60px Newsreader']) { try { await document.fonts.load(f); } catch (e) {} }
    const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    x.fillStyle = '#F3EFE7'; x.fillRect(0, 0, W, H);
    x.lineWidth = 46; x.lineCap = 'round'; x.strokeStyle = '#12383B';
    x.beginPath(); x.moveTo(-60, 1520); x.bezierCurveTo(260, 1480, 380, 1300, 560, 1320); x.bezierCurveTo(760, 1340, 860, 1560, 1140, 1500); x.stroke();
    const cub = (t, a, b, c2, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c2 + t ** 3 * d;
    x.lineCap = 'butt'; x.strokeStyle = '#C65A3D'; x.beginPath();
    for (let t = .62; t <= .78; t += .01) { const px2 = cub(t, 560, 760, 860, 1140), py2 = cub(t, 1320, 1340, 1560, 1500); t === .62 ? x.moveTo(px2, py2) : x.lineTo(px2, py2); }
    x.stroke();
    try { const lg = await logoImage('#12383B'); x.drawImage(lg, 96, 150, 480, 480 * 190 / 1167.83); } catch (e) {}
    x.fillStyle = '#12383B'; x.font = '700 120px "Space Grotesk"'; x.letterSpacing = '-3px'; x.textBaseline = 'alphabetic';
    x.fillText('Ya tengo', 96, 470); x.fillText('mi dorsal', 96, 590);
    x.letterSpacing = '0px'; x.fillStyle = '#1F6366'; x.font = 'italic 400 60px Newsreader'; x.fillText('Mismas rutas. Más gente.', 96, 680);
    const bx = 96, by = 760, bw = 888, bh = 625, r = 30;
    x.save(); x.shadowColor = 'rgba(18,56,59,.25)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(bx, by, bw, bh, r); x.fill(); x.restore();
    x.save(); x.beginPath(); x.roundRect(bx, by, bw, bh, r); x.clip(); x.fillStyle = '#12383B'; x.fillRect(bx, by, bw, 120); x.restore();
    x.fillStyle = '#F3EFE7'; x.font = '500 30px "Space Grotesk"'; x.letterSpacing = '5px'; x.textAlign = 'right'; x.fillText('LISTA DE ESPERA', bx + bw - 48, by + 72);
    x.textAlign = 'left';
    try { const neg = await logoImage('#F3EFE7'); x.drawImage(neg, bx + 48, by + 38, 300, 300 * 190 / 1167.83); } catch (e) {}
    x.fillStyle = '#4D6A6C'; x.font = '500 26px "Space Grotesk"'; x.fillText('Nº EN LA FILA', bx + 56, by + 190);
    x.letterSpacing = '-6px'; x.fillStyle = '#12383B'; let size = 210; x.font = '700 ' + size + 'px "Space Grotesk"';
    const label = '#' + n; while (x.measureText(label).width > 520 && size > 90) { size -= 10; x.font = '700 ' + size + 'px "Space Grotesk"'; }
    x.fillText(label, bx + 50, by + 390);
    x.letterSpacing = '0px';
    const q = qrCells(inviteLink(code));
    if (q) { const qs = 250, qx = bx + bw - 56 - qs, qy = by + 160, m = qs / (q.n + 4);
      x.fillStyle = '#E9EDEC'; x.beginPath(); x.roundRect(qx - 12, qy - 12, qs + 24, qs + 24, 20); x.fill(); x.fillStyle = '#fff'; x.fillRect(qx, qy, qs, qs); x.fillStyle = '#12383B';
      for (let rr = 0; rr < q.n; rr++) for (let cc = 0; cc < q.n; cc++) if (q.dark(rr, cc)) x.fillRect(qx + (cc + 2) * m, qy + (rr + 2) * m, m + .5, m + .5); }
    x.fillStyle = '#12383B'; x.font = '600 52px "Space Grotesk"'; x.letterSpacing = '1px';
    const nm = (bName.classList.contains('empty') ? '' : bName.textContent).toUpperCase().slice(0, 18); if (nm) x.fillText(nm, bx + 56, by + 520);
    x.fillStyle = '#4D6A6C'; x.font = '500 28px Inter'; x.letterSpacing = '0px';
    x.fillText((bZone.classList.contains('empty') ? '' : bZone.textContent + ' · ') + 'En la fila', bx + 56, by + 570);
    x.textAlign = 'right'; x.font = '500 24px "Space Grotesk"'; x.letterSpacing = '4px'; x.fillText('QR · ESCANEALO Y ANOTATE', bx + bw - 56, by + 570); x.textAlign = 'left';
    for (const [hx, hy] of [[bx + 26, by + 150], [bx + bw - 26, by + 150], [bx + 26, by + bh - 26], [bx + bw - 26, by + bh - 26]]) { x.fillStyle = '#F3EFE7'; x.beginPath(); x.arc(hx, hy, 11, 0, 7); x.fill(); x.strokeStyle = '#B7C2BE'; x.lineWidth = 2; x.stroke(); }
    const sw = 820, sh = 116, sx = (W - sw) / 2, sy = 1690;
    x.setLineDash([16, 12]); x.lineWidth = 4; x.strokeStyle = '#12383B'; x.beginPath(); x.roundRect(sx, sy, sw, sh, 24); x.stroke(); x.setLineDash([]);
    x.textAlign = 'center'; x.font = '600 40px Inter'; x.letterSpacing = '0px'; x.fillStyle = '#12383B'; x.fillText('Sacá tu dorsal aquí', W / 2, sy + sh / 2 + 14);
    return cv;
  }
  async function saveStory(btn, n, code) {
    const label = btn.lastChild, old = label.textContent; label.textContent = 'Preparando tu dorsal…';
    try {
      const cv = await makeStory(n, code);
      const blob = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
      const file = new File([blob], 'dorsal-xolo-run.png', { type: 'image/png' });
      const inApp = /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|musical_ly/i.test(navigator.userAgent);
      const fallback = () => {
        if (inApp) { showStoryImage(URL.createObjectURL(blob)); return; }   // el navegador de Instagram o Facebook no descarga: se muestra para guardarla con un toque largo
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // si la persona cierra el menú de compartir no pasa nada; si el navegador no lo permite, se usa la otra vía
        try { await navigator.share({ files: [file], title: 'Mi dorsal de Xolo Run' }); } catch (err) { if (err && err.name !== 'AbortError') fallback(); }
      } else fallback();
    } catch (e) {}
    label.textContent = old;
  }
  function showStoryImage(url) {
    let d = $('#story-view');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'story-view'; d.className = 'story-view'; d.setAttribute('aria-label', 'Tu dorsal para historias');
      d.innerHTML = '<p>Mantené presionada la imagen y elegí «Guardar imagen». Después subila a tu historia.</p><img alt="Tu dorsal de Xolo Run con tu número y tu QR"><button class="go" type="button" data-close-story>Listo</button>';
      document.body.appendChild(d);
      d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close-story]')) d.close(); });
    }
    $('img', d).src = url; d.showModal();
  }

  // ───────── Preguntas y aviso de privacidad ─────────
  const sheet = $('#sheet');
  function openSheet(after) {
    if (!sheet.open) {
      sheet.showModal();
      if (G && !reduced) G.fromTo(sheet, mobile.matches ? { yPercent: 100, xPercent: 0 } : { xPercent: 100, yPercent: 0 }, { xPercent: 0, yPercent: 0, duration: .5, ease: EASE });
    }
    if (after) requestAnimationFrame(after);
  }
  function closeSheet() {
    if (!sheet.open) return;
    // un solo objeto de vars: con dos objetos GSAP ignoraba el segundo, nunca llamaba a sheet.close() y el diálogo quedaba
    // abierto fuera de pantalla con la página oscurecida y bloqueada (visto en producción el 10 oct)
    if (G && !reduced) G.to(sheet, { ...(mobile.matches ? { yPercent: 100 } : { xPercent: 100 }), duration: .3, ease: 'power2.in', overwrite: true, onComplete: () => { sheet.close(); G.set(sheet, { clearProps: 'all' }); } });
    else sheet.close();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet]')) openSheet();
    if (e.target.closest('[data-priv]')) { e.preventDefault(); openSheet(() => { const d = $('#privacidad'); d.open = true; d.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' }); }); }
    if (e.target.closest('[data-close]')) closeSheet();
    if (e.target === sheet) closeSheet();
  });
  sheet.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });

  // gancho para las pruebas del equipo (solo con ?c=prueba): simula el número sin tocar la base
  if (testing) window.__xolo = { result: (n) => { showTab('lista'); setTimeout(() => showResult({ position: n, code: 'abc234', existing: false, via: 'wa' }), 700); }, route: () => route.step, goTo: (n) => route.goTo(n, true), tab: () => tab };

  // ───────── Arranque ─────────
  function start() {
    const first = tabFromHash();
    hit('pestana_' + first, true);
    history.replaceState({ tab: first }, '', location.hash ? location.href : location.href + '#' + first);
    placeInd('inicio');
    if (first !== 'inicio') showTab(first, { push: false, quiet: true });
    else { playHero(); }
    document.documentElement.classList.add('ready');
    watchReveals(document);
    if (location.hash === '#privacidad') openSheet(() => { $('#privacidad').open = true; });
    if (location.hash === '#preguntas') openSheet();   // el enlace «Preguntas» de la página Nosotros
    onScrollTop();
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (!switching) placeInd(tab); route.resize(); if (tab === 'inicio' && heroPlayed) layoutHeroRoute(); }, 120); });
    window.addEventListener('online', flushQueue);
    if (first === 'inicio') fetchCount();
  }
  // la portada arranca cuando hay fuentes (o enseguida, si tardan)
  let started = false;
  const go = () => { if (started) return; started = true; start(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  // seguridad: si GSAP no llega, la portada igual se muestra
  setTimeout(() => document.documentElement.classList.add('ready'), 2500);
})();
