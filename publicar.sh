#!/usr/bin/env bash
# Publica la landing: estampa una versión en landing.css y landing.js (para que ningún navegador ni el CDN sirvan
# los viejos), hace commit con el mensaje que se le pase y empuja a corrernicaragua/xolorun.com.
# Uso (desde lista-espera/landing):  bash publicar.sh "Mensaje del commit"
set -euo pipefail
cd "$(dirname "$0")"
V=$(date +%Y%m%d%H%M)
sed -i -E "s#(href=\"landing\.css)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"landing\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#" index.html
grep -q "landing.css?v=$V" index.html && grep -q "landing.js?v=$V" index.html || { echo "no se pudo estampar la versión"; exit 1; }
git add -A
git commit -q -m "${1:-Publicación $V}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q origin main
echo "publicado: $(git rev-parse --short HEAD) · versión de archivos $V"
