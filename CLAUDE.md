# 블로그 작성 규칙 (Hugo)

## 기본 정보
- **엔진**: Hugo (자작 테마, 타이포그래피 에디토리얼)
- **URL**: https://kyungryeol-yoon.github.io
- **GitHub**: https://github.com/kyungryeol-yoon/kyungryeol-yoon.github.io
- **검색**: Pagefind / **배포**: GitHub Actions(`.github/workflows/hugo.yml`)

## 파일 규칙 (페이지 번들)
- 경로: `content/<섹션>[/<하위섹션>]/<slug>/index.md`
  - 글은 **페이지 번들** — 폴더(`<slug>/`) 안에 `index.md`. **파일명에 날짜 없음**(Jekyll의 `YYYY-MM-DD-` 접두사 안 씀).
  - 이미지 등 첨부는 같은 폴더에 둠(예: `cover.png`).
- `slug`: 영문 소문자, 하이픈 구분 (예: `langchain-ensemble-retriever`). **폴더 경로가 곧 URL**.
- 예: `content/kubernetes/networking/cilium-gateway-api/index.md` → `/kubernetes/networking/cilium-gateway-api/`

## 카테고리 = 폴더 (스스로 판단)
- **카테고리는 폴더 위치로 결정**됩니다. front matter에 `categories` 키를 쓰지 않습니다.
- **글 내용을 보고 적절한 카테고리를 스스로 판단**해 배치합니다.
  - 의미가 맞는 **기존 섹션이 있으면 재사용**(중복 난립 방지).
  - 더 적합한 분류가 없으면 **새 섹션 폴더를 만들고** `_index.md`를 함께 생성합니다.
  - 새 섹션 `_index.md` 형식: `---\ntitle: "표시명"\n---`
  - 깊이는 1~3단계(대분류 또는 대분류/소분류). 폴더명은 영문 소문자-kebab.
  - 새 경로를 만들면 **생성 경로를 사용자에게 명확히 안내**합니다.
- 아래는 **현재 존재하는 섹션(참고용, 한정 아님)** — 더 맞는 새 분류면 만들어도 됩니다.

> ai〔llm·machine-learning〕 · backend〔architecture·java·python·spring·supabase〕 · blog · cs〔algorithms-ds·interview·sw-theory〕 · data-streaming〔kafka〕 · database〔influxdb·mysql·postgresql·redis〕 · devops〔ansible·argo-cd·git·gitlab·harbor·k6·sre〕 · docker · environment〔macos·virtualization〕 · frontend〔android·flutter〕 · hardware · kubernetes〔cluster·concepts·kubectl·networking·security·storage·tools·troubleshooting〕 · linux〔file-commands·network-commands·package·process·system〕 · networking · observability〔ebpf·grafana-loki·opentelemetry〕

## Front Matter 템플릿
```yaml
---
title: "[카테고리] 이모지 핵심키워드 포함 제목"
date: YYYY-MM-DD
tags: [핵심키워드, 관련키워드, 소문자 5~10개]
description: "핵심 키워드를 포함한 150자 내외 메타 설명. 검색 스니펫·AI 답변에 노출됩니다."
---
```
- **`categories` 키 없음**(폴더가 카테고리).
- 선택 키:
  - `pinned: true` — 우측 사이드바 "고정 글"에 노출.
  - `series: "시리즈명"` — 같은 섹션 내 같은 series 글끼리 시리즈 네비 자동.
  - `image: cover.png` + `imageAlt: "설명"` — 대표 이미지(번들 안 파일).
  - `noads: true` — 그 글에서 본문 광고 숨김.
- `description`은 테마 head가 meta description으로 사용합니다(생략 금지).

## 작성 스타일

### 헤더 규칙
- **`#`(H1)은 절대 사용하지 않음** — 제목이 페이지의 유일한 H1이고, 목차(TOC)는 `##`~`####`만 잡습니다. `#`을 쓰면 목차에서 누락되고 H1이 중복됩니다.
- **`##`부터 시작**, 이모지 섹션 헤더: `## 🛠️ 설치 방법`, `## 🚀 실행하기`. 번호 이모지도 가능: `## 1️⃣ 첫 단계`.

### 본문 규칙
- 한국어, 존댓말(~입니다/~합니다).
- 코드블록 언어 태그 필수(```bash, ```python, ```yaml 등).
- 실무에서 바로 쓰는 관점으로 정리.
- Tip/주의는 블록인용(>): `> **Tip**: …`, `> ⚠️ …`. 섹션 사이 `---` 구분선.

### 하단 구성
- 참고 자료는 `## 📚 참고` 섹션으로 정리.
- 관련 기존 글이 있으면 내부 링크 연결(`[제목](/섹션/하위/slug/)`).

---

## SEO / AEO 최적화

### SEO
- **title**: 핵심 키워드를 앞쪽에. ✅ `[Kubernetes] 🛡️ OPA Gatekeeper vs Kyverno: 정책 관리 가이드`
- **description**: 필수, 150~160자, 핵심 키워드 1~2개 자연스럽게, 글의 가치 한 문장.
- **tags**: 5~10개, 검색 빈도 높은 키워드 우선, 도구·기술명 명확히(소문자).
- **slug**: 핵심 키워드 포함 서술형(`kubernetes-opa-gatekeeper-vs-kyverno`).
- **내부 링크**: 관련 기존 글을 본문에 자연스럽게 연결.
- **헤더에 키워드**: 이모지 뒤 핵심 키워드 포함(`## 🛠️ Certbot으로 Let's Encrypt 인증서 발급하기`).

### AEO (AI 답변 엔진 최적화)
- **글 상단 요약(필수)**: front matter 아래 첫 단락에 2~3문장 핵심 요약("이 글에서는 X를 Y 방법으로 다룹니다").
- **정의 패턴 우선**: 각 섹션 첫 문장에 명확한 정의("Kyverno는 … 정책 엔진입니다").
- **질문형 소제목**: `### OPA Gatekeeper란?` / `### 차이점은?`.
- **FAQ 섹션 권장**: 하단 `## ❓ 자주 묻는 질문`을 Q&A로.
- **표·목록 적극 활용**: 비교·요약·옵션은 표/목록으로 구조화.
- **결론 우선(역피라미드)**: 각 섹션 핵심 답을 첫 문장에.

---

## 작업 모드

### 모드 A: 기존 md 변환 (`/convert`)
1. `drafts/`에서 변환할 md 읽기.
2. **내용 기준으로 카테고리 스스로 판단**(기존 섹션 재사용 또는 새 섹션+`_index.md` 생성).
3. 규칙에 맞게 재구성: front matter(title·date·tags·description), `##` 헤더+이모지, 존댓말, 코드 언어태그, 상단 요약, 📚 참고.
4. `content/<섹션>/<slug>/index.md` 생성 후 경로 안내.

### 모드 B: 참고 블로그 종합 (`/write`)
1. `drafts/<주제>/refs.md`(참고 URL), `notes.md`(메모, 있으면) 확인.
2. URL fetch → 핵심 분석·종합(단순 복사 금지) → 부족분 웹 검색 보충.
3. **카테고리 스스로 판단/생성** → SEO·AEO 적용 작성(상단 요약·표·FAQ·📚 참고).
4. `content/<섹션>/<slug>/index.md` 생성 후 경로 안내.

### 공통 규칙
- **md 파일 생성까지만 수행. git 작업은 하지 않음.**
- 생성 후 경로·파일명 안내.
- 단순 번역/복사가 아닌 종합 재구성. 참고 URL은 하단 📚 참고에 정리.
