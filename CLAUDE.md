# 블로그 작성 규칙

## 기본 정보
- **테마**: Jekyll Chirpy
- **URL**: https://kyungryeol-yoon.github.io
- **GitHub**: https://github.com/kyungryeol-yoon/kyungryeol-yoon.github.io

## Front Matter 템플릿

```yaml
---
title: "[카테고리] 이모지 핵심키워드 포함 제목"
date: YYYY-MM-DD
categories: [대분류, 소분류]
tags: [핵심키워드, 관련키워드1, 관련키워드2, 소문자5~10개]
description: "핵심 키워드를 포함한 150자 내외의 메타 설명. 검색 결과 스니펫과 AI 답변 엔진에 표시됩니다."
pin: false
---
```

> **Tip**: `description`은 Chirpy 테마의 jekyll-seo-tag 플러그인이 meta description으로 자동 반영합니다.

## 파일 규칙
- 경로: `_posts/[대분류]/[소분류]/YYYY-MM-DD-영문-slug.md`
- _posts 하위에 대분류/소분류 폴더가 존재함. 기존 폴더 구조를 먼저 확인하고 배치할 것
- 기존에 없는 카테고리 조합이면 사용자에게 경로를 확인받을 것
- slug: 영문 소문자, 하이픈 구분 (예: `langchain-ensemble-retriever`)

## 기존 카테고리 (반드시 기존 것 사용)
- DevOps > Kubernetes, Argo CD, GitLab, Harbor, Ansible, SRE
- Docker > Docker-Compose, Dockerfile, Network, Image
- Database > PostgreSQL, MySQL, Redis, InfluxDB
- Programming > Python
- Artificial Intelligence > LLM, Machine Learning
- Monitoring > Prometheus, Grafana, Loki
- Framework > Spring, Flutter
- Backend > Software Design
- News > AI
- Blog > Jekyll, Chirpy
- Linux > 다양한 소분류
- Network > 다양한 소분류

## 작성 스타일

### 헤더 규칙
- **#은 절대 사용하지 않음** (Chirpy 테마 목차 이슈)
- **##부터 시작**
- 이모지 섹션 헤더 사용: `## 🛠️ 설치 방법`, `## 📦 패키지 관리`, `## 🚀 실행하기`
- 번호 이모지도 사용 가능: `## 1️⃣ 첫 번째 단계`

### 본문 규칙
- 한국어, 존댓말 (~입니다/~합니다)
- 코드블록에 언어 태그 필수 (```bash, ```python, ```yaml 등)
- 실무에서 바로 사용할 수 있는 관점으로 정리
- Tip/주의사항은 블록인용(>) 활용:
  - `> **Tip**: 유용한 팁 내용`
  - `> ⚠️ 주의사항 내용`
- 섹션 사이 구분선 `---` 활용

### 하단 구성
- 참고 자료는 `## 📚 참고` 섹션으로 정리
- 관련 포스트 링크 연결 (기존 포스트가 있는 경우)

---

## SEO / AEO 최적화

### SEO (검색엔진 최적화)

**title 규칙**
- 핵심 키워드를 제목 앞쪽에 배치
  - ✅ `[Kubernetes] 🛡️ OPA Gatekeeper vs Kyverno: 정책 관리 가이드`
  - ❌ `[Kubernetes] 🛡️ 완전 가이드: 쿠버네티스 정책 관리 도구`

**description 규칙**
- 반드시 작성 (생략 금지)
- 150~160자 이내
- 핵심 키워드 1~2개를 자연스럽게 포함
- 글의 핵심 가치를 한 문장으로 요약
- 예시: `"Certbot과 Let's Encrypt로 Nginx에 무료 SSL 인증서를 발급하고 자동 갱신까지 설정하는 방법을 단계별로 정리했습니다."`

**tags 규칙**
- 5~10개 권장 (과도한 태그는 스팸으로 인식)
- 검색 빈도 높은 키워드 우선 배치
- 도구명·기술명을 명확하게 (예: `kubernetes`, `nginx`, `python`)

**slug 규칙**
- 핵심 키워드를 포함한 서술적 slug 사용
  - ✅ `kubernetes-opa-gatekeeper-vs-kyverno`
  - ❌ `policy-guide`

**내부 링크**
- 본문 내 관련 기존 포스트를 자연스럽게 연결
- 예시: `[Prometheus 설치 가이드](/posts/prometheus-install)`

**헤더에 키워드 포함**
- 이모지 뒤에 핵심 키워드 포함
  - ✅ `## 🛠️ Certbot으로 Let's Encrypt 인증서 발급하기`
  - ❌ `## 🛠️ 설치하기`

---

### AEO (AI 답변 엔진 최적화)

ChatGPT, Perplexity, Google SGE 등 AI 답변 엔진에서 글이 인용·참조되도록 최적화합니다.

**글 상단 요약 (필수)**
- Front matter 아래 첫 단락에 2~3문장 핵심 요약 배치
- "이 글에서는 X를 Y 방법으로 다룹니다" 형태
- AI가 답변 생성 시 첫 단락을 가장 먼저 발췌함

**정의 패턴 우선**
- 각 섹션의 첫 문장에 명확한 정의 제공
  - ✅ `Kyverno는 Kubernetes 네이티브 정책 엔진으로, YAML만으로 정책을 정의할 수 있습니다.`
  - ❌ `이 섹션에서는 Kyverno에 대해 알아보겠습니다.`

**질문형 소제목 활용**
- `### OPA Gatekeeper란?` / `### Kyverno와 차이점은?` 처럼 자연어 질문 형태 권장
- AI가 질문에 답할 때 해당 섹션을 직접 발췌함

**FAQ 섹션 추가 (권장)**
- 글 하단 `## ❓ 자주 묻는 질문` 섹션을 Q&A 형식으로 구성
- 예시 형식:
  ```
  ### Q. Let's Encrypt 인증서 유효기간은?
  90일입니다. 만료 30일 전부터 자동 갱신이 시작됩니다.
  ```

**표·목록 적극 활용**
- 비교, 요약, 옵션 설명은 반드시 표나 목록으로 구조화
- AI가 테이블과 리스트를 직접 답변에 활용함

**결론 우선 (Inverted Pyramid)**
- 각 섹션의 핵심 답변을 첫 문장에 배치하고 상세 설명은 뒤에
  - ✅ `pam_tally2는 Linux에서 로그인 실패 횟수를 추적하는 PAM 모듈입니다. 설정은 /etc/pam.d/에서 합니다.`
  - ❌ `이 섹션에서 살펴볼 pam_tally2의 경우, 여러 기능이 있는데...`

## 작업 모드

### 모드 A: 기존 md 변환
채팅에서 공부하며 만든 md 파일을 블로그 규칙에 맞게 변환하는 모드.

1. `drafts/` 에서 변환할 md 파일 읽기
2. 블로그 규칙에 맞게 재구성:
   - front matter 추가 (title, date, categories, tags, **description**)
   - 헤더 ##로 변경 (# 사용 금지)
   - 이모지 섹션 헤더 적용
   - 존댓말로 통일
   - 코드블록 언어 태그 확인
3. SEO/AEO 체크:
   - title 앞쪽에 핵심 키워드 배치 여부 확인
   - description 150자 내외 작성
   - 글 상단 2~3문장 핵심 요약 추가
   - 섹션 첫 문장에 정의·결론 배치 여부 확인
4. `_posts/[대분류]/[소분류]/` 에 md 파일 생성

### 모드 B: 참고 블로그 종합
여러 블로그 URL을 참고하여 새 글을 작성하는 모드.

1. `drafts/[주제명]/refs.md`에서 참고 URL 확인
2. `drafts/[주제명]/notes.md`에서 작성자 메모 확인 (있으면)
3. 참고 URL들을 fetch하여 핵심 내용 분석 및 종합
4. 빠진 내용은 웹 검색으로 보충
5. SEO/AEO 최적화 적용하여 `_posts/[대분류]/[소분류]/` 에 md 파일 생성:
   - description 작성 (150자 내외, 핵심 키워드 포함)
   - 글 상단에 핵심 요약 단락 배치
   - 비교·요약은 표로 구조화
   - FAQ 섹션 포함 (질문형 소제목 또는 별도 섹션)

### 공통 규칙
- **md 파일 생성까지만 수행. git 작업은 하지 않음**
- 파일 생성 후 경로와 파일명을 안내할 것
- 단순 번역/복사가 아닌, 종합하여 재구성
- 참고한 URL은 하단 📚 참고 섹션에 정리