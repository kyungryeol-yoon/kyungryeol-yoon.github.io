---
title: "[Microservice Pattern 실전] 주문-결제-배송 시스템 설계와 Docker/K8s 적용"
date: 2021-11-11
categories: [Backend, Software-Design]
tags: [microservice, pattern, docker, kubernetes, saga, event-driven]
---

# 🚀 Microservice Pattern 실전 예제: 주문-결제-배송 시스템

마이크로서비스 아키텍처는 하나의 큰 애플리케이션을 **작고 독립적인 서비스 단위**로 나누어 운영하는 방법론입니다.  
이번 글에서는 실전 예제와 함께 **Docker/Kubernetes 환경 + 이벤트 기반 Saga**를 적용해보겠습니다.

---

# 1️⃣ 핵심 패턴 요약

| 패턴 | 설명 | 실전 예제 적용 |
|------|------|----------------|
| Database per Service | 각 서비스가 자체 DB 보유 | Order DB, Payment DB, Shipping DB |
| API Gateway | 단일 진입점, 인증/로깅/라우팅 | Client → API Gateway → 각 서비스 |
| Circuit Breaker | 서비스 장애 시 fallback | Payment Service 실패 시 주문 롤백 |
| Saga | 분산 트랜잭션 관리 | 주문 → 결제 → 배송 순서 처리 |
| Event-Driven | 이벤트 기반 비동기 통신 | OrderCreatedEvent → Payment → Shipping |

---

# 2️⃣ 서비스 구조 예시

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

> 각 서비스는 독립 배포 가능하며, API Gateway로 외부 요청 처리

---

# 3️⃣ 도메인 모델링

## 3.1 Order 엔티티

```java
public class Order {
    private final String id;
    private final String customerId;
    private final List<OrderItem> items = new ArrayList<>();
    private String status = "PENDING";

    public void addItem(String productId, int quantity) {
        items.add(new OrderItem(productId, quantity));
    }

    public void confirm() { status = "CONFIRMED"; }
}
```

## 3.2 Payment 도메인 서비스

```java
public class PaymentService {
    public boolean pay(Order order, String method) {
        if (!order.getStatus().equals("CONFIRMED")) {
            throw new IllegalStateException("결제 전 주문만 처리 가능");
        }
        return true; // 실제 결제 로직
    }
}
```

## 3.3 이벤트 발행

```java
public class OrderCreatedEvent {
    private final String orderId;
    public OrderCreatedEvent(String orderId) { this.orderId = orderId; }
}
```

* OrderService → 이벤트 발행 → PaymentService → 처리 → ShippingService로 이벤트 전파

---

# 4️⃣ 이벤트 기반 Saga 예제

```java
// 주문 생성 → 결제 → 배송
OrderService.createOrder(order);
eventBus.publish(new OrderCreatedEvent(order.getId()));

PaymentService subscribes OrderCreatedEvent
  → 결제 성공 시 PaymentCompletedEvent 발행
  → 실패 시 OrderCancelledEvent 발행

ShippingService subscribes PaymentCompletedEvent
  → 배송 처리
```

> Saga를 통해 **분산 트랜잭션**을 안전하게 처리

---

# 5️⃣ Docker & Kubernetes 예제

## 5.1 Dockerfile (Order Service 예시)

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/order-service.jar .
ENTRYPOINT ["java", "-jar", "order-service.jar"]
```

## 5.2 docker-compose 예시

```yaml
version: '3'
services:
  order-service:
    build: ./order-service
    ports:
      - "8081:8081"
    networks:
      - micro-net
  payment-service:
    build: ./payment-service
    ports:
      - "8082:8082"
    networks:
      - micro-net
  shipping-service:
    build: ./shipping-service
    ports:
      - "8083:8083"
    networks:
      - micro-net
networks:
  micro-net:
```

## 5.3 Kubernetes Deployment (Order Service)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: order-service:latest
          ports:
            - containerPort: 8081
```

---

# 6️⃣ 실무 팁

* 📝 **서비스 독립성**: 각 서비스 DB와 로직 독립
* 📝 **API Gateway 활용**: 인증/라우팅/로깅 집중 관리
* 📝 **이벤트 기반 설계**: Saga, Event-Driven으로 느슨한 결합
* 📝 **Circuit Breaker**: 장애 시 fallback 처리 필수
* 📝 **모니터링 & 로깅**: Prometheus, ELK 등 활용

---

# 7️⃣ 정리

* **마이크로서비스 패턴**은 단순히 나누는 구조가 아니라, **패턴 기반 설계 + 인프라 적용**까지 포함
* 핵심 패턴: Database per Service, API Gateway, Circuit Breaker, Saga, Event-Driven
* 실무 적용: 작은 서비스부터 시작 → 이벤트 기반 통신 → Docker/K8s 배포 → 모니터링

> 💡 결론: 마이크로서비스는 단순한 구조 분리보다
> **설계 패턴과 운영 전략을 포함한 전반적 아키텍처 접근**이 핵심입니다.
