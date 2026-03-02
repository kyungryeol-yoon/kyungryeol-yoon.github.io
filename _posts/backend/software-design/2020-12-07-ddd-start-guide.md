---
title: "[DDD Start] 도메인 주도 설계 입문과 실전 예제"
date: 2020-12-07
categories: [Backend, Software Design]
tags: [ddd, domain-driven design, bounded context, domain model, start]
---

# 🚀 DDD Start: 도메인 주도 설계 시작 가이드

**DDD Start**는 도메인 주도 설계를 처음 도입할 때의 **입문 단계와 실무 접근 방법**을 의미합니다.  
이 글에서는 단계별 흐름과 실제 예제를 통해 DDD를 어떻게 시작할 수 있는지 정리합니다.

---

# 1️⃣ DDD Start 단계 요약

| 단계 | 목적 | 설명 |
|------|------|------|
| 🟢 도메인 언어 정리 | 공통 언어 | 개발자 + 도메인 전문가 + 기획자가 같은 언어 사용 |
| 🟡 도메인 분리 | 책임 정의 | 핵심(Core), 지원(Supporting), 일반(Generic) 도메인 구분 |
| 🔵 컨텍스트 정의 | 경계 설정 | Bounded Context 정의, 각 영역의 Ubiquitous Language 유지 |
| 🟣 모델링 | 객체/개념 추상화 | 엔티티, 값 객체, 도메인 서비스, 애그리거트 정의 |
| 🟠 설계 & 구현 | 코드 구조화 | 도메인 주도 구조 기반으로 구현 |

---

# 2️⃣ 예제: 주문/결제 시스템 DDD Start

## 2.1 비즈니스 언어 정리 (Ubiquitous Language)

- 주문(Order), 결제(Payment), 상품(Product), 고객(Customer)  
- 주문 생성 → 결제 → 배송

> 모든 팀원이 같은 용어로 소통

---

## 2.2 도메인 분리

```

Core Domain: 주문 관리(Order)
Supporting Domain: 결제(Payment)
Generic Domain: 공통 유틸, 로깅, 인증

```

---

## 2.3 Bounded Context 정의

| Context | 담당 기능 |
|---------|-----------|
| 주문 Context | 주문 생성, 주문 상태 관리 |
| 결제 Context | 결제 처리, 결제 상태 확인 |
| 배송 Context | 배송 등록, 배송 추적 |

> 각 Context마다 독립적 모델과 언어 유지

---

## 2.4 도메인 모델링

```java
// Order 엔티티
public class Order {
    private OrderId id;
    private Customer customer;
    private List<OrderItem> items;
    private OrderStatus status;

    public void addItem(Product product, int quantity) { ... }
    public void confirm() { ... }
}
```

```java
// 값 객체(Value Object)
public class OrderItem {
    private Product product;
    private int quantity;
}
```

```java
// 도메인 서비스
public class PaymentService {
    public PaymentResult pay(Order order, PaymentMethod method) { ... }
}
```

---

## 2.5 설계 & 코드 구조 예시

```
src/
 ├── domain/
 │    ├── order/
 │    │    ├── Order.java
 │    │    ├── OrderItem.java
 │    │    └── OrderStatus.java
 │    ├── payment/
 │    │    ├── PaymentService.java
 │    │    └── PaymentResult.java
 │    └── customer/
 │         └── Customer.java
 ├── application/
 │    └── OrderApplicationService.java
 └── infrastructure/
      ├── repository/
      └── external/
```

> 📌 DDD Start는 **도메인 중심**으로 구조를 잡고, 서비스/레포지토리/외부 연동은 나중에 연결

---

# 3️⃣ 실무 팁

* 📌 먼저 **모델링과 협력(책임 중심 설계)**에 집중
* 📌 Context마다 **Ubiquitous Language** 유지
* 📌 단위 테스트 중심으로 개발
* 📌 작은 Aggregate로 시작하고 점진적으로 확장

---

# 4️⃣ 요약

* **DDD Start = DDD 입문/실전 단계 가이드**
* 핵심: **언어 → 도메인 → 컨텍스트 → 모델링 → 코드 구조**
* 실무 적용: 작은 핵심 도메인부터 시작, 점진적 확장, 테스트 기반 개발

> 💡 결론: DDD Start는 단순한 설계 철학이 아니라, **실전에서 도메인 중심 설계를 시작하는 명확한 가이드**입니다.
