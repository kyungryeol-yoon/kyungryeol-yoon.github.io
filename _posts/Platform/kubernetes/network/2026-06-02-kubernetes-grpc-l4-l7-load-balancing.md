---
title: "[Kubernetes] ⚖️ L4 vs L7 로드밸런서와 gRPC 로드밸런싱의 함정"
date: 2026-06-02
categories: [Platform, Kubernetes, Network]
tags: [load-balancer, l4, l7, grpc, http2, kubernetes, haproxy, nlb, alb, network]
description: "L4와 L7 로드밸런서의 차이를 편지 비유로 정리하고, gRPC가 HTTP/2 연결 다중화 때문에 L4에서 한 Pod로 쏠리는 함정과 L7이 필요한 이유를 실무 관점에서 설명합니다."
pin: false
---

쿠버네티스에서 gRPC를 운영하다 보면 "L7 지원 되냐"는 질문을 반복해서 듣게 됩니다. 이 글에서는 L4와 L7 로드밸런서의 차이를 편지 비유로 정리하고, **gRPC가 HTTP/2 연결 다중화 때문에 L4 로드밸런서에서 한 Pod로만 트래픽이 쏠리는 함정**과 그래서 L7이 사실상 필수인 이유를 다룹니다. 또한 L4/L7이 버전도 하드웨어도 아닌 소프트웨어 동작 방식이라는 점도 짚습니다.

> **이 시리즈는** 쿠버네티스에 gRPC를 올리다 막힌 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 이번 3편은 **L4 vs L7과 로드밸런서** 편입니다. 앞선 [1편(문제와 해결)](/posts/kubernetes-grpc-dotnet-http2-tls-troubleshooting/), [2편(h2 vs h2c)](/posts/kubernetes-grpc-http2-vs-h2c-tls/)을 먼저 보면 이해가 빠릅니다.

---

## ✉️ L4 vs L7 — 편지를 여느냐, 안 여느냐

**L4는 편지를 안 뜯고 겉봉의 주소(IP:포트)만 보고 전달하고, L7은 편지를 열어 내용까지 읽고 판단합니다.** 2편의 편지 비유를 그대로 이어가면 깔끔합니다.

- **L4** = 편지를 **안 뜯고**, 겉봉의 **주소(IP:포트)만 보고** 전달합니다. 안에 뭐가 들었는지는 신경 쓰지 않습니다.
- **L7** = 편지를 **열어서** 내용까지 읽고 판단합니다. 경로·호스트·헤더·gRPC 메서드를 보고 라우팅하고, TLS를 풀고, 헤더를 고치기도 합니다.

용어로 풀면 L4는 전송 계층(TCP/포트), L7은 애플리케이션 계층(HTTP)입니다. 하지만 "겉봉만 보냐 / 내용까지 보냐"로 기억하는 게 훨씬 쓸모 있습니다.

이 구분은 1편과도 연결됩니다. 게이트웨이가 했던 일(TLS 풀기, `:scheme` 헤더 확인·수정, gRPC 라우팅)은 전부 "내용을 읽어야 가능한 일" = **L7**이었습니다. h2c 미스매치 같은 문제도 L7이라서 생긴 것입니다. 순수 L4였다면 내용을 안 읽으니 그런 문제 자체가 없습니다.

---

## ⚙️ 각각의 장단점

| 구분 | 장점 | 단점 |
|---|---|---|
| **L4** (전송 계층) | 단순·고속, 프로토콜 무관(바이트로 전달), TLS 패스스루로 종단 암호화 쉬움 | 경로/호스트/gRPC 메서드별 라우팅·중앙 TLS 종료·헤더 조작 불가 |
| **L7** (애플리케이션 계층) | 세밀한 라우팅, 중앙 TLS 종료, 헤더 조작, gRPC 요청 단위 분산 | 무겁고, 프로토콜을 이해해야 함("h2c 지원하냐" 문제 발생) |

L4는 프로토콜을 안 가리니(HTTP/1.1이든 HTTP/2든 그냥 바이트로 전달) 미스매치가 없습니다. 대신 똑똑한 처리는 못 합니다. L7은 그 똑똑한 걸 다 하는 대신, 1편에서 겪은 h2c 지원 같은 문제가 따라옵니다.

---

## 🪤 gRPC 로드밸런싱의 함정 (여기가 핵심)

**gRPC는 연결 하나에 요청 여러 개를 실어 보내기 때문에(HTTP/2 다중화), L4 로드밸런서로는 트래픽이 한 Pod로 쏠립니다.** gRPC를 쓴다면 L4/L7 구분이 결정적으로 중요해지는 지점입니다.

### L4 로드밸런서는 "연결 단위"로 분산한다

한 클라이언트가 연결 하나를 열면, 그 안의 모든 요청이 **한 Pod에만 몰립니다.**

```text
[L4 — 연결 단위]
클라이언트 ──(연결 1개, 요청 100개)──▶ [LB] ──▶ Pod A  (몰림 😵)
                                              Pod B  (놀고 있음)
                                              Pod C  (놀고 있음)
```

Pod를 3개로 늘려도 한 곳만 바쁘고 나머지는 놉니다. 스케일아웃이 무력화됩니다.

### L7 로드밸런서는 "요청 단위"로 분산한다

같은 연결이라도 개별 RPC를 여러 Pod에 골고루 보냅니다.

```text
[L7 — 요청 단위]
클라이언트 ──(연결 1개, 요청 100개)──▶ [LB] ──▶ Pod A  (33개)
                                              Pod B  (33개)
                                              Pod C  (34개)
```

그래서 **gRPC 로드밸런싱은 사실상 L7이 필요합니다.**

> 💡 회의에서 듣던 "L7 지원 되냐"의 정체는 "이 장비가 편지를 열어 내용을 읽고, 특히 **gRPC를 요청 단위로** 똑똑하게 분산할 수 있냐"는 질문이었습니다. "L7 지원 안 되면 gRPC가 곤란하다"는 말이 나오면 십중팔구 이 분산 문제입니다.

---

## 🔀 로드밸런서는 "버전"이 아니라 "종류"

**L7은 L4의 신형 업그레이드가 아닙니다.** 흔한 오해입니다.

L4/L7은 "어느 층에서 일하느냐에 따른 분류"일 뿐, 둘 다 현역이고 목적에 따라 고릅니다. L7이 항상 더 좋은 게 아니라 — 똑똑한 대신 무겁고 프로토콜을 가립니다. 단순·고속·프로토콜 무관이 필요하면 L4가 정답일 때도 많습니다.

---

## 🖥️ 전용 장비가 아니라 소프트웨어의 동작 방식

**오늘날 L4/L7은 전용 하드웨어가 아니라 소프트웨어의 동작 방식입니다.** 예전엔 로드밸런서가 물리 박스(어플라이언스)였던 탓에 전용 장비가 필요하다는 인상이 남아 있지만, 지금은 일반 머신에서 돌리는 소프트웨어 하나면 됩니다.

대표적으로 **HAProxy는 설정 한 줄로 모드를 고릅니다.**

```haproxy
# L4 — 편지 안 열고 그냥 전달
frontend grpc_l4
    bind *:8080
    mode tcp
    default_backend grpc_servers

# L7 — 편지 열어서 내용 보고 처리 (gRPC 요청 단위 분산)
frontend grpc_l7
    bind *:8443 ssl crt /etc/haproxy/certs/server.pem alpn h2
    mode http
    default_backend grpc_servers
```

- `mode tcp` → **L4** (편지 안 열고 그냥 전달)
- `mode http` → **L7** (편지 열어서 내용 보고 처리)

클라우드는 이름부터 층을 드러내기도 합니다.

| 클라우드 LB | 계층 | 특징 |
|---|---|---|
| AWS **NLB** (Network LB) | L4 | 초고속, 연결 단위 |
| AWS **ALB** (Application LB) | L7 | HTTP/gRPC 라우팅, 요청 단위 |

---

## 📝 한 줄 요약

- L4는 겉봉(IP:포트)만 보고 빠르게 전달, L7은 편지를 열어 똑똑하게 처리합니다.
- gRPC는 연결 하나에 요청을 몰아 보내기 때문에, **요청 단위로 분산하는 L7이 사실상 필수**입니다.
- L4/L7은 버전도 하드웨어도 아니라, 소프트웨어의 동작 방식(종류)입니다.

---

## ❓ 자주 묻는 질문

### Q. gRPC를 L4 로드밸런서 뒤에 두면 왜 문제가 되나요?

gRPC는 HTTP/2의 다중화로 연결 하나에 여러 요청을 싣습니다. L4는 연결 단위로 분산하므로, 한 클라이언트의 모든 요청이 한 Pod로만 가서 다른 Pod가 놀게 됩니다. 스케일아웃 효과가 사라집니다.

### Q. 그럼 gRPC는 항상 L7을 써야 하나요?

요청 단위 분산이 필요하면 L7(또는 클라이언트 사이드 LB, 서비스 메시)이 필요합니다. 다만 단일 백엔드이거나 클라이언트가 직접 분산하는 구조라면 L4도 가능합니다.

### Q. L7이 L4보다 항상 좋은가요?

아닙니다. L7은 똑똑한 대신 무겁고 프로토콜을 이해해야 합니다. 단순·고속·프로토콜 무관 처리가 필요하면 L4가 더 적합합니다. 둘은 버전 관계가 아니라 용도에 따른 선택입니다.

### Q. HAProxy에서 L4와 L7은 어떻게 구분하나요?

`mode tcp`는 L4(내용을 안 보고 전달), `mode http`는 L7(HTTP를 해석해 처리)입니다. gRPC를 요청 단위로 분산하려면 `mode http`가 필요합니다.

---

## 📚 참고

- [gRPC Blog - gRPC Load Balancing](https://grpc.io/blog/grpc-load-balancing/)
- [Kubernetes Blog - gRPC Load Balancing on Kubernetes without Tears](https://kubernetes.io/blog/2018/11/07/grpc-load-balancing-on-kubernetes-without-tears/)
- [HAProxy Documentation - mode (tcp / http)](https://docs.haproxy.org/2.8/configuration.html#4.2-mode)
- [AWS - Elastic Load Balancing(NLB vs ALB)](https://aws.amazon.com/elasticloadbalancing/features/)
- [관련 글: gRPC가 .NET에서만 안 됐다 (1편)](/posts/kubernetes-grpc-dotnet-http2-tls-troubleshooting/) · [HTTP/2는 TLS가 아니다 (2편)](/posts/kubernetes-grpc-http2-vs-h2c-tls/)
</content>
