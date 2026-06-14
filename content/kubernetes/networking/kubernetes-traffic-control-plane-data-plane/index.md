---
title: "[Kubernetes] 🚦 쿠버네티스 트래픽 구조: 로드밸런서는 어디에 들어갈까"
date: 2026-06-03
tags: [kubernetes, load-balancer, control-plane, data-plane, ingress, egress, ha, kube-vip, network]
description: "쿠버네티스에서 로드밸런서가 들어가는 두 자리(마스터 앞, 앱 앞)를 구분하고, 앱 요청이 마스터를 거치지 않는 컨트롤 플레인 vs 데이터 플레인 구조를 정리합니다."
---

쿠버네티스에서 로드밸런서가 정확히 어디에 들어가는지 헷갈리면 트래픽 구조 전체가 안 그려집니다. 이 글에서는 LB가 들어갈 **두 자리(마스터 API 서버 앞, 앱 인그레스 앞)**를 구분하고, "마스터가 여러 대면 LB가 필요 없다"는 흔한 오해를 정정하며, **앱 요청은 마스터를 거치지 않는다**는 컨트롤 플레인 vs 데이터 플레인의 핵심 구조를 정리합니다.

> **이 시리즈는** 쿠버네티스 gRPC 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 이번 4편은 **쿠버네티스 트래픽 구조** 편입니다. 앞선 [1편(문제와 해결)](/kubernetes/networking/kubernetes-grpc-dotnet-http2-tls-troubleshooting/), [2편(h2 vs h2c)](/kubernetes/networking/kubernetes-grpc-http2-vs-h2c-tls/), [3편(L4 vs L7)](/kubernetes/networking/kubernetes-grpc-l4-l7-load-balancing/)을 먼저 보면 좋습니다.

---

## 📍 로드밸런서가 들어갈 두 자리

**쿠버네티스에서 로드밸런서가 들어갈 자리는 두 군데입니다.** 이 둘을 분리하는 게 이번 편의 전부입니다.

| 자리 | 위치 | 다루는 트래픽 | 사용 LB |
|---|---|---|---|
| **자리 ①** | 마스터(API 서버) 앞 | 관리 트래픽 (kubectl·워커노드 → 마스터) | 외부 L4 (HAProxy, kube-vip) |
| **자리 ②** | 앱(인그레스) 앞 | 서비스 트래픽 (외부 사용자 → Pod) | 인그레스 컨트롤러 L7 (nginx, Contour) |

이 둘은 목적도, 위치도, 다루는 트래픽도 완전히 다릅니다.

---

## 🚪 자리 ②: 인그레스 — nginx·Contour·HAProxy는 서로 대안

**앱 트래픽이 들어오는 입구이며, 3편에서 본 L7 로드밸런서가 여기 들어갑니다.**

nginx·Contour·HAProxy(인그레스 컨트롤러)·Envoy Gateway 등은 **같은 자리를 놓고 경쟁하는 대안들**입니다. 위로 쌓는 게 아니라 **하나만 고르면 됩니다.** nginx나 Contour를 인그레스 컨트롤러로 쓰면, 그 역할에서 HAProxy는 따로 필요 없습니다.

---

## 🧭 자리 ①: 마스터 앞 LB — 흔한 오해

> ❓ **흔한 오해**: "마스터가 여러 대면 알아서 분산하니까, LB는 필요 없는 거 아냐?"

**사실은 정반대입니다. 마스터가 여러 대인 것이 곧 LB가 필요한 이유입니다.**

API 서버들은 서로 클라이언트 요청을 나눠주지 않습니다. 마스터 3대 = 독립적으로 도는 API 서버 3개이고, "대표 창구"가 내장돼 있지 않습니다. LB가 없으면 kubectl이 마스터 한 대의 IP를 콕 찍어야 하고, 그 마스터가 죽으면 나머지가 멀쩡해도 접속이 끊깁니다. HA(고가용성)의 의미가 사라집니다.

```text
kubectl ──▶ LB ──┬─ master1 (API서버)
                  ├─ master2 (API서버)   ← 한 대 죽어도 LB가 다른 데로
                  └─ master3 (API서버)
```

이 자리엔 인그레스 컨트롤러(nginx/Contour)를 **못 씁니다.** 그들은 클러스터 *안*에서 Pod로 도는데, 마스터 앞 LB는 클러스터가 떠 있기 *전에* *바깥*에 있어야 하기 때문입니다(닭-달걀 문제). 그래서 자리 ①은 HAProxy·kube-vip 같은 **외부 L4 LB**가 필요합니다.

> **Tip**: 마스터가 1대인 보통의 테스트/홈랩 구성이면 이 자리는 아예 필요 없습니다.

---

## 🔄 그럼 마스터들끼리 "알아서" 하는 건 뭘까

**마스터들이 협조하긴 하지만, 그 협조는 상태 공유이지 요청 분배가 아닙니다.** 오해의 뿌리가 여기 있습니다.

- **etcd**라는 공동 저장소에 클러스터 상태를 함께 보관하고, 내부적으로 리더를 뽑아 동기화합니다.
- 일부 컴포넌트(스케줄러, 컨트롤러 매니저 등)도 리더를 선출해 하나만 동작합니다(leader election).

하지만 이건 전부 "데이터를 맞추는" 얘기입니다. "들어온 클라이언트 요청을 창구에서 나눠주는" 일은 아닙니다. 그 창구 분배가 바로 LB의 몫입니다.

---

## 🧠 컨트롤 플레인 vs 데이터 플레인 — 앱 요청은 마스터를 안 거친다

**가장 중요한 구조적 사실은 앱 요청이 마스터 서버를 통과하지 않는다는 것입니다.** 쿠버네티스엔 분리된 두 경로가 있습니다.

```text
[관리 경로 — 마스터 사용 (컨트롤 플레인)]
kubectl / kubelet ──▶ 마스터(API서버)

[앱 요청 경로 — 마스터 안 거침 (데이터 플레인)]
클라이언트 ──▶ 인그레스(nginx/Contour) ──▶ Service ──▶ Pod
```

마스터는 "어떤 Pod가 있는지" 정보를 **관리**하고 인그레스·노드에 **미리 뿌려둘** 뿐, 요청을 직접 받아 전달하지 않습니다.

### 건물 관리실 비유

- **마스터 = 건물 관리실.** 누가 몇 호에 사는지 명부를 관리하고, 입주자가 오고 가면(Pod 생성·삭제) 명부를 갱신합니다.
- **인그레스 = 로비의 안내 표지판.** 관리실이 갱신해둔 정보로 채워져 있습니다.
- **방문자(요청)** 는 관리실에 들르지 않습니다. 표지판만 보고 곧장 해당 호실(Pod)로 갑니다.

그래서 마스터가 잠깐 바빠도, 이미 떠 있는 앱들은 멀쩡히 요청을 처리합니다. 마스터는 "정보를 나눠주는 두뇌"이지 "요청을 나눠주는 창구"가 아닙니다.

> 📌 1편에서 `port-forward`로 앱을 격리 테스트했는데, 이건 예외입니다. port-forward 같은 디버그 통로는 관리 경로(API 서버)를 거치는 특수 케이스입니다. **일반 서비스 트래픽**이 마스터를 안 거친다는 뜻입니다.

---

## ↔️ 덤: Ingress와 Egress

같은 맥락에서 자주 나오는 짝이 **Ingress / Egress**이며, 트래픽의 방향을 가리킵니다.

| 구분 | 방향 | 예시 | 다루는 방법 |
|---|---|---|---|
| **Ingress** | 외부 → 클러스터 안 | 사용자가 앱에 접속 | Ingress 객체, Gateway API |
| **Egress** | 클러스터 안 → 외부 | Pod가 외부 API·DB 호출 | NetworkPolicy egress, Egress Gateway |

Ingress는 정식 객체가 있지만 `Egress`라는 단일 객체는 없고, NetworkPolicy의 egress 규칙이나 Egress Gateway로 다룹니다. 홈랩 테스트 수준에선 보통 egress를 따로 신경 쓰지 않아도 됩니다(Pod는 기본적으로 외부로 자유롭게 나갑니다).

---

## 📝 한 줄 요약

- LB가 들어갈 자리는 둘 — **마스터 앞(관리용, 외부 L4)** 과 **앱 앞(서비스용, 인그레스 L7)**입니다.
- 마스터가 여러 대면 LB가 *더* 필요하고(오해 정정), **앱 요청은 마스터를 거치지 않습니다**(컨트롤 플레인 ≠ 데이터 플레인).

---

## ❓ 자주 묻는 질문

### Q. 마스터가 3대면 로드밸런서 없이도 HA가 되나요?

안 됩니다. API 서버는 서로 요청을 분배하지 않으므로 kubectl·워커노드가 접속할 "대표 창구"인 LB가 필요합니다. LB가 없으면 특정 마스터 IP에 묶여 그 마스터가 죽을 때 접속이 끊깁니다.

### Q. 인그레스 컨트롤러를 마스터 앞 LB로 쓸 수 있나요?

없습니다. 인그레스 컨트롤러는 클러스터 안에서 Pod로 동작하므로, 클러스터가 뜨기 전·바깥에 있어야 하는 마스터 앞 LB 역할은 못 합니다. 그 자리엔 HAProxy·kube-vip 같은 외부 L4 LB가 필요합니다.

### Q. 앱 요청이 느려지면 마스터(API 서버) 부하가 원인인가요?

대부분 아닙니다. 일반 서비스 트래픽은 인그레스 → Service → Pod 경로로 흐르며 마스터를 거치지 않습니다. 마스터는 관리(컨트롤 플레인) 트래픽만 처리합니다.

### Q. nginx, Contour, HAProxy 인그레스 컨트롤러를 동시에 써야 하나요?

아닙니다. 같은 자리(앱 앞)를 놓고 경쟁하는 대안이라 하나만 고르면 됩니다.

---

## 📚 참고

- [Kubernetes Docs - Kubernetes Components(Control Plane / Node)](https://kubernetes.io/docs/concepts/overview/components/)
- [Kubernetes Docs - Creating Highly Available Clusters with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/)
- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [kube-vip - Kubernetes Control Plane LB](https://kube-vip.io/)
- [관련 글: L4 vs L7 로드밸런서 (3편)](/kubernetes/networking/kubernetes-grpc-l4-l7-load-balancing/) · [HTTP/2는 TLS가 아니다 (2편)](/kubernetes/networking/kubernetes-grpc-http2-vs-h2c-tls/)
</content>
