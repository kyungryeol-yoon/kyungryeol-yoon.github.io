# KyungRyeol Yoon — 기술 블로그

차분하게 읽는 엔지니어링 노트 — 쿠버네티스·인프라·백엔드 기록.

- **사이트**: https://kyungryeol-yoon.github.io
- **엔진**: [Hugo](https://gohugo.io) (extended) v0.163.0 · **자작 테마**(기성 테마 미사용, 루트 `layouts/`·`assets/`)
- **검색**: [Pagefind](https://pagefind.app) (정적 인덱스)
- **배포**: GitHub Actions → GitHub Pages (`.github/workflows/hugo.yml`)

---

## 로컬 실행

### 빠른 개발 (권장) — 캐시 정리 후 라이브리로드
```bash
./scripts/dev.sh
```
떠 있는 `hugo server`를 종료하고 `public`·`resources/_gen`·`.hugo_build.lock`을 지운 뒤,
`hugo server --disableFastRender --ignoreCache --noHTTPCache` 로 띄웁니다. → http://localhost:1313

> 검색(Pagefind)은 메모리 빌드라 이 모드에선 동작하지 않습니다. 검색 확인은 아래 (정식 미리보기) 사용.

### 정식 미리보기 (검색 포함)
```bash
./scripts/preview.sh            # 기본 포트 1314
./scripts/preview.sh 8080       # 포트 지정
```
`hugo --gc --minify` 빌드 → Pagefind 색인 → `public/`을 정적 서버로 제공. → http://localhost:1314

---

## 캐시 / 잔재 제거 (코드 바꿔도 반영 안 될 때)

`hugo server`의 부분 렌더(fast render), 브라우저 캐시, 떠 있는 옛 서버 프로세스, 남은 빌드 산출물이 원인입니다. 순서대로 강하게 비웁니다.

```bash
# 1) 떠 있는 서버 종료 + 프로젝트 산출물/캐시 삭제 (= scripts/dev.sh가 자동 수행)
pkill -f 'hugo server'
rm -rf public resources/_gen .hugo_build.lock

# 2) 그래도 그대로면 전역 Hugo 캐시까지 제거
rm -rf ~/Library/Caches/hugo_cache

# 3) 깨끗하게 재실행
./scripts/dev.sh
```

> 브라우저 쪽 캐시는 **하드 리프레시(⌘⇧R)** 하거나, DevTools(F12)를 열어둔 채 Network 탭의 **Disable cache** 를 체크하세요. CSS/JS는 파일명에 해시(fingerprint)가 붙어 보통 자동 갱신되지만, 위 단계로 확실히 비울 수 있습니다.

---

## 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드 + Pagefind 색인 + Pages 배포를 자동 수행합니다.
```bash
git push origin main
```
- 워크플로우: `.github/workflows/hugo.yml` (production 빌드, `HUGO_ENVIRONMENT=production`)
- 저장소 **Settings → Pages → Source = "GitHub Actions"** 여야 합니다.
- 배포 전 로컬 점검: `HUGO_ENVIRONMENT=production hugo --gc --minify`

---

## 글 작성

글은 **페이지 번들** `content/<섹션>[/<하위섹션>]/<slug>/index.md` 로 둡니다(폴더 경로 = URL, 카테고리 = 폴더). 작성 규칙은 [`CLAUDE.md`](CLAUDE.md) 참고.

Claude Code 슬래시 명령:
- `/convert <drafts/파일.md>` — 기존 메모(`drafts/`)를 블로그 규칙에 맞게 변환
- `/write <drafts/주제>` — `drafts/<주제>/refs.md` 참고 자료를 종합해 새 글 작성

두 명령 모두 카테고리를 글 내용으로 판단해 배치하고, **md 생성까지만** 수행합니다(git 작업 안 함).

---

## 구조

- `content/` — 글(페이지 번들) · 섹션(`_index.md`)
- `layouts/` — 자작 테마 템플릿(`_default/`, `partials/`, `shortcodes/`)
- `assets/` — `css/main.css`(디자인 토큰 `:root` 한 곳), `js/app.js`
- `static/` — 파비콘·`ads.txt` 등 정적 파일
- `scripts/` — `dev.sh`(클린 dev) · `preview.sh`(검색 포함) · `convert.mjs`(이주 시 변환기)
- 테마·아키텍처 상세: [docs/theme-architecture.md](docs/theme-architecture.md)
