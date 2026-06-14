#!/usr/bin/env bash
# 로컬 전체 흐름 미리보기 (검색 포함). 내부 링크는 RelPermalink라 localhost에 머문다.
set -e
cd "$(dirname "$0")/.."
PORT="${1:-1314}"
echo "▶ Hugo 빌드…"
hugo --gc --minify
echo "▶ Pagefind 색인…"
npx -y pagefind --site public >/dev/null
echo "▶ http://localhost:${PORT}  (Ctrl+C 로 종료)"
python3 -m http.server "${PORT}" -d public
