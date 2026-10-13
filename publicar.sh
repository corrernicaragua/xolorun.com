#!/usr/bin/env bash
# Publica la landing EN DEV (spec 004, 13 oct 2026): estampa una versión en landing.css y landing.js (para que ningún
# navegador ni el CDN sirvan los viejos), hace commit en la rama dev y la empuja. La Action «Sitio · dev» la publica en
# dev.xolorun.com en ~1 min. A producción (xolorun.com) solo se llega con un pull request de dev a main que unen
# Saymond o Kenneth: main ya no acepta pushes directos.
# Uso (desde lista-espera/landing):  bash publicar.sh "Mensaje del commit"
set -euo pipefail
cd "$(dirname "$0")"
[ "$(git branch --show-current)" = dev ] || { echo "Estás en la rama $(git branch --show-current). Cambiate a dev: git switch dev"; exit 1; }
V=$(date +%Y%m%d%H%M)
sed -i -E "s#(href=\"landing\.css)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"landing\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"i18n\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#" index.html
grep -q "landing.css?v=$V" index.html && grep -q "landing.js?v=$V" index.html && grep -q "i18n.js?v=$V" index.html || { echo "no se pudo estampar la versión"; exit 1; }
# la página Nosotros usa la misma hoja de estilos y el mismo i18n.js desde su carpeta
sed -i -E "s#(href=\"\.\./landing\.css)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"\.\./i18n\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#" nosotros/index.html
grep -q "landing.css?v=$V" nosotros/index.html && grep -q "i18n.js?v=$V" nosotros/index.html || { echo "no se pudo estampar la versión en nosotros/"; exit 1; }
git add -A
# el coautor del commit: COAUTOR="Claude Opus 5.5" bash publicar.sh "…" si publica otra sesión
git commit -q -m "${1:-Publicación $V}" -m "Co-Authored-By: ${COAUTOR:-Claude Fable 5.1} <noreply@anthropic.com>"
git push -q origin dev
echo "publicado en dev: $(git rev-parse --short HEAD) · versión de archivos $V"
echo "Revisalo en https://dev.xolorun.com en ~1 min. Para producción: https://github.com/corrernicaragua/xolorun.com/compare/main...dev"
