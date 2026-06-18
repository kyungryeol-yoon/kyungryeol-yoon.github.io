---
title: "[Microservices] 마이크로서비스 패턴 완벽 가이드 — 개요부터 실전(Java·Docker·K8s)까지"
date: 2022-01-02
tags: [microservices, pattern, saga, event-driven, api-gateway, circuit-breaker, docker, kubernetes]
description: "마이크로서비스 아키텍처의 핵심 5대 패턴(Database per Service·API Gateway·Circuit Breaker·Saga·Event-Driven)을 정의부터 설명하고, 주문-결제-배송 시스템을 Java·Docker·Kubernetes로 구현하는 실전 예제까지 한 글에 정리합니다."
---

마이크로서비스는 하나의 큰 애플리케이션을 **작고 독립적인 서비스 단위**로 나눠 운영하는 아키텍처 스타일입니다. 이 글에서는 **5대 핵심 패턴**을 정의부터 정리하고, **주문-결제-배송** 시스템을 Java 도메인 모델링·이벤트 기반 Saga·Docker/Kubernetes 배포로 구현하는 **실전 예제**까지 한 흐름으로 다룹니다.

## 🏗️ 마이크로서비스란?

**마이크로서비스 아키텍처(Microservice Architecture)** 는 단일 책임을 가진 작은 서비스들을 독립적으로 배포·운영하는 방식입니다.

> 🔑 핵심: **작은 서비스 단위 + 독립 배포 + 명확한 책임**

| 특징 | 설명 |
|---|---|
| 작은 단위 | 각 서비스는 단일 책임(Single Responsibility) 중심 |
| 독립 배포 | 서비스별로 독립 빌드/배포 |
| 독립 데이터 | 각 서비스가 자체 데이터 저장소 보유 |
| 통신 방식 | REST API, gRPC, 메시지 큐 |
| 팀 단위 개발 | 서비스 단위로 팀이 독립 개발 |

모놀리식과 비교하면 마이크로서비스는 **유연성·확장성**을 강조하지만, **분산 관리 복잡성·데이터 일관성·운영 부담**이라는 비용이 따릅니다.

---

## 🧩 5대 핵심 패턴

### 1) Database per Service

각 서비스가 **자체 데이터베이스**를 가집니다. 결합도를 낮추지만, 데이터 일관성은 별도 전략(Saga·이벤트)으로 관리해야 합니다.

```text
Order Service DB    <-- 독립
Payment Service DB  <-- 독립
Shipping Service DB <-- 독립
```

### 2) API Gateway

클라이언트 요청을 **단일 진입점**에서 받아 인증·로깅·라우팅·응답 집계를 수행합니다.

```text
Client → API Gateway → Order Service
                     → Payment Service
                     → Shipping Service
```

> 💡 클라이언트(웹/모바일)별로 응답을 최적화하려면 **BFF(Backend for Frontend)** 패턴으로 게이트웨이를 클라이언트별로 두기도 합니다.

### 3) Circuit Breaker

서비스 호출이 반복 실패하면 **회로를 열어** 연쇄 장애를 막고 fallback으로 처리합니다.

```java
try {
    paymentService.pay(order);
} catch (ServiceUnavailableException e) {
    fallbackPayment(order); // 캐시/기본값/지연 큐 등 의미 있는 대체
}
```

실무에서는 Java용 [resilience4j](https://resilience4j.readme.io/docs/circuitbreaker)를 많이 씁니다. 회로는 **CLOSED → OPEN → HALF_OPEN** 상태를 오가며, 권장 설정은 다음과 같습니다.

- 실패율 임계치는 **평소 에러율 기준**으로(평소 5%면 10% 정도)
- 고트래픽 서비스는 **시간 기반 슬라이딩 윈도우**(예: 60초)가 카운트 기반보다 안정적
- fallback은 **의미 있게**(예외 재던지기·null 반환은 무의미)

### 4) Saga

여러 서비스에 걸친 **분산 트랜잭션**을 보상(rollback)으로 관리합니다.

```text
Order → Payment → Shipping
  실패 → Payment 취소 → Order 취소
```

구현 방식은 두 가지입니다.

| 방식 | 설명 | 적합 |
|---|---|---|
| **Choreography(코레오그래피)** | 각 서비스가 이벤트에 반응해 다음 단계 트리거 | 작고 느슨한 결합, 확장성 |
| **Orchestration(오케스트레이션)** | 중앙 코디네이터가 순서·보상 제어 | 큰 워크플로·롤백 가시성 필요 |

### 5) Event-Driven

서비스 간 **이벤트 기반 비동기 통신**으로 느슨한 결합과 확장성을 얻습니다.

```text
OrderCreatedEvent → Payment Service → PaymentProcessedEvent → Shipping Service
```

---

## 🚀 실전: 주문-결제-배송 시스템

### 서비스 구조

```text
microservice-app/
├── order-service/      (src/, database/)
├── payment-service/    (src/, database/)
├── shipping-service/   (src/, database/)
└── api-gateway/        (src/)
```

### 도메인 모델링 (Java)

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

```java
public class OrderCreatedEvent {
    private final String orderId;
    public OrderCreatedEvent(String orderId) { this.orderId = orderId; }
}
```

### 이벤트 기반 Saga 흐름

```java
// 주문 생성 → 결제 → 배송
OrderService.createOrder(order);
eventBus.publish(new OrderCreatedEvent(order.getId()));

// PaymentService subscribes OrderCreatedEvent
//   → 결제 성공 시 PaymentCompletedEvent 발행
//   → 실패 시 OrderCancelledEvent 발행 (보상 트랜잭션)

// ShippingService subscribes PaymentCompletedEvent
//   → 배송 처리
```

> 위 예시는 **Choreography** 방식입니다. 단계가 많아지고 롤백 가시성이 중요해지면 Orchestration으로 전환을 고려하세요.

---

## 🐳 Docker·Kubernetes 배포

### Dockerfile (Order Service 예시)

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/order-service.jar .
ENTRYPOINT ["java", "-jar", "order-service.jar"]
```

### docker-compose

```yaml
version: '3'
services:
  order-service:
    build: ./order-service
    ports: ["8081:8081"]
    networks: [micro-net]
  payment-service:
    build: ./payment-service
    ports: ["8082:8082"]
    networks: [micro-net]
  shipping-service:
    build: ./shipping-service
    ports: ["8083:8083"]
    networks: [micro-net]
networks:
  micro-net:
```

### Kubernetes Deployment (Order Service)

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

## 📦 컨테이너 이미지 연계

마이크로서비스는 서비스 단위로 **독립 이미지**를 관리하므로, 이미지 크기·레이어 최적화가 배포 속도와 CI/CD 효율에 직결됩니다. 멀티스테이지 빌드·레이어 캐시·경량 베이스 전략은 별도 글에서 자세히 다룹니다.

> 🔗 [컨테이너 이미지 크기와 UFS — 구조부터 최적화까지](/docker/container-image-size-ufs-optimization/)

---

## 🤔 실무 팁 / 고려사항

- **통합 로깅·모니터링**: 분산된 서비스 로그를 한곳에서(예: Loki/ELK, Prometheus). 추적은 OpenTelemetry.
- **데이터 일관성**: Saga 또는 이벤트 기반으로 최종 일관성 확보.
- **장애 격리**: Circuit Breaker + 의미 있는 fallback 필수.
- **점진적 전환**: 모놀리식에서 시작한다면 **Strangler Fig 패턴**으로 게이트웨이가 기능을 하나씩 새 서비스로 옮겨 가며 기존 시스템을 점진적으로 대체.
- **배포 자동화**: CI/CD + Docker + Kubernetes.

---

## ❓ 자주 묻는 질문

**Q. Saga는 Choreography와 Orchestration 중 무엇이 좋나요?**
서비스가 적고 느슨하면 Choreography가 깔끔하고, 단계가 많고 롤백·가시성이 중요하면 Orchestration이 안전합니다.

**Q. Circuit Breaker는 직접 구현하나요?**
Java/Spring이라면 resilience4j 같은 검증된 라이브러리를 쓰는 편이 좋습니다. 상태 전이·메트릭·윈도우 설정을 제공합니다.

**Q. 모놀리식을 한 번에 마이크로서비스로 바꿔야 하나요?**
아닙니다. **Strangler Fig** 패턴으로 기능을 하나씩 떼어내 점진적으로 전환하는 것이 안전합니다.

**Q. 서비스마다 DB를 꼭 분리해야 하나요?**
Database per Service가 원칙이지만, 그만큼 데이터 일관성 관리(Saga·이벤트) 부담이 커집니다. 도메인 경계에 맞춰 판단하세요.

---

## 📚 참고

- [Saga Pattern: Orchestration vs Choreography — DEV Community](https://dev.to/rock_win_c053fa5fb2399067/saga-pattern-in-microservices-orchestration-vs-choreography-mml)
- [CircuitBreaker — resilience4j 공식 문서](https://resilience4j.readme.io/docs/circuitbreaker)
- [Backends for Frontends Pattern — Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [Refactoring Monoliths to Microservices with BFF and Strangler — WunderGraph](https://wundergraph.com/blog/wg-strangler-bff)
