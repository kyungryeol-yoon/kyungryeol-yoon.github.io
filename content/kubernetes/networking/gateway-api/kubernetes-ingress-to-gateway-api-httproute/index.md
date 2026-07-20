---
title: "[Kubernetes] 🌐 Ingress에서 Gateway API로: HTTPProxy vs HTTPRoute 비교"
date: 2026-06-04
tags: [gateway-api, ingress, httproute, httpproxy, grpcroute, contour, envoy, kubernetes, network]
description: "쿠버네티스 트래픽 라우팅이 Ingress → 벤더 CRD → 표준 Gateway API로 진화한 흐름과, Contour 전용 HTTPProxy vs 표준 HTTPRoute의 차이를 실무 관점에서 정리합니다."
---

쿠버네티스에서 앱 트래픽을 라우팅하는 방법은 Ingress로 시작해 벤더별 CRD를 거쳐 표준 **Gateway API**(HTTPRoute·GRPCRoute)로 수렴하고 있습니다. 이 글에서는 그 진화의 흐름과 함께, **설정(API)과 엔진(Envoy)이 다른 층**이라는 핵심 구분, 그리고 Contour 전용 **HTTPProxy** vs 표준 **HTTPRoute**의 차이를 실무 관점에서 정리합니다.

> **이 시리즈는** 쿠버네티스 gRPC 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 이번 5편은 **Ingress → Gateway API** 편입니다. 앞선 [3편(L4 vs L7)](/kubernetes/networking/grpc/kubernetes-grpc-l4-l7-load-balancing/), [4편(트래픽 구조)](/kubernetes/networking/kubernetes-traffic-control-plane-data-plane/)을 먼저 보면 좋습니다.

---

## 🧩 먼저: API(설정)와 엔진(Envoy)은 다른 층이다

**Ingress·HTTPProxy·Gateway API는 "설정(API)"이고, Envoy·nginx는 그 설정을 실행하는 "엔진"입니다.** 이걸 안 나누면 "Gateway → Envoy → HTTPRoute" 식으로 머릿속에서 다 섞입니다. 두 층을 분리합시다.

- **API 층 (내가 쓰는 설정)**: Ingress, HTTPProxy, Gateway API(Gateway + HTTPRoute + GRPCRoute). "이렇게 라우팅해라"라고 적는 문서입니다.
- **데이터 플레인 엔진 (실제로 트래픽을 처리하는 것)**: Envoy(또는 nginx). 내가 적은 설정대로 진짜 패킷을 나르는 프록시입니다.

> 💡 Envoy는 API가 아니라 **엔진**입니다. Contour도, Istio도, Envoy Gateway도 전부 그 밑에서 Envoy를 엔진으로 씁니다. 그러니 "Gateway API라는 설정을 Envoy라는 엔진이 실행한다"가 올바른 그림입니다. Envoy를 HTTPRoute와 같은 줄에 두면 안 됩니다.

---

## 🧬 진화의 흐름

쿠버네티스 라우팅 API는 3세대를 거쳐 진화했습니다.

| 세대 | 대표 | 특징 | 한계 |
|---|---|---|---|
| **1세대** | Ingress (빌트인) | 1.19(2020) GA, HTTP 노출 표준 | 너무 단순 → 애너테이션 남발, 파편화 |
| **2세대** | 벤더 CRD | Contour **HTTPProxy**, Istio **VirtualService**, Traefik IngressRoute | 기능은 풍부하나 **벤더 락인** |
| **3세대** | **Gateway API** | GatewayClass·Gateway·HTTPRoute·GRPCRoute | 벤더 중립, 이식성 높음 (표준) |

### 1세대: Ingress (원조, 빌트인)

Ingress API는 쿠버네티스 1.19(2020)에서 GA가 된 기능으로, 오랫동안 HTTP 서비스를 노출하는 표준이었습니다. 하지만 너무 단순해서 컨트롤러마다 부족한 기능을 **애너테이션으로 메우기** 시작했고, 설정이 파편화되고 이식성이 떨어졌습니다.

### 2세대: 벤더별 CRD

벤더들이 각자 풍부한 CRD를 만들어 한계를 메웠습니다 — Contour의 **HTTPProxy**, Istio의 **VirtualService**, Traefik의 IngressRoute처럼요. 기능은 좋았지만 전부 **벤더 락인**이었습니다.

### 3세대: Gateway API (표준)

그 교훈을 모아 커뮤니티가 표준으로 수렴한 게 Gateway API입니다. GatewayClass·Gateway·HTTPRoute·GRPCRoute 같은 타입화된 리소스로, 벤더 중립적이고 이식성이 높습니다.

---

## ⚔️ HTTPProxy vs HTTPRoute

**HTTPProxy는 Contour 전용 CRD이고, HTTPRoute는 표준 Gateway API의 일부입니다.** 둘 다 L7 라우팅을 하지만 출신이 다릅니다.

| 구분 | HTTPProxy | HTTPRoute |
|---|---|---|
| 출신 | Contour 전용 CRD (벤더 독자) | Gateway API 표준 |
| 동작 범위 | Contour에서만 | 표준 구현 게이트웨이 어디서나 |
| 성숙도 | 풍부·성숙 | 표준, 빠르게 성숙 중 |
| gRPC 전용 | (HTTPProxy 내 설정) | 표준 **GRPCRoute** |
| 이식성 | 낮음(벤더 종속) | 높음 |

한 줄로: **"한 벤더 전용이지만 성숙(HTTPProxy)" vs "표준이라 이식성 높음(HTTPRoute)".**

gRPC 라우팅을 표준으로 작성하면 다음과 같습니다.

```yaml
# GRPCRoute (Gateway API 표준)
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: my-grpc-route
spec:
  parentRefs:
    - name: my-gateway       # 플랫폼팀이 만든 Gateway 참조
  rules:
    - matches:
        - method:
            service: helloworld.Greeter   # gRPC 서비스명으로 매칭
      backendRefs:
        - name: my-grpc-svc
          port: 8080
```

---

## 🤝 역할 분리 — Gateway API의 핵심 장점

**Gateway API는 플랫폼팀(인프라)과 앱팀(라우팅)의 책임을 공식적으로 나눕니다.**

| 리소스 | 소유 주체 | 담당 |
|---|---|---|
| **GatewayClass / Gateway** | 플랫폼·인프라 팀 | 리스너·포트·TLS |
| **HTTPRoute / GRPCRoute** | 앱·프로젝트 팀 | 라우팅 규칙 |

즉 플랫폼팀이 인프라(Gateway)를, 앱팀이 라우트를 따로 소유하는 구조입니다. 이 "관심사의 분리(separation of concerns)"가 핵심 이점입니다. (다음 6편에서 TLS 인증서를 이 구조로 중앙화하는 걸 다룹니다.)

---

## 🕸️ 왜 Istio 문서랑 비슷하게 느껴질까

**Istio의 자체 CRD(VirtualService·Gateway·DestinationRule)가 Gateway API 설계에 큰 영향을 줬기 때문입니다.** Istio는 Envoy 기반 서비스 메시이고, 지금은 Istio도 Gateway API를 지원합니다. 그래서 "어디서 본 것 같다"는 감이 정확합니다.

단, 결이 하나 다릅니다.

- **Gateway API / Ingress** = **north-south** 트래픽 (외부 ↔ 클러스터)
- **서비스 메시** = **east-west** 트래픽 (서비스 ↔ 서비스)

둘은 경쟁이 아니라 보완 관계입니다.

---

## 📅 2026년 현재 상태

> 빠르게 변하는 영역이라 작성 시점(2026년 6월) 기준이며, 최신 공식 문서 확인을 권장합니다.

- **Gateway API**: 2023년 10월 v1.0 GA에 도달했고, 2026년 들어 **v1.5**까지 릴리스되며 여러 기능이 Standard(Stable)로 승격된 성숙·프로덕션 레디 상태입니다. SIG Network의 공식 권고는 Gateway API로의 이전입니다.
- **Ingress는 사라지지 않습니다.** Ingress API 자체는 폐기·제거 계획이 없고, 다만 더 이상 적극 개발되지 않는 "feature-frozen" 상태입니다.
- **⚠️ 주의 — ingress-nginx 은퇴**: 가장 널리 쓰이던 커뮤니티 ingress-nginx 컨트롤러는 **2026년 3월 retired** 되었습니다. 저장소는 `kubernetes-retired`로 옮겨져 read-only가 되었고, 더 이상 릴리스·버그픽스·**CVE 패치가 없습니다.** 기존 배포는 계속 동작하지만 신규 보안 취약점은 패치되지 않으므로 마이그레이션이 권장됩니다. (이는 커뮤니티 프로젝트 얘기이며, F5/NGINX의 상용 컨트롤러는 별개입니다.) 이전을 돕는 공식 도구 **ingress2gateway**도 제공됩니다.
- **표준이라 구현체가 여럿**입니다. 완전 적합 구현으로 Envoy Gateway·Istio·NGINX Gateway Fabric·Traefik·Cilium·kgateway 등이 있고, Contour·AWS LB Controller·GKE Gateway·Kong 등은 부분 적합입니다.

---

## 🎯 실무 권장

신규로 시작한다면 Gateway API가 자연스럽고, 잘 돌아가는 Ingress 설정이 있다면 구체적인 한계에 부딪힐 때 옮기면 됩니다. 1편에서 HTTPProxy를 썼더라도 당장 바꿀 필요는 없지만, **신규 설계·멀티 벤더·이식성**이 중요하면 HTTPRoute/GRPCRoute 방향이 미래지향적입니다. 다만 ingress-nginx를 쓰고 있다면 은퇴(EOL)로 인해 이전이 사실상 필수입니다.

---

## 📝 한 줄 요약

- Ingress(원조, 애너테이션 한계) → 벤더 CRD(HTTPProxy 등) → 표준 Gateway API(HTTPRoute·GRPCRoute)로 진화 중입니다.
- HTTPProxy는 Contour 전용, HTTPRoute는 표준이라 이식성이 높습니다.
- **API(설정)와 Envoy(엔진)는 다른 층**입니다.

---

## ❓ 자주 묻는 질문

### Q. HTTPProxy와 HTTPRoute 중 무엇을 써야 하나요?

이식성·표준·멀티 벤더가 중요하면 HTTPRoute(Gateway API)를 권장합니다. 이미 Contour와 HTTPProxy로 잘 돌아가고 있다면 당장 바꿀 필요는 없지만, 신규 설계는 표준 방향이 미래지향적입니다.

### Q. Ingress는 이제 안 쓰나요?

Ingress API 자체는 제거 계획이 없는 feature-frozen 상태로 계속 동작합니다. 다만 커뮤니티 ingress-nginx 컨트롤러가 2026년 3월 은퇴해 CVE 패치가 중단되었으므로, 해당 컨트롤러 사용자는 마이그레이션이 필요합니다.

### Q. Gateway API와 서비스 메시(Istio)는 무엇이 다른가요?

Gateway API는 north-south(외부↔클러스터) 트래픽을, 서비스 메시는 east-west(서비스↔서비스) 트래픽을 주로 다룹니다. 경쟁이 아니라 보완 관계이며, Istio는 Gateway API도 지원합니다.

### Q. Envoy와 Gateway API의 관계는?

Envoy는 트래픽을 실제로 처리하는 데이터 플레인 "엔진"이고, Gateway API는 "이렇게 라우팅하라"를 적는 설정(API)입니다. Contour·Istio·Envoy Gateway 등이 Gateway API 설정을 받아 Envoy 엔진으로 실행합니다.

---

## 📚 참고

- [Gateway API v1.0: GA Release (Kubernetes Blog)](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/)
- [Gateway API v1.5: Moving features to Stable (Kubernetes Blog)](https://kubernetes.io/blog/2026/04/21/gateway-api-v1-5/)
- [Ingress NGINX Retirement: What You Need to Know (Kubernetes Blog)](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)
- [Gateway API 공식 문서 - Implementations](https://gateway-api.sigs.k8s.io/implementations/)
- [ingress2gateway - 마이그레이션 도구](https://github.com/kubernetes-sigs/ingress2gateway)
- [관련 글: 트래픽 구조 (4편)](/kubernetes/networking/kubernetes-traffic-control-plane-data-plane/) · [L4 vs L7 (3편)](/kubernetes/networking/grpc/kubernetes-grpc-l4-l7-load-balancing/)
</content>
