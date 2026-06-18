---
title: "[Network] REST·REST API·RESTful 완전 정리 — 개념부터 API 설계 규칙까지"
date: 2017-10-22
tags: [rest, rest-api, restful, network, http, api-design]
description: "자주 헷갈리는 REST·REST API·RESTful의 차이를 한 번에 정리합니다. REST 아키텍처의 정의와 6가지 특징, REST API URI 설계 규칙과 HTTP 메서드·상태코드, RESTful의 조건과 안티패턴, Richardson 성숙도 모델까지 다룹니다."
---

REST·REST API·RESTful은 비슷해 보여 자주 헷갈리지만, 사실 **세 가지 줌 레벨**입니다 — REST는 **아키텍처 스타일**, REST API는 그것을 **API로 구현한 것**, RESTful은 그 API가 **REST 원칙을 잘 지켰다는 형용사**입니다. 이 글에서는 셋의 개념과 차이, REST API 설계 규칙, RESTful의 조건까지 한 번에 정리합니다.

## 🌐 REST란?

**REST(Representational State Transfer)** 는 자원을 이름(표현)으로 구분해 그 **자원의 상태(정보)를 주고받는** 아키텍처 스타일입니다.

- **자원(Resource)**: 소프트웨어가 관리하는 모든 것(문서, 데이터, 이미지 등)
- **표현(Representation)**: 자원을 가리키는 이름(예: 학생 정보 → `students`)
- **상태 전달**: 요청 시점의 자원 상태를 보통 **JSON/XML**로 주고받음

REST는 월드 와이드 웹(WWW)처럼 분산 하이퍼미디어 시스템을 위한 형식으로, **HTTP와 웹의 기존 기술을 그대로 활용**하는 클라이언트-서버 통신 방식입니다.

### 구체적 개념 — URI + HTTP Method

HTTP **URI**로 자원을 명시하고, HTTP **Method**로 그 자원에 CRUD를 적용합니다. 즉 자원 중심 구조(ROA, Resource Oriented Architecture)입니다.

| CRUD | HTTP Method |
|---|---|
| Create(생성) | POST |
| Read(조회) | GET |
| Update(수정) | PUT / PATCH |
| Delete(삭제) | DELETE |

### REST 구성 요소

- **자원(Resource)**: URI — 모든 자원에 고유 ID(`/groups/:group_id`)
- **행위(Verb)**: HTTP Method(GET·POST·PUT·DELETE)
- **표현(Representation)**: 응답 형태(JSON·XML·TEXT 등, 보통 JSON)

---

## 🧭 REST의 6가지 특징

1. **Server-Client 구조** — 자원을 가진 쪽이 서버, 요청하는 쪽이 클라이언트. 서로 의존성이 줄어듭니다.
2. **Stateless(무상태)** — 서버가 클라이언트 context(세션·쿠키)를 저장하지 않고, 각 요청을 독립적으로 처리합니다.
3. **Cacheable(캐시 가능)** — HTTP 표준을 그대로 쓰므로 `Last-Modified`·`E-Tag`로 캐싱해 응답 속도·서버 효율을 높입니다.
4. **Layered System(계층화)** — API 서버 앞단에 보안·로드밸런싱·인증·게이트웨이 등을 둘 수 있습니다.
5. **Code-On-Demand(optional)** — 서버가 스크립트를 보내 클라이언트에서 실행(선택 사항).
6. **Uniform Interface(일관된 인터페이스)** — URI로 지정한 자원을 통일된 방식으로 다루며, 특정 언어·기술에 종속되지 않습니다.

---

## ⚖️ REST의 장단점

**장점**: HTTP 인프라를 그대로 사용(별도 인프라 불필요), 모든 플랫폼 호환, 의도가 명확한 메시지, 서버-클라이언트 역할 분리.

**단점**: 명확한 표준이 없음, 사용하는 메서드가 제한적, 구형 브라우저가 PUT/DELETE 등을 제대로 지원하지 못하는 경우가 있음.

---

## 🔌 REST API란?

**API(Application Programming Interface)** 는 프로그램 간 상호작용을 위해 데이터·기능을 제공하는 인터페이스입니다. **REST API는 REST 기반으로 구현한 서비스 API**를 말합니다.

- OpenAPI(구글 맵, 공공데이터 등), 마이크로서비스 대부분이 REST API를 제공
- HTTP 표준 기반이라 Java·C#·웹 등 어떤 언어로든 클라이언트·서버 구현 가능
- 시스템을 분산해 확장성·재사용성을 높여 유지보수가 쉬워짐

---

## 📐 REST API 설계 규칙

### URI는 자원(명사)을 표현한다

- 자원은 **동사보다 명사**, **소문자** 사용
- 도큐먼트는 단수, 컬렉션·스토어는 복수 명사
  - `GET /Member/1` → `GET /members/1`

### 행위는 HTTP Method로 표현한다 (URI에 동사 금지)

- `GET /members/delete/1` → `DELETE /members/1`
- `GET /members/show/1` → `GET /members/1`
- `GET /members/insert/2` → `POST /members/2`

### 그 밖의 규칙

- 슬래시(`/`)는 계층 관계 표현, **URI 끝에는 슬래시를 넣지 않음**
- 가독성을 위해 **하이픈(`-`)** 사용, **밑줄(`_`)은 사용하지 않음**
- URI 경로는 **소문자**, **파일 확장자를 넣지 않고** `Accept` 헤더 사용
  - `.../345/photo.jpg` (X) → `GET .../345/photo` + `Accept: image/jpg` (O)
- 연관 관계: `/리소스/{id}/관계리소스` (예: `GET /users/{userid}/devices`)

### 설계 예시

| 동작 | HTTP Method | Route |
|---|---|---|
| 목록 조회 | GET | `/resource` |
| 단건 조회 | GET | `/resource/:id` |
| 생성 | POST | `/resource` |
| 수정(전체) | PUT | `/resource/:id` |
| 수정(부분) | PATCH | `/resource/:id` |
| 삭제 | DELETE | `/resource/:id` |

> 💡 **PUT vs PATCH**: PUT은 자원 전체를 교체, PATCH는 일부만 수정합니다. 또 GET·PUT·DELETE는 **멱등(idempotent)** — 같은 요청을 여러 번 보내도 결과가 같아 안전하게 재시도할 수 있습니다.

### 응답 상태코드

- **1xx** 정보 교환 · **2xx** 성공 · **3xx** 추가 행동 필요 · **4xx** 클라이언트 오류 · **5xx** 서버 오류

---

## ✅ RESTful이란?

**RESTful**은 REST 아키텍처를 제대로 구현한 웹 서비스를 가리키는 형용사입니다. 즉 **REST 원칙을 잘 따르는 API를 RESTful하다**고 합니다(공식 표준이 아니라 관용 표현).

### 목적

성능 향상이 아니라, **일관된 컨벤션으로 API의 이해도·호환성을 높이는 것**이 목적입니다. (그래서 성능이 최우선인 상황이라면 굳이 RESTful을 고집할 필요는 없습니다.)

### RESTful하지 못한 경우 (안티패턴)

- CRUD를 전부 `POST`로만 처리하는 API
- route에 자원·id 외 행위가 들어가는 경우(`/students/updateName`)

> 💡 **Richardson 성숙도 모델**은 API가 얼마나 RESTful한지 0~3단계로 평가합니다. **Lv0** 단일 엔드포인트·POST만 → **Lv1** 자원 분리 → **Lv2** HTTP 메서드·상태코드 활용(실무 권장 기준선) → **Lv3** HATEOAS(응답에 관련 동작 링크 포함, 자기 서술적). 보통 **Lv2**를 목표로 하고, 클라이언트에 탐색성이 필요할 때 Lv3를 적용합니다.

---

## 🤔 REST vs REST API vs RESTful 한눈에

| 용어 | 무엇인가 |
|---|---|
| **REST** | 자원을 URI로, 행위를 HTTP Method로 다루는 **아키텍처 스타일** |
| **REST API** | REST 원칙으로 구현한 **실제 API** |
| **RESTful** | REST 원칙을 잘 지킨 API를 가리키는 **형용사** |

---

## ❓ 자주 묻는 질문

**Q. REST와 RESTful의 차이는?**
REST는 아키텍처 스타일(명사), RESTful은 그 원칙을 잘 따른다는 상태(형용사)입니다. RESTful한 API = REST를 제대로 구현한 API.

**Q. URI에 동사를 쓰면 안 되나요?**
네. 행위는 HTTP Method로 표현합니다. `GET /members/delete/1`이 아니라 `DELETE /members/1`.

**Q. PUT과 PATCH는 언제 구분하나요?**
전체 교체는 PUT, 일부 필드만 수정은 PATCH입니다.

**Q. 꼭 HATEOAS(Lv3)까지 구현해야 하나요?**
대부분은 HTTP 메서드·상태코드를 제대로 쓰는 **Lv2**면 충분합니다. 탐색성이 필요할 때 Lv3를 고려하세요.

---

## 📚 참고

- [Richardson Maturity Model — REST API Tutorial](https://restfulapi.net/richardson-maturity-model/)
- [What is the Richardson Maturity Model? — The RESTful cookbook](https://restcookbook.com/Miscellaneous/richardsonmaturitymodel/)
- [Richardson Maturity Model — GeeksforGeeks](https://www.geeksforgeeks.org/richardson-maturity-model-restful-api/)
