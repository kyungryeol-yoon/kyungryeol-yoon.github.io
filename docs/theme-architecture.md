# 자작 테마 구조 지도

향후 직접 수정·확장할 때를 위한 파일별 역할 정리. **기성 테마 미사용**, 루트 `layouts/`·`assets/`로 직접 구성. 디자인 토큰은 `assets/css/main.css`의 `:root` 한 곳에 모여 있다.

## 디렉토리

```
hugo.toml                  사이트 설정(권한/마크업/하이라이트/taxonomy/params)
content/                   글(중첩 섹션 페이지 번들) + 유틸 페이지(categories/archives/search)
layouts/
  _default/
    baseof.html            전체 HTML 골격(head/header/main/footer/scripts/mermaid 로더)
    single.html            글 페이지(빵부스러기·메타·커버·TOC·시리즈·이전다음)
    list.html              섹션/카테고리 목록 — 직속 글(없으면 재귀 전체)을 .Paginate로 나눠 연도별
                            (GroupByDate) + post-card.html 카드로 렌더링(홈과 동일한 페이지네이션 인프라)
    categories.html        /categories/ — 전체 카테고리 트리
    archives.html          /archives/ — 연도별 타임라인 + 개수
    search.html            /search/ — Pagefind UI
    404.html
    _markup/
      render-codeblock-mermaid.html   ```mermaid → <pre class=mermaid>, hasMermaid 플래그
      render-heading.html             h2~h4 + 호버 앵커(#) 링크
      render-image.html               이미지 lazy/decoding(트림판)
  partials/
    head.html              SEO/OG/canonical/파비콘/폰트/다크무깜빡임/CSS/adsense
    header.html            상단 nav + 다크모드 토글 버튼
    footer.html
    toc.html               우측 고정 목차(모바일 details 접이식)
    series-nav.html        시리즈 네비(2단계에서 series: 주입 후 활성, 현재 스텁)
    sidebar-nav.html       홈/목록 좌측 사이드바(col-left) — category-tree.html 진입점
    category-tree.html     재귀 카테고리 트리. dict "section"(순회 대상) "current"(렌더링 중인 Home/Section)를
                            받아 is-current/is-active-path 활성 클래스 부여(개수=RegularPagesRecursive)
    post-card.html         글 카드(제목·발췌문·날짜·태그). dict "page" "showCategory"(bool)를 받음 —
                           홈 피드(index.html)·목록(list.html)이 공유하는 카드 렌더링 단일 소스
    vt-name.html           view-transition-name 생성 로직 단일 소스(post-card.html·categories.html·
                           single.html이 공유 — 카드→본문 모프 애니메이션이 이 값 일치에 의존)
    icon-chevron.html      공용 우측 화살표 chevron(펼치기 토글). dict "size" "strokeWidth" "class"(선택)
    adsense.html           AdSense 삽입 지점(params.adsenseEnabled 게이트)
  shortcodes/
    alert.html             {{< alert "info|tip|warning|danger" >}} 4종 박스
assets/
  css/main.css             디자인 토큰(:root) + 전체 스타일
  css/chroma.css           코드 하이라이팅(라이트=github/다크=github-dark, 테마별 스코프)
  js/app.js                바닐라 JS — 기능별 독립 블록(주석 [1]~[5])
scripts/convert.mjs        Chirpy→Hugo 변환기(2단계 전체 이주에 재사용)
static/                    ads.txt, 파비콘, og-default.png
.github/workflows/hugo.yml Hugo+Pagefind 빌드·Pages 배포
```

## 기능별 "끄는 법"(모듈성)

| 기능 | 끄는 법 |
|---|---|
| 진행률 바 | `baseof.html`의 progress-bar div + `app.js` 블록[3] 삭제 |
| TOC | `single.html`의 toc partial 호출 + `toc.html` + `app.js` 블록[2] |
| 헤딩 앵커 | `render-heading.html`을 기본형으로 + `app.js` 블록[4] |
| 코드 복사 | `app.js` 블록[5] |
| 시리즈 | `single.html`의 series-nav 호출 2줄 + `series-nav.html` |
| 광고 | `hugo.toml` `adsenseEnabled=false` (이미 OFF) |
| 다크모드 | `header.html` 토글 버튼 + `head.html` 무깜빡임 스크립트 + `app.js` 블록[1] |

## 디자인 변경

- 색/간격/폰트/본문폭/줄간격: `assets/css/main.css` 최상단 `:root`(라이트) / `html[data-theme="dark"]`(다크)만 수정.
- 포인트색: `--accent` 한 변수.
- 코드 색: `hugo gen chromastyles --style=<원하는스타일>`로 재생성 후 `scripts`의 스코프 처리(README 참고) 재적용.
- 활성 상태 표현(TOC·태그 정렬·페이저·카테고리 트리 공통 어휘): `--accent`(텍스트/보더) + `--accent-soft`(배경 채우기). 새 내비게이션에 "지금 여기" 표시가 필요하면 이 두 변수만 재사용해 일관성 유지.
- 카드형 컴포넌트(`.post-card`/`.cat-card`/`.cat-card-wrap`/`.pin-box`) 모서리 둥글기는 `--radius-card`(작은 UI 요소는 `--radius`) 한 변수로 통일.
- "이름 옆 숫자" 배지(사이드바 카테고리 개수, `/archives/`·`/categories/`·`/tags/`의 레일·칩 개수)는 전부 같은 테두리 pill 스타일 — 숫자가 제목처럼 읽히는 것을 방지하는 공통 관용구.

## 카테고리(중첩 섹션) 규칙

- `categories: [A, B, C]` → `content/a/b/c/<slug>/index.md` 페이지 번들로 이동, 각 레벨에 `_index.md`(표시명 보존) 자동 생성.
- 글 URL은 front matter `url: /posts/<slug>/`로 기존 보존. 섹션 페이지 URL은 `/a/b/c/`.
- **같은 이름 하위 카테고리도 경로가 달라 충돌 없음**(`/platform/kubernetes/network/` ≠ `/infrastructure/network/`).
- 상위 카테고리 개수 = `RegularPagesRecursive`(하위 글 합산).
- 사이드바 트리(`category-tree.html`)는 재귀 partial이라 깊이 제한 없이 렌더링됨. CSS도 1단/2단/3단 이상 3단계로 폰트 크기·색이 옅어지도록 준비돼 있음(`main.css`의 `.cat-tree .children .children .cat-link`) — 하위 글이 많이 쌓인 2단 카테고리(예: `kubernetes/kubectl`)를 3단으로 더 쪼갤 때 바로 써도 됨.
