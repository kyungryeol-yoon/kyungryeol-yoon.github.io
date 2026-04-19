# 블로그 작성 규칙

## 기본 정보
- **테마**: Jekyll Chirpy
- **URL**: https://kyungryeol-yoon.github.io
- **GitHub**: https://github.com/kyungryeol-yoon/kyungryeol-yoon.github.io

## Front Matter 템플릿

```yaml
---
title: "[카테고리] 이모지 제목"
date: YYYY-MM-DD
categories: [대분류, 소분류]
tags: [소문자태그1, 소문자태그2, 소문자태그3]
pin: true
---
```

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

## 작업 모드

### 모드 A: 기존 md 변환
채팅에서 공부하며 만든 md 파일을 블로그 규칙에 맞게 변환하는 모드.

1. `drafts/` 에서 변환할 md 파일 읽기
2. 블로그 규칙에 맞게 재구성:
   - front matter 추가
   - 헤더 ##로 변경 (# 사용 금지)
   - 이모지 섹션 헤더 적용
   - 존댓말로 통일
   - 코드블록 언어 태그 확인
3. `_posts/[대분류]/[소분류]/` 에 md 파일 생성

### 모드 B: 참고 블로그 종합
여러 블로그 URL을 참고하여 새 글을 작성하는 모드.

1. `drafts/[주제명]/refs.md`에서 참고 URL 확인
2. `drafts/[주제명]/notes.md`에서 작성자 메모 확인 (있으면)
3. 참고 URL들을 fetch하여 핵심 내용 분석 및 종합
4. 빠진 내용은 웹 검색으로 보충
5. 블로그 규칙에 맞게 `_posts/[대분류]/[소분류]/` 에 md 파일 생성

### 공통 규칙
- **md 파일 생성까지만 수행. git 작업은 하지 않음**
- 파일 생성 후 경로와 파일명을 안내할 것
- 단순 번역/복사가 아닌, 종합하여 재구성
- 참고한 URL은 하단 📚 참고 섹션에 정리