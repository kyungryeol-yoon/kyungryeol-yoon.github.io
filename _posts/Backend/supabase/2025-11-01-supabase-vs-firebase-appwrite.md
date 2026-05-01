---
title: "[Backend] 🚀 Supabase란? Firebase·Appwrite와 차이점 완벽 비교"
date: 2025-11-01
categories: [Backend, Supabase]
tags: [supabase, firebase, appwrite, baas, postgresql, backend, realtime, pgvector, auth]
description: "Supabase는 PostgreSQL 기반의 오픈소스 BaaS 플랫폼입니다. Firebase, Appwrite와의 차이점, 핵심 기능(Auth·Realtime·pgvector), 요금제를 실무 관점에서 비교 정리합니다."
pin: false
---

Supabase는 PostgreSQL 기반의 오픈소스 BaaS(Backend as a Service) 플랫폼으로, Firebase의 대안으로 설계되었습니다. 인증, 데이터베이스, 실시간 처리, 파일 스토리지, 서버리스 함수를 하나의 패키지로 제공하여 백엔드 인프라 구축 시간을 대폭 단축할 수 있습니다. 이 글에서는 Supabase의 핵심 개념과 Firebase, Appwrite와의 차이점을 실무 관점에서 비교합니다.

---

## 🧩 Supabase란?

Supabase는 Google Firebase의 오픈소스 대안으로 2020년 등장한 BaaS(Backend as a Service) 플랫폼입니다. PostgreSQL을 핵심 데이터베이스로 사용하며, 인증·실시간 처리·파일 스토리지·서버리스 함수를 통합 제공합니다.

Firebase가 NoSQL(Firestore) 기반인 것과 달리, Supabase는 표준 SQL과 관계형 데이터 모델을 사용할 수 있다는 점이 가장 큰 차별점입니다. 오픈소스이기 때문에 클라우드 호스팅뿐만 아니라 자체 서버에서 셀프 호스팅도 가능합니다.

---

## 🔍 BaaS(Backend as a Service)란?

BaaS는 "인증, 데이터베이스, 파일 스토리지 등 공통 백엔드 기능을 서비스로 제공하는 플랫폼"입니다. 개발자가 직접 서버를 구축하거나 API를 개발할 필요 없이, 프론트엔드 코드만으로 전체 애플리케이션을 만들 수 있게 해줍니다.

> **Tip**: BaaS는 스타트업이나 소규모 팀이 빠른 시장 진입(MVP)이 필요할 때 특히 효과적입니다.

대표적인 BaaS 플랫폼으로는 Firebase, Supabase, Appwrite가 있으며, 각각 설계 철학이 다릅니다.

---

## ⚡ Firebase vs Supabase vs Appwrite 비교

| 항목 | Firebase | Supabase | Appwrite |
|------|----------|----------|----------|
| **설계 방향** | 완제품 지향 | 통합 데이터 흐름 | 셀프 호스팅 자유도 |
| **데이터베이스** | NoSQL (Firestore) | SQL (PostgreSQL) | SQL/NoSQL 선택 |
| **제공 방식** | 완전 관리형 | 관리형 + 로컬 개발 | 직접 운영 |
| **오픈소스** | ❌ | ✅ | ✅ |
| **벤더 락인** | 높음 (Google) | 낮음 | 없음 |
| **권한 구조** | 기능별 분리 | RLS 기반 통합 | 직접 구성 |
| **AI/벡터 지원** | 별도 솔루션 필요 | pgvector 기본 지원 | 별도 설정 필요 |
| **적합 팀** | MVP/모바일 팀 | 프론트 중심 소규모 팀 | 인프라 운영 가능 팀 |

### Firebase가 적합한 경우

Firebase는 "모바일 앱 개발과 초고속 MVP 구현"에 최적화된 플랫폼입니다. Google 생태계와의 긴밀한 통합, 실시간 데이터 동기화, Firebase Analytics 등 모바일에 특화된 서비스가 강점입니다.

- 모바일(iOS/Android) 앱 개발 중심
- Google 생태계 전반 활용이 필요한 경우
- NoSQL 데이터 구조에 익숙한 팀

### Supabase가 적합한 경우

Supabase는 "SQL에 익숙한 팀이 빠른 개발과 통제권을 동시에 원할 때" 최적입니다. 장기 운영을 고려하면서도 빠르게 제품을 출시해야 하는 팀에 어울립니다.

- SQL 및 관계형 데이터베이스에 익숙한 팀
- AI/ML 기능을 앱에 통합할 계획이 있는 경우
- Firebase의 벤더 락인을 피하고 싶은 경우

### Appwrite가 적합한 경우

Appwrite는 "인프라를 직접 운영할 수 있는 팀이 완전한 데이터 주권을 원할 때" 적합합니다. 셀프 호스팅을 통해 데이터를 완전히 통제할 수 있습니다.

- 데이터를 자체 서버에서 완전히 통제해야 하는 경우
- 인프라 운영 역량이 있는 팀
- 오픈소스 커스터마이징이 필요한 경우

---

## 🛠️ Supabase 핵심 기능

### 1️⃣ Database (PostgreSQL)

Supabase의 데이터베이스는 완전한 PostgreSQL입니다. 복잡한 SQL 쿼리, 조인, 트랜잭션, 인덱스를 모두 활용할 수 있으며, Row Level Security(RLS)로 사용자별 데이터 접근 권한을 DB 레벨에서 제어합니다.

```sql
-- RLS 정책 예시: 사용자가 자신의 데이터만 조회
CREATE POLICY "users can view own data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);
```

> **Tip**: RLS를 활성화하면 API에서 별도 권한 체크 없이 DB 자체에서 보안이 처리됩니다.

### 2️⃣ Auth (인증)

Supabase Auth는 이메일/패스워드, 소셜 로그인(Google, GitHub, Apple), OTP, 패스키를 대시보드에서 클릭 몇 번으로 설정할 수 있습니다. JWT 기반의 토큰과 세션 관리는 자동으로 처리됩니다.

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 소셜 로그인 (GitHub)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})

// 이메일 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### 3️⃣ Realtime (실시간 처리)

Supabase Realtime은 PostgreSQL의 변경 사항을 웹소켓으로 클라이언트에 즉시 전달합니다. 별도 폴링 없이 채팅, 알림, 협업 도구를 구현할 수 있습니다.

```javascript
// 실시간 메시지 구독
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('새 메시지:', payload.new)
    }
  )
  .subscribe()
```

### 4️⃣ Storage (파일 관리)

이미지·동영상 업로드 시 자동 썸네일 변환, CDN 연동, RLS 기반 접근 제어가 기본 내장되어 있습니다.

```javascript
// 파일 업로드
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)

// 퍼블릭 URL 조회
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)
```

### 5️⃣ Edge Functions (서버리스)

Deno 기반의 서버리스 함수로 인증 체크, 웹훅 처리, 외부 API 호출, AI 연동 등 서버 로직을 빠르게 배포할 수 있습니다.

```typescript
// Edge Function 예시: OpenAI 연동
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { query } = await req.json()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: query }]
    })
  })

  return new Response(await response.text(), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 6️⃣ Vector DB (pgvector)

Supabase는 pgvector 확장을 기본 지원하여 별도 벡터 데이터베이스 없이 PostgreSQL 안에서 AI 임베딩 저장과 유사도 검색을 처리할 수 있습니다.

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 임베딩 컬럼이 있는 테이블 생성
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536)
);

-- 코사인 유사도 검색
SELECT content, 1 - (embedding <=> query_embedding) AS similarity
FROM documents
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

> **Tip**: Supabase + pgvector 조합은 RAG(Retrieval-Augmented Generation) 시스템 구축에 매우 효과적입니다.

---

## 💰 요금제 비교

| 플랜 | 가격 | DB 용량 | 스토리지 | MAU | 특이사항 |
|------|------|---------|---------|-----|---------|
| **Free** | 무료 | 500MB | 1GB | 10,000 | 1주 미사용 시 자동 중지, 2개 프로젝트 제한 |
| **Pro** | $25/월 | 8GB | 100GB | 100,000 | 자동 백업, 커스텀 도메인 |
| **Team** | $599/월 | 커스텀 | 커스텀 | 무제한 | SOC2, HIPAA, SSO 지원 |
| **Enterprise** | 문의 | 커스텀 | 커스텀 | 무제한 | 전용 서버, SLA 보장 |

> ⚠️ Free 플랜은 7일 동안 활동이 없으면 프로젝트가 자동 일시정지됩니다. 개인 프로젝트나 테스트 환경에서 주의가 필요합니다.

---

## ✅ Supabase 장단점 요약

### 장점

- **SQL 표준 지원**: 복잡한 관계형 쿼리, 조인, 트랜잭션 완전 지원
- **오픈소스**: 벤더 락인 없이 자체 호스팅으로 전환 가능
- **AI 통합 용이**: pgvector로 벡터 DB를 별도 서비스 없이 활용
- **통합 솔루션**: 인증·DB·스토리지·실시간·함수가 하나의 패키지
- **비용 예측 가능**: Firebase의 사용량 기반 과금과 달리 플랜 기반 정액제

### 단점

- **Free 플랜 제약**: 1주 미사용 시 자동 일시정지, 2개 프로젝트 제한
- **Region 고정**: 프로젝트 생성 후 리전 변경 불가
- **PostgreSQL 기본 지식 필요**: SQL에 익숙하지 않으면 초기 설정이 어려울 수 있음
- **Firebase 마이그레이션 복잡도**: NoSQL → 관계형 전환 시 데이터 재설계 필요

---

## 🚀 빠른 시작 가이드

### Supabase CLI 설치 및 로컬 개발 환경 구성

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 새 프로젝트 초기화
supabase init

# 로컬 개발 서버 시작 (Docker 필요)
supabase start
```

### Next.js + Supabase 연동

```bash
npm install @supabase/supabase-js @supabase/ssr
```

```typescript
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// 데이터 조회 예시
const { data: posts, error } = await supabase
  .from('posts')
  .select('id, title, created_at')
  .order('created_at', { ascending: false })
  .limit(10)
```

---

## ❓ 자주 묻는 질문

### Q. Supabase와 Firebase 중 무엇을 선택해야 하나요?

SQL과 관계형 데이터에 익숙하거나 AI 기능 통합이 필요하다면 Supabase를 권장합니다. 모바일 앱 개발이 주목적이고 Google 생태계를 적극 활용한다면 Firebase가 더 적합합니다.

### Q. Supabase는 셀프 호스팅이 가능한가요?

네, 가능합니다. Supabase는 오픈소스이며 Docker Compose로 자체 서버에 배포할 수 있습니다. `supabase/supabase` GitHub 리포지토리에서 공식 셀프 호스팅 가이드를 확인할 수 있습니다.

### Q. Free 플랜의 프로젝트 자동 중지를 방지할 수 있나요?

무료 플랜에서는 7일 연속 미사용 시 자동 일시정지됩니다. 주기적으로 접속하거나, Pro 플랜($25/월)으로 업그레이드하면 이 제한이 사라집니다.

### Q. pgvector를 활용한 AI 기능은 어떻게 사용하나요?

Supabase 대시보드의 `Database > Extensions` 탭에서 `vector` 확장을 활성화합니다. 이후 VECTOR 타입 컬럼을 가진 테이블을 생성하고 OpenAI 등 임베딩 모델로 생성한 벡터를 저장하면 유사도 검색이 가능합니다.

### Q. Free 플랜의 프로젝트 개수 제한은?

Free 플랜에서는 최대 2개의 프로젝트를 생성할 수 있습니다. Pro 플랜부터는 제한이 없습니다.