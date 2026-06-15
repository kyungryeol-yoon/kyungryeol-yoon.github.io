#!/usr/bin/env bash
# 캐시/산출물 정리 후 깨끗한 dev 서버(라이브리로드, 검색 X).
# 검색까지 확인하려면 scripts/preview.sh 사용.
# "코드 바꿔도 반영 안 됨"이 계속되면 전역 캐시까지 제거:
#   rm -rf ~/Library/Caches/hugo_cache
set -e
cd "$(dirname "$0")/.."
pkill -f 'hugo server' 2>/dev/null || true
rm -rf public resources/_gen .hugo_build.lock
exec hugo server --disableFastRender --ignoreCache --noHTTPCache "$@"
