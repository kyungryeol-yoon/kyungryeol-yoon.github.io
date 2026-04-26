---
title: "[AI] 🤖 바이브 코딩의 핵심: Claude Code 프로젝트 문서 관리 완전 가이드"
date: 2026-04-21
categories: [Artificial-Intelligence, LLM]
tags: [claude-code, vibe-coding, llm, ai, documentation, claude]
pin: false
---

> AI와 함께 개발하는 시대, 코드보다 중요한 건 **문서**입니다.
>
> Claude Code를 활용한 프로젝트에서 문서는 "사람이 읽기 위한 기록"이 아니라
> **"AI가 매 세션마다 기억을 복원하기 위한 장치"**입니다.
> 이 글에서는 어떤 언어, 어떤 프로젝트에서든 통용되는 문서 관리 전략과
> 실전 프롬프트를 공유합니다.

---

## 1️⃣ 왜 문서 관리가 바이브 코딩의 핵심인가

### AI는 매 세션마다 기억을 잃습니다

사람은 프로젝트를 며칠 놓아둬도 코드를 보면 "아 맞아, 이랬지" 하고 감을 되찾습니다.
하지만 AI는 매번 0부터 다시 시작합니다. 이전 세션에서 아무리 좋은 대화를 했어도,
새 세션이 열리면 모든 맥락이 사라집니다.

이때 **문서가 AI의 장기 기억** 역할을 합니다.
잘 정리된 문서가 있으면 AI는 몇 초 만에 프로젝트 맥락을 파악하고 작업에 들어갈 수 있습니다.
문서가 없으면 매번 처음부터 설명해야 하고, 그만큼 토큰을 낭비하게 됩니다.

### 문서가 곧 토큰입니다

Claude Code에서 토큰 비용은 **이전 대화 길이에 비례**합니다.
매 응답마다 이전 대화 전체를 다시 처리하기 때문입니다.

```text
10턴 대화:  이전 10턴 + 새 요청 → 토큰 적음
100턴 대화: 이전 100턴 + 새 요청 → 토큰 많음 (10배)
```

문서가 잘 분리되어 있으면 AI가 "이 작업은 PLAN.md만 보면 되겠다"고 판단해서
불필요한 파일을 읽지 않습니다. **문서 분리 = 토큰 절약**입니다.

### 사람을 위한 문서 vs AI를 위한 문서

전통적인 문서화는 "나중에 다른 사람이 읽을 때"를 위한 것이었습니다.
AI 시대의 문서화는 "5분 후 새 세션의 AI가 읽을 때"를 위한 것입니다.

| 관점 | 사람을 위한 문서 | AI를 위한 문서 |
|------|-----------------|---------------|
| 목적 | 이해와 커뮤니케이션 | 맥락 복원과 작업 지시 |
| 형식 | 자유롭고 서술적 | 구조화되고 명확 |
| 업데이트 | 가끔 (릴리즈 때) | 매 세션마다 |
| 분리 기준 | 독자별 | 역할별 (질문별) |

---

## 2️⃣ 프로젝트 문서 구조

### 추천 파일 구성

어떤 언어, 어떤 프로젝트에서든 이 5개 파일이면 충분합니다.

```text
my-project/
├── README.md        # "이 프로젝트는 뭐지?"
├── CLAUDE.md        # "어떻게 작업해야 하지?"
├── PLAN.md          # "무엇을 만들어야 하지?"
├── CHANGELOG.md     # "언제 뭐가 바뀌었지?"
├── DECISIONS.md     # "왜 이렇게 했지?"
└── DESIGN.md        # "UI를 어떻게 만들지?" (프론트엔드 프로젝트인 경우)
```

### 각 문서의 역할

핵심은 **각 문서가 하나의 질문에만 답하도록** 설계하는 것입니다.

| 문서 | 답하는 질문 | AI가 읽는 시점 | 업데이트 빈도 |
|------|-------------|---------------|-------------|
| README.md | "이 프로젝트는 뭐지?" | 새 세션 첫 진입 | 릴리즈 때 |
| CLAUDE.md | "어떻게 작업해야 하지?" | 모든 세션에서 항상 | 매 세션 |
| PLAN.md | "무엇을 만들어야 하지?" | 기능 구현 시 | 계획 변경 시 |
| CHANGELOG.md | "언제 뭐가 바뀌었지?" | 버그 추적 시 | 매 작업 완료 |
| DECISIONS.md | "왜 이렇게 했지?" | 구조 변경 고민 시 | 중요 결정 시 |
| DESIGN.md | "UI를 어떻게 만들지?" | UI 작업 시 | 디자인 변경 시 |

> **Tip**: 문서가 하나의 거대한 파일이면 AI가 매번 전체를 읽느라 토큰을 낭비합니다.
> 분리하면 필요한 부분만 읽고 빠르게 작업에 들어갈 수 있습니다.

---

## 3️⃣ 각 문서 작성 가이드

### CLAUDE.md — AI의 "작업 매뉴얼"

CLAUDE.md는 Claude Code가 **모든 세션에서 자동으로 읽는 파일**입니다.
프로젝트 루트에 있으면 Claude Code가 시작할 때 가장 먼저 참고합니다.
**AI의 첫 번째 기억**이자 가장 중요한 문서입니다.

포함해야 할 내용:

```markdown
# 프로젝트명

## 프로젝트 개요
한 줄 설명

## 📚 문서 인덱스
- PLAN.md: 전체 기능 설계 및 개발 일정
- DESIGN.md: 디자인 시스템 (프론트엔드인 경우)
- CHANGELOG.md: 버전별 변경 이력
- DECISIONS.md: 중요한 기술적 결정 기록

## 🎯 코딩 규칙
(프로젝트 기술 스택에 맞는 규칙)

## 📋 현재 진행 상황
- Phase 1: ✅ 완료
- Phase 2: 🔄 진행 중 (어디까지 했는지)
- Phase 3: ⬜ 미시작

## 🔄 작업 완료 시 자동 수행 규칙
1. CHANGELOG.md에 변경사항 추가
2. 이 파일의 진행 상황 업데이트
3. git commit 메시지 규칙: feat:, fix:, chore:, docs:

## ⚠️ 알려진 이슈
- (현재 해결 중이거나 인지하고 있는 문제들)
```

> **Tip**: 짧고 가볍게 유지합니다 (200줄 이하 권장). 세부 내용은 다른 문서로 링크하고, "현재 진행 상황"은 매 세션마다 업데이트합니다.

---

### PLAN.md — 프로젝트의 "설계도"

무엇을 만들어야 하는지, 어떤 순서로 만들지를 담는 문서입니다.
기능 정의, 데이터 모델, 화면 구성, 개발 일정이 포함됩니다.

포함해야 할 내용:
- 프로젝트 개요 (목적, 기술 스택)
- 핵심 기능 정의
- 화면/API/모듈 설계
- 데이터 모델 (TypeScript interface, Python dataclass, DB 스키마 등)
- 폴더 구조
- Phase별 개발 일정 (체크리스트 형태)

> **Tip**: Phase를 체크리스트(`- [ ]`)로 작성하면 진행 추적이 쉽습니다. 너무 길어지면 기능별로 분리(`docs/features/`)하는 것을 권장합니다.

---

### CHANGELOG.md — 변경 이력 추적

Keep a Changelog 형식을 사용합니다.
AI가 버그 추적 시 "최근에 뭐가 바뀌었지?"를 빠르게 파악할 수 있습니다.

```markdown
# Changelog

## [Unreleased]
### Added
- 새로 추가된 기능

## [1.0.0] - 2026-04-25
### Added
- 초기 출시
### Fixed
- 수정한 버그
```

---

### DECISIONS.md — 기술 결정 기록

"왜 이 라이브러리를 썼지?", "왜 이 구조로 했지?"에 대한 답을 남깁니다.
3개월 후 리팩토링할 때 과거의 맥락을 복원하는 데 결정적인 역할을 합니다.

```markdown
# Architecture Decisions

## 001: 데이터 저장 방식
- 날짜: 2026-04-20
- 상태: 승인됨
- 결정: 서버 없이 로컬 저장
- 이유: 서버 운영비 불필요, 개인정보 미수집
- 결과: 기기 간 동기화 불가 (v2.0에서 고려)
```

---

### DESIGN.md — 디자인 일관성 (프론트엔드)

AI는 매번 미세하게 다른 스타일을 생성할 수 있습니다.
DESIGN.md가 있으면 색상, 폰트, 간격, 컴포넌트 규칙을 일관되게 유지할 수 있습니다.

포함해야 할 내용:
- 컬러 팔레트 (정확한 hex 코드)
- 타이포그래피 (폰트, 사이즈 스케일)
- 간격 시스템 (4, 8, 12, 16, 24, 32...)
- 모서리 둥글기 스케일
- 컴포넌트별 규칙 (버튼, 카드, 입력 필드)
- 애니메이션 가이드
- 카피라이팅 톤

---

## 4️⃣ 언어별 초기화 프롬프트

### 공통 프롬프트 (모든 프로젝트)

어떤 기술 스택이든 이 프롬프트로 문서 구조를 초기화할 수 있습니다.

```text
아래 지시사항을 순서대로 실행해줘.

## 사전 파악
먼저 프로젝트 루트의 모든 설정 파일을 읽고
기술 스택, 구조, 현재 상태를 파악해.

## 생성할 파일

### 1. README.md
- 프로젝트 소개, 주요 기능, 기술 스택
- 설치 및 실행 방법
- 뱃지 포함 (기술 스택 기반 자동 감지)

### 2. CLAUDE.md
- 문서 인덱스
- 코딩 규칙 (기술 스택에 맞게 자동 설정)
- 현재 진행 상황
- 작업 완료 시 자동 수행 규칙

### 3. PLAN.md
- 프로젝트 개요
- 핵심 기능 정의
- 데이터 모델
- 폴더 구조
- Phase별 개발 일정 (체크리스트)

### 4. CHANGELOG.md
- Keep a Changelog 형식
- 현재까지 작업 내용 기반으로 초안

### 5. DECISIONS.md
- ADR 형식
- 프로젝트에서 파악된 기술 결정 자동 추출

## 완료 후
각 파일 생성 결과를 체크리스트로 보고
```

---

### React Native / TypeScript 프로젝트 (모바일 앱)

```text
아래 지시사항을 순서대로 실행해줘.

## 사전 파악
package.json, tsconfig.json, app.json을 읽고
기술 스택과 현재 프로젝트 상태를 파악해.

## 생성할 파일

### 1. README.md
- 앱 소개, 주요 기능, 기술 스택
- 설치: npm install, npx expo start
- 뱃지: React Native, Expo, TypeScript

### 2. CLAUDE.md (아래 구조로)
- 문서 인덱스 (README, PLAN, DESIGN, CHANGELOG, DECISIONS)
- 코딩 규칙:
  - TypeScript strict mode
  - 함수형 컴포넌트 + hooks
  - StyleSheet.create 사용 (인라인 최소화)
  - camelCase (변수), PascalCase (컴포넌트/타입)
- 현재 진행 상황 (Phase별 체크박스)
- 작업 완료 시: CHANGELOG 업데이트, 진행 상황 갱신
- 커밋 규칙: feat:, fix:, chore:, docs:, refactor:

### 3. PLAN.md
- 프로젝트 개요 (목적, 플랫폼, 기술 스택)
- 화면 구성 (탭/스택 네비게이션 구조)
- 핵심 기능 정의 (우선순위 P0/P1/P2)
- TypeScript interface 정의
- 폴더 구조 (app/, components/, stores/, services/)
- Phase별 개발 일정 (체크리스트)
- 배포 요건 (App Store, Google Play)

### 4. DESIGN.md
- 컬러 팔레트 (hex 코드)
- 타이포그래피 (폰트, 사이즈 스케일)
- 간격 시스템 (4/8/12/16/24/32)
- 모서리 둥글기 스케일
- 컴포넌트별 규칙 (버튼, 카드, 입력 필드)
- 애니메이션 가이드
- 다크 모드 대응

### 5. CHANGELOG.md + DECISIONS.md
- 현재까지 작업 기반으로 초안

## 완료 후 체크리스트로 보고
```

---

### Python 프로젝트 (백엔드 API / 데이터 / 자동화)

```text
아래 지시사항을 순서대로 실행해줘.

## 사전 파악
requirements.txt (또는 pyproject.toml, Pipfile),
main 진입점, 기존 코드 구조를 읽고 파악해.

## 생성할 파일

### 1. README.md
- 프로젝트 소개, 주요 기능
- 설치: pip install -r requirements.txt
- 실행: python main.py 또는 uvicorn/flask 명령어
- 환경 변수 설명 (.env.example 포함)
- 뱃지: Python 버전, 프레임워크

### 2. CLAUDE.md (아래 구조로)
- 문서 인덱스
- 코딩 규칙:
  - PEP 8 준수
  - Type hints 필수
  - docstring: Google style
  - 함수는 단일 책임 원칙
  - 테스트: pytest 사용
- 현재 진행 상황
- 작업 완료 시: CHANGELOG 업데이트, pytest 실행
- 커밋 규칙: feat:, fix:, chore:

### 3. PLAN.md
- 프로젝트 개요 (목적, 기술 스택)
- 핵심 기능/모듈 정의
- API 엔드포인트 설계 (REST/GraphQL인 경우)
- 데이터 모델 (SQLAlchemy/Pydantic/dataclass)
- 폴더 구조 (app/, models/, services/, utils/, tests/)
- Phase별 개발 일정 (체크리스트)

### 4. CHANGELOG.md + DECISIONS.md
- 현재까지 작업 기반으로 초안

## 완료 후 체크리스트로 보고
```

---

### Swift 프로젝트 (iOS 네이티브 앱)

```text
아래 지시사항을 순서대로 실행해줘.

## 사전 파악
.xcodeproj 또는 Package.swift, Info.plist,
기존 Swift 파일 구조를 읽고 파악해.

## 생성할 파일

### 1. README.md
- 앱 소개, 주요 기능, 스크린샷 섹션
- 요구사항: Xcode 버전, iOS 최소 버전
- 빌드: Xcode에서 열고 Run
- 뱃지: Swift, iOS, Xcode

### 2. CLAUDE.md (아래 구조로)
- 문서 인덱스
- 코딩 규칙:
  - Swift API Design Guidelines 준수
  - MVVM 또는 SwiftUI+Observable 아키텍처
  - guard let 우선 사용 (if let보다)
  - Protocol 기반 의존성 주입
  - 네이밍: camelCase (프로퍼티), PascalCase (타입)
- 현재 진행 상황
- 작업 완료 시: CHANGELOG 업데이트, 빌드 확인
- 커밋 규칙: feat:, fix:, chore:

### 3. PLAN.md
- 앱 개요 (목적, 타겟 iOS 버전)
- 화면 구성 (NavigationStack/TabView 구조)
- 핵심 기능 정의
- 데이터 모델 (struct, Codable)
- 폴더 구조 (Views/, Models/, ViewModels/, Services/)
- Phase별 개발 일정

### 4. DESIGN.md
- Color Assets 정의
- Typography 스케일
- 컴포넌트별 규칙
- 다크 모드 대응
- SF Symbols 사용 가이드

### 5. CHANGELOG.md + DECISIONS.md

## 완료 후 체크리스트로 보고
```

---

### Java / Kotlin 프로젝트 (Android / Spring Boot)

```text
아래 지시사항을 순서대로 실행해줘.

## 사전 파악
build.gradle (또는 pom.xml), 기존 소스 구조,
application.properties를 읽고 파악해.

## 생성할 파일

### 1. README.md
- 프로젝트 소개, 주요 기능
- 요구사항: JDK 버전, Gradle/Maven
- 빌드: ./gradlew build (또는 mvn package)
- 실행: ./gradlew bootRun (Spring) 또는 Android Studio
- 뱃지: Java/Kotlin, Spring Boot/Android

### 2. CLAUDE.md (아래 구조로)
- 문서 인덱스
- 코딩 규칙:
  - [Android] Kotlin 우선, Jetpack Compose UI
  - [Spring] Java/Kotlin, 계층 구조 (Controller→Service→Repository)
  - 네이밍: camelCase (메서드), PascalCase (클래스)
  - 예외 처리: 커스텀 Exception 사용
  - 테스트: JUnit 5 + Mockito
- 현재 진행 상황
- 작업 완료 시: CHANGELOG 업데이트, 빌드 확인
- 커밋 규칙: feat:, fix:, chore:

### 3. PLAN.md
- 프로젝트 개요
- [Android] 화면 구성 (Navigation Graph)
- [Spring] API 엔드포인트 설계
- 데이터 모델 (Entity, DTO)
- 폴더 구조
- Phase별 개발 일정

### 4. CHANGELOG.md + DECISIONS.md

## 완료 후 체크리스트로 보고
```

---

## 5️⃣ 보안 가이드: API Key와 환경 변수

### AI가 저지르는 보안 실수

바이브 코딩에서 가장 흔한 보안 사고는 AI가 환경 변수를 잘못 다루는 것입니다.

```text
실제 사고 사례:
  1. AI가 .env의 API Key를 코드에 하드코딩
  2. AI가 CLAUDE.md에 실제 키 값을 기록
  3. AI가 .env 파일을 git commit에 포함
  4. AI가 디버깅 중 콘솔에 키를 출력하는 코드 생성
  5. AI가 README에 "실행 시 이 키를 넣으세요"라며 실제 값 노출
```

> ⚠️ 한번 GitHub에 올라간 키는 **몇 초 내에 봇이 수집**합니다. 삭제해도 git 히스토리에 남아있어서 완전 제거가 어렵습니다.

---

### CLAUDE.md에 넣어야 할 보안 규칙

```markdown
## 🔒 보안 규칙 (절대 위반 금지)

### 환경 변수
- .env, .env.local 파일의 실제 값을 절대 코드나 문서에 기록하지 말 것
- API Key, Secret, Token, Password를 절대 하드코딩하지 말 것
- 환경 변수는 반드시 process.env.VARIABLE_NAME으로 참조
- 디버깅 시에도 console.log로 환경 변수 값을 출력하지 말 것
- 커밋 전 반드시 .env가 .gitignore에 포함되어 있는지 확인

### 문서에 적을 때
- 필요한 환경 변수의 "이름"만 기록 (값은 절대 기록 금지)
- .env.example 파일에 빈 값으로 목록만 제공

### 금지 패턴
❌ const API_KEY = "sk-abc123..."
❌ OPENWEATHER_API_KEY=abc123  (CLAUDE.md에 실제 값)
❌ console.log("Key:", process.env.API_KEY)
❌ fetch(`...?key=abc123...`)

### 허용 패턴
✅ const API_KEY = process.env.OPENWEATHER_API_KEY
✅ OPENWEATHER_API_KEY=your_key_here  (.env.example)
✅ "환율 API Key가 필요합니다 (.env 참고)"
```

---

### .env.example 파일 관리

프로젝트에 필요한 환경 변수를 `.env.example`에 기록합니다.
이 파일은 git에 포함해도 안전합니다 (실제 값이 없으므로).

```bash
# .env.example (git에 포함 OK)
OPENWEATHER_API_KEY=your_key_here
EXCHANGE_RATE_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
ADMOB_ANDROID_APP_ID=ca-app-pub-xxx
ADMOB_IOS_APP_ID=ca-app-pub-xxx
```

```bash
# .env (git에 절대 포함 금지)
OPENWEATHER_API_KEY=abc123실제키값
EXCHANGE_RATE_API_KEY=xyz789실제키값
```

---

### .gitignore 필수 항목

```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
*.keystore
*.jks
*.p12
google-services.json
GoogleService-Info.plist
```

---

### CLAUDE.md에 환경 변수 목록 기록 방법

```markdown
## 🔑 필요한 환경 변수

| 변수명 | 용도 | 발급처 |
|--------|------|--------|
| OPENWEATHER_API_KEY | 날씨 조회 | openweathermap.org |
| EXCHANGE_RATE_API_KEY | 환율 조회 | exchangerate-api.com |
| GOOGLE_MAPS_API_KEY | 지도 (Android) | Google Cloud Console |

⚠️ 실제 값은 .env 파일에만 저장. 이 문서에 절대 기록 금지.
⚠️ .env.example 참고하여 로컬에 .env 파일 생성할 것.
```

---

### 언어별 환경 변수 참조 방식

```python
# Python
import os
API_KEY = os.environ.get("OPENWEATHER_API_KEY")
# 또는 python-dotenv 사용
from dotenv import load_dotenv
load_dotenv()
```

```typescript
// TypeScript / React Native
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
// Expo에서는 EXPO_PUBLIC_ 접두사 필요
```

```swift
// Swift (iOS)
let apiKey = ProcessInfo.processInfo.environment["OPENWEATHER_API_KEY"]
// 또는 xcconfig 파일 사용
```

```java
// Java / Kotlin (Android)
String apiKey = BuildConfig.OPENWEATHER_API_KEY;
// build.gradle에서 local.properties 참조
```

---

### 만약 키가 노출됐다면

```text
1. 즉시 해당 서비스에서 키 재발급 (기존 키 비활성화)
2. git 히스토리에서 제거:
   git filter-branch 또는 BFG Repo-Cleaner 사용
3. GitHub에서 "Secret scanning alert" 확인
4. .gitignore에 .env 추가 확인
5. 새 키로 .env 업데이트
```

---

## 6️⃣ 세션 관리 전략

### 세션의 원리

Claude Code의 토큰 비용은 **세션 길이에 비례**합니다.
한 세션에서 대화가 길어질수록 매 응답마다 이전 대화 전체를 다시 처리해야 하기 때문입니다.

```text
세션 A (짧은 세션 3개):
  세션 1: 20턴 → 20턴분 토큰
  세션 2: 15턴 → 15턴분 토큰
  세션 3: 10턴 → 10턴분 토큰

세션 B (긴 세션 1개):
  45턴 → 1+2+3+...+45 = 누적 1,035턴분 토큰
  (이전 대화가 매번 재처리되므로)
```

같은 작업이라도 **짧은 세션 여러 개**가 **긴 세션 하나**보다 토큰 효율이 좋습니다.

---

### 효율적인 세션 패턴

```text
작업 단위로 세션 분리 (가장 중요):
  오전: "체크리스트 버그 수정" → exit
  오후: "지도 탭 구현" → exit (새 세션)
  저녁: "문서 정리" → exit (새 세션)

긴 세션은 /compact로 압축:
  작업 중 대화가 20턴 넘어가면
  /compact 실행 → 이전 내용 요약 → 토큰 절약

/resume으로 이전 세션 이어하기:
  claude --resume → 세션 목록에서 선택

effort 레벨 조절:
  /effort low    → 오타 수정, 텍스트 변경
  /effort medium → 일반 기능 구현 (기본값)
  /effort high   → 복잡한 로직, 멀티파일 작업
  /effort max    → 아키텍처 설계, 풀리지 않는 디버깅
```

---

### 세션 끊는 타이밍

```text
끊어야 할 때:
  ✅ 하나의 작업/이슈가 완료됐을 때
  ✅ 다른 주제로 넘어갈 때
  ✅ 대화가 20~30턴 이상 길어졌을 때

유지해야 할 때:
  🔄 같은 파일을 연속 수정 중일 때
  🔄 디버깅이 진행 중일 때
  🔄 관련된 작업을 연속으로 할 때
```

---

## 7️⃣ Claude Code 자동화 설정

### 슬래시 커맨드 등록

`~/.claude/commands/` 폴더에 마크다운 파일을 만들면
어떤 프로젝트에서든 `/명령어`로 실행할 수 있습니다.

```bash
mkdir -p ~/.claude/commands
```

**문서 초기화 커맨드** (`~/.claude/commands/init-docs.md`):

```markdown
# 프로젝트 문서 초기화

이 프로젝트에 다음 문서 구조를 생성해줘.
실행 전 설정 파일들을 읽고 기술 스택을 파악할 것.

## 생성할 파일
1. README.md (프로젝트 소개, 기술 스택, 설치 방법)
2. CLAUDE.md (문서 인덱스, 코딩 규칙, 진행 상황, 자동 수행 규칙)
3. PLAN.md (기능 설계, 데이터 모델, 폴더 구조, 개발 일정)
4. CHANGELOG.md (Keep a Changelog 형식)
5. DECISIONS.md (ADR 형식)

## 규칙
- 기술 스택은 설정 파일에서 자동 감지
- 코딩 규칙은 기술 스택에 맞게 자동 설정
- 기존 파일이 있으면 덮어쓰지 말고 병합 제안

## 완료 후
생성 결과를 체크리스트로 보고
```

사용법:

```bash
cd any-project
claude
/init-docs
```

**상태 점검 커맨드** (`~/.claude/commands/check-status.md`):

```markdown
# 프로젝트 상태 점검

현재 프로젝트 상태를 점검하고 보고해줘.

## 점검 항목
1. CLAUDE.md의 진행 상황이 실제 코드와 일치하는지
2. CHANGELOG.md가 최신인지
3. 알려진 버그나 TODO가 남아있는지
4. 빌드/테스트가 정상적으로 통과하는지
5. 다음으로 해야 할 작업이 뭔지

## 보고 형식
- 현재 상태 요약
- 불일치 항목 (있으면)
- 다음 작업 추천
```

**문서 정리 커맨드** (`~/.claude/commands/clean-docs.md`):

```markdown
# 문서 정리

프로젝트의 모든 문서를 점검하고 정리해줘.

## 작업
1. 중복된 내용 통합
2. 오래되어 관련 없어진 내용 제거
3. 각 문서의 역할이 명확한지 확인
4. 문서 간 링크가 올바른지 확인
5. 필요하면 새 문서 분리 제안

## 대상 파일
README.md, CLAUDE.md, PLAN.md, CHANGELOG.md, DECISIONS.md
```

---

### 글로벌 CLAUDE.md 설정

`~/.claude/CLAUDE.md`에 모든 프로젝트 공통 규칙을 넣어두면
어떤 프로젝트에서든 자동으로 적용됩니다.

```bash
touch ~/.claude/CLAUDE.md
```

```markdown
# 글로벌 Claude Code 규칙

## 모든 프로젝트 공통

### 문서 규칙
- README.md, CLAUDE.md, CHANGELOG.md는 필수
- 작업 완료 시 CHANGELOG.md 업데이트
- 중요한 결정은 DECISIONS.md에 기록

### 커밋 메시지
- feat: 새 기능
- fix: 버그 수정
- chore: 설정, 의존성
- docs: 문서 변경
- refactor: 리팩토링

### 작업 스타일
- 큰 작업은 작은 단계로 나눠서 진행
- 각 단계 완료 후 git commit
- 불확실한 부분은 먼저 질문하고 진행
```

---

## 8️⃣ 실전 팁

### 문서 길이 관리

```text
CLAUDE.md: 200줄 이하 (허브 역할, 짧게)
PLAN.md:   500줄 이하 (넘으면 기능별 분리)
DESIGN.md: 300줄 이하
CHANGELOG: 제한 없음 (시간순 누적)
DECISIONS: 제한 없음 (결정순 누적)
```

---

### 문서 간 링크 활용

```markdown
# PLAN.md
상세 디자인은 [DESIGN.md](./DESIGN.md) 참고.
AdMob 연기 결정은 [DECISIONS.md](./DECISIONS.md#003) 참고.
```

AI가 링크를 따라가면서 필요한 정보만 골라 읽을 수 있습니다.

---

### AI에게 문서 업데이트 위임하기

매번 직접 수정하지 말고 AI에게 맡기면 됩니다.

```text
체크리스트 버그 수정 완료했어.
CHANGELOG.md에 추가하고,
CLAUDE.md 진행 상황도 업데이트해줘.
```

---

### 새 세션 시작 시 컨텍스트 최소화

```text
PLAN.md의 Phase 3 섹션만 읽고,
예산 탭의 환율 변환 기능을 구현해줘.
```

> **Tip**: "전체를 읽어줘"보다 "특정 섹션만 읽어줘"가 토큰을 절약합니다.

---

## 9️⃣ 정리

바이브 코딩에서 문서 관리는 선택이 아닌 필수입니다.

```text
문서가 없는 AI 개발:
  매 세션마다 처음부터 설명
  → 토큰 낭비
  → 일관성 없는 코드
  → 매번 다른 스타일

문서가 있는 AI 개발:
  새 세션에서도 즉시 맥락 파악
  → 토큰 절약
  → 일관된 코드
  → 누적되는 품질
```

시작은 간단합니다.

```bash
cd my-project
claude
/init-docs
```

이 한 줄이면 됩니다.
나머지는 AI가 알아서 해줍니다.
그리고 그 AI가 잘 해주도록 만드는 게 바로 **문서**입니다.

---

> **"코드는 AI가 쓴다. 문서는 내가 설계한다."**
>
> 이것이 바이브 코딩 시대의 개발자 역할입니다.
