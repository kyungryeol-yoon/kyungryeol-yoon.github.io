---
title: "[Microservice Pattern] 마이크로서비스 패턴 개요와 핵심 설계"
date: 2021-11-07
categories: [Backend, Software-Design]
tags: [microservice, pattern, architecture, saga, event-driven, api gateway]
---

# 🏗️ Microservice Pattern (마이크로서비스 패턴) 개요

**마이크로서비스 아키텍처(Microservice Architecture)**는 하나의 큰 애플리케이션을  
**작고 독립적인 서비스 단위**로 분리하여 운영하는 아키텍처 스타일입니다.

> 🔑 핵심: **작은 서비스 단위 + 독립 배포 + 명확한 책임**

---

# 1️⃣ 마이크로서비스 특징

| 특징 | 설명 |
|------|------|
| 작은 단위 | 각 서비스는 단일 책임(Single Responsibility) 중심 |
| 독립 배포 | 서비스별로 독립적으로 빌드/배포 가능 |
| 독립 데이터 | 각 서비스는 자체 데이터 저장소를 가짐 |
| 통신 방식 | REST API, gRPC, 메시지 큐 등 사용 |
| 팀 단위 개발 | 서비스 단위로 팀이 독립적으로 개발 가능 |

> 💡 모놀리식 아키텍처와 비교하면, 마이크로서비스는 **유연성과 확장성**을 강조합니다.

---

# 2️⃣ 주요 마이크로서비스 패턴

마이크로서비스 설계에서 자주 활용되는 **패턴**입니다.

## 2.1 Database per Service

- 각 서비스가 **자체 데이터베이스**를 보유  
- 장점: 서비스 간 결합도 최소화  
- 단점: 데이터 일관성 관리 필요

```text
Order Service DB  <-- 독립
Payment Service DB <-- 독립
```

---

## 2.2 API Gateway Pattern

* 클라이언트 요청을 **단일 진입점**에서 처리
* 인증, 로깅, 라우팅, 응답 집계 등 수행

```text
Client → API Gateway → Order Service
                       → Payment Service
                       → Shipping Service
```

---

## 2.3 Circuit Breaker Pattern

* 서비스 호출 실패 시 **전체 시스템 장애 방지**
* 실패하면 fallback 처리

```java
try {
    paymentService.pay(order);
} catch (ServiceUnavailableException e) {
    fallbackPayment(order);
}
```

---

## 2.4 Saga Pattern

* **분산 트랜잭션 관리**를 위한 패턴
* 예: 주문 → 결제 → 배송 순서 중 일부 실패 시 이전 단계 롤백

```text
Order Service → Payment Service → Shipping Service
  실패 → Payment Service 취소 → Order Service 취소
```

---

## 2.5 Event-Driven Pattern

* 서비스 간 이벤트 기반 **비동기 통신**
* 장점: 느슨한 결합, 확장성 우수

```text
OrderCreatedEvent → Payment Service → PaymentProcessedEvent → Shipping Service
```

---

# 3️⃣ 마이크로서비스 구조 예시

```
microservice-app/
 ├── order-service/
 │    ├── src/
 │    └── database/
 ├── payment-service/
 │    ├── src/
 │    └── database/
 ├── shipping-service/
 │    ├── src/
 │    └── database/
 └── api-gateway/
      └── src/
```

> 각 서비스는 독립적으로 배포 가능하며, API Gateway로 외부 요청을 처리합니다.

---

# 4️⃣ 실무 고려사항

* 📝 **통합 로깅 & 모니터링**: 모든 서비스 로그를 통합 관리
* 📝 **데이터 일관성 관리**: Saga 또는 이벤트 기반 설계
* 📝 **테스트 전략**: 단위 테스트 + 통합 테스트
* 📝 **배포/인프라 자동화**: CI/CD, Docker, Kubernetes 활용

---

# 5️⃣ 요약

* **마이크로서비스 패턴** = 작은 단위 서비스 + 독립 배포 + 명확한 책임
* 핵심 패턴: Database per Service, API Gateway, Circuit Breaker, Saga, Event-Driven
* 장점: 확장성, 팀 단위 독립 개발, 유연성
* 단점: 분산 관리 복잡성, 데이터 일관성 문제, 운영 부담

> 💡 결론: 마이크로서비스는 단순히 애플리케이션을 나누는 것이 아니라,
> **설계 패턴과 운영 전략을 포함한 전체 아키텍처 접근**이 핵심입니다.
