---
title: "[DDD Start 실전] 주문-결제 시스템 설계 및 테스트"
date: 2020-12-12
categories: [Backend, Software-Design]
tags: [ddd, domain-driven design, bounded context, domain model, order, payment, start]
---

# 🚀 DDD Start 실전: 주문-결제 시스템 예제

이번 글에서는 **DDD Start**를 기반으로 실제 **주문(Order) - 결제(Payment) 시스템**을 설계하고,  
테스트 케이스까지 포함한 실전 예제를 다룹니다.  
DDD 입문자뿐만 아니라 실무 개발자에게도 바로 적용 가능한 가이드입니다.

---

# 1️⃣ 단계별 DDD Start 요약

| 단계 | 설명 | 예제 적용 |
|------|------|-----------|
| 🟢 도메인 언어 정리 | 개발자 + 도메인 전문가가 같은 용어 사용 | Order, Customer, Product, Payment |
| 🟡 도메인 분리 | 핵심(Core) / 지원(Supporting) / 범용(Generic) | Core: Order, Supporting: Payment, Generic: Logging |
| 🔵 Bounded Context 정의 | 각 컨텍스트별 책임 정의 | 주문 Context, 결제 Context, 배송 Context |
| 🟣 모델링 | 엔티티, 값 객체, 도메인 서비스 설계 | Order, OrderItem, PaymentService 등 |
| 🟠 구현 | 도메인 중심 구조 기반 코드 작성 | src/domain/... 구조로 구현, 테스트 포함 |

---

# 2️⃣ 도메인 모델링

## 2.1 Order 엔티티

```java
public class Order {
    private final OrderId id;
    private final Customer customer;
    private final List<OrderItem> items = new ArrayList<>();
    private OrderStatus status = OrderStatus.PENDING;

    public Order(OrderId id, Customer customer) {
        this.id = id;
        this.customer = customer;
    }

    public void addItem(Product product, int quantity) {
        items.add(new OrderItem(product, quantity));
    }

    public void confirm() {
        if (items.isEmpty()) throw new IllegalStateException("주문 아이템이 없습니다.");
        status = OrderStatus.CONFIRMED;
    }

    public OrderStatus getStatus() {
        return status;
    }
}
```

---

## 2.2 값 객체(Value Object)

```java
public class OrderItem {
    private final Product product;
    private final int quantity;

    public OrderItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }
}
```

---

## 2.3 도메인 서비스

```java
public class PaymentService {
    public PaymentResult pay(Order order, PaymentMethod method) {
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("결제 전 주문만 결제 가능합니다.");
        }
        return new PaymentResult(order.getId(), true);
    }
}
```

---

# 3️⃣ 코드 구조 예시

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

> 📌 핵심: 도메인 중심 구조 유지, 테스트와 애플리케이션 로직은 분리

---

# 4️⃣ 테스트 케이스 예제

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    @Test
    void 주문_생성_및_확인() {
        Customer customer = new Customer("홍길동");
        Order order = new Order(new OrderId("1"), customer);
        order.addItem(new Product("상품A"), 2);

        order.confirm();
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void 결제_실패_주문_미확인() {
        Customer customer = new Customer("홍길동");
        Order order = new Order(new OrderId("2"), customer);
        PaymentService paymentService = new PaymentService();

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            paymentService.pay(order, PaymentMethod.CARD);
        });

        assertEquals("결제 전 주문만 결제 가능합니다.", exception.getMessage());
    }
}
```

---

# 5️⃣ 실무 팁

* 📝 **작게 시작**: 핵심 도메인부터 Aggregate 정의
* 📝 **Bounded Context 유지**: Context 간 책임 명확히
* 📝 **Ubiquitous Language**: 팀 공통 용어로 설계
* 📝 **테스트 기반 개발**: 도메인 로직부터 검증
* 📝 **점진적 확장**: 결제, 배송, 할인 등 기능은 후속 확장

---

# 6️⃣ 요약

* **DDD Start** = 도메인 주도 설계 시작 단계 프로세스
* **실전 적용**: 작은 핵심 도메인 모델링 → Bounded Context → 서비스 구현 → 테스트
* **목표**: 도메인 중심 설계로 확장 가능하고 유지보수 쉬운 코드 구조 확보

> 💡 결론: DDD Start는 단순 설계 철학이 아니라,
> **실무에서 바로 적용 가능한 도메인 중심 설계 가이드**입니다.
