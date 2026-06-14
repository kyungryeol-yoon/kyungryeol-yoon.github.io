# hugo-demo — Chirpy → Hugo 이주 데모 (1단계)

자작 테마(기성 테마 미사용) Hugo 데모. 샘플 글 11개로 합격 기준 검증용.

## 로컬 실행

```bash
# 1) 개발 서버 (검색 제외 빠른 확인)
hugo server

# 2) 검색까지 포함한 정식 확인 (Pagefind는 빌드 후 인덱싱)
hugo --gc --minify
npx -y pagefind --site public
python3 -m http.server 1314 -d public   # http://localhost:1314
```

> `hugo server`는 메모리 빌드라 `/pagefind/`가 없어 검색이 동작하지 않습니다. 검색 확인은 위 (2)번처럼 `public/`을 정적 서버로 띄우세요.

## 글 변환 (2단계 전체 이주에 재사용)

```bash
node scripts/convert.mjs <SRC _posts> content [파일...]
# 파일 인자 생략 시 전체 변환
```

구조·기능 설명: [docs/theme-architecture.md](docs/theme-architecture.md)
