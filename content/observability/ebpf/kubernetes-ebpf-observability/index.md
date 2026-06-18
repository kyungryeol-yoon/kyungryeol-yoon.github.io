---
title: "[Kubernetes] eBPF로 쿠버네티스 모니터링 — 개념부터 Cilium·OTel 실전까지"
date: 2025-07-02
tags: [kubernetes, ebpf, cilium, hubble, observability, monitoring, networking, tracing]
description: "eBPF로 커널 레벨 실시간 모니터링을 하는 원리와 도구 생태계(Cilium·Hubble·Tetragon·Pixie·bpftrace), 그리고 Cilium과 OpenTelemetry를 연계해 쿠버네티스 클러스터를 심층 관측하는 실전 구성을 한 글에 정리합니다."
---

eBPF는 리눅스 **커널 안에서 안전하게 코드를 실행**해 시스템 이벤트를 거의 실시간으로 수집하는 기술입니다. 이 글에서는 eBPF의 개념과 특징, 주요 도구 생태계를 정리하고, eBPF 기반 네트워크·보안 솔루션인 **Cilium**과 **OpenTelemetry(OTel)** 를 연계해 쿠버네티스 클러스터를 심층 모니터링하는 실전 구성까지 다룹니다.

## 🔍 eBPF란?

- **eBPF = extended Berkeley Packet Filter**
- 리눅스 커널 내부에서 **안전하게 코드를 실행**할 수 있는 기술
- 원래 패킷 필터링 용도였지만, 지금은 다음에 두루 쓰입니다.
  - 커널/시스템 이벤트 트레이싱
  - 네트워크 패킷 분석
  - 성능 분석
  - 보안 이벤트 감지

즉 **커널 레벨에서 실시간 데이터를 수집·분석하는 엔진**입니다.

### 개발자 관점 특징

1. **커널 레벨 후킹** — Tracepoints·kprobes·uprobes로 커널 이벤트·함수 호출 추적
2. **실시간 분석** — syscall·네트워크 패킷·컨테이너 활동을 거의 지연 없이 감지
3. **낮은 오버헤드** — 커널 내부에서 직접 실행되어 고성능
4. **무계측(zero-instrumentation)** — 앱 코드를 고치지 않고도 관측 데이터 수집

---

## 🧰 eBPF 도구 생태계

| 도구 | 분야 | 설명 |
|---|---|---|
| **Cilium / Hubble** | 네트워크 | K8s 네트워크 정책 + Pod 트래픽·DNS·허용/거부 가시성 |
| **Tetragon** | 보안 | eBPF 기반 런타임 보안 관측 + 실시간 정책 강제 |
| **Falco** | 보안 | syscall 기반 실시간 위협 탐지 |
| **Pixie** | 앱 관측 | 무계측으로 HTTP 트레이스·서비스 맵 자동 수집 |
| **bpftrace / bcc** | 임시 분석 | syscall 트레이싱·지연 분석용 스크립트 도구 |

간단한 커널 이벤트 추적은 `bcc` 도구로 바로 해볼 수 있습니다.

```bash
# bcc 설치 (Ubuntu)
sudo apt install bpfcc-tools linux-headers-$(uname -r)

# 새로 실행되는 프로세스 추적
sudo execsnoop
```

> 💡 쿠버네티스에서는 eBPF 에이전트를 **DaemonSet** 형태로 모든 노드에 배포합니다(Cilium, Pixie 등).

---

## 🕸️ Cilium이란?

**Cilium**은 eBPF 기반의 쿠버네티스 **네트워크·보안·관측** 솔루션입니다.

- Pod-to-Pod, Pod-to-Service 트래픽 관찰
- 네트워크 정책(enforcement) 적용
- L7 로깅·트레이싱
- eBPF 기반 고성능 패킷 필터링·모니터링

부가 도구 **Hubble**은 Cilium 위에서 동작하는 분산 네트워크 관측 플랫폼으로, 서비스 간 통신·DNS 질의·TCP reset·허용/거부 결정을 투명하게 보여줍니다(UI/CLI 제공). 즉 **네트워크 수준 Observability와 보안**을 동시에 제공하며, OTel과 결합하면 **애플리케이션 + 네트워크 + 커널 이벤트 통합**이 가능합니다.

---

## 🔀 OTel + eBPF 통합 아키텍처

```text
Application / Container → OTel SDK → OTel Collector → Backend (Loki/Prometheus/Tempo)
Host Kernel            → eBPF Agent (Cilium) → OTel Collector → Backend
```

- OTel Collector가 애플리케이션 로그/트레이스와 eBPF 이벤트를 함께 수집
- Loki(로그)·Prometheus(메트릭)·Tempo/Jaeger(트레이스) 백엔드로 통합 전송
- 시각화·알람·분석을 한곳에서 관리

---

## 🚀 실전: Cilium DaemonSet + Collector 연계

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: cilium
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: cilium
  template:
    metadata:
      labels:
        k8s-app: cilium
    spec:
      serviceAccountName: cilium
      containers:
        - name: cilium
          image: cilium/cilium:v1.16
          securityContext:
            privileged: true
          env:
            - name: OTEL_COLLECTOR_ENDPOINT
              value: "http://otel-collector.observability.svc.cluster.local:4317"
```

- Cilium(eBPF Agent)이 수집한 이벤트를 OTLP로 Collector에 전송
- Collector가 앱 로그·트레이스와 함께 백엔드로 전달

---

## 🛠️ 운영 팁

- **데이터 레이어 구분**: 앱 로그(애플리케이션) vs 네트워크/커널 이벤트(eBPF)를 명확히 나눠 설계
- **오버헤드 주의**: eBPF 후킹을 과도하게 걸면 CPU/메모리 부담 → 필요한 이벤트만
- **보안/권한**: eBPF 에이전트(Cilium)는 Host 권한(privileged)이 필요 → RBAC 최소화
- **Hubble 활용**: Cilium의 Hubble UI/CLI로 네트워크 트래픽·정책 결정 추적
- **헬스 체크**: Liveness/Readiness Probe와 백엔드 연결 상태 확인

---

## 🤔 언제 무엇을 쓰나

- **네트워크 가시성·정책** → Cilium + Hubble
- **런타임 보안·위협 탐지** → Tetragon, Falco
- **앱 레벨 무계측 트레이싱** → Pixie
- **일회성 커널/성능 분석** → bpftrace, bcc

---

## ❓ 자주 묻는 질문

**Q. eBPF만으로 모니터링이 끝나나요?**
eBPF는 **수집·분석 엔진**입니다. OTel 같은 Observability 플랫폼과 결합해야 통합 시각화·알람까지 완성됩니다.

**Q. Cilium과 OTel은 무슨 관계인가요?**
Cilium(eBPF)은 네트워크·커널 이벤트를 수집하고, OTel Collector가 그 이벤트를 앱 로그·트레이스와 함께 백엔드로 보냅니다. 보완 관계입니다.

**Q. eBPF가 성능에 영향을 주나요?**
커널 내부 실행이라 오버헤드가 낮지만, 후킹이 과도하면 CPU가 늘 수 있어 필요한 이벤트만 거는 것이 좋습니다.

---

## 📚 참고

- [eBPF Applications Landscape — ebpf.io](https://ebpf.io/applications/)
- [Cilium — eBPF 기반 네트워킹·보안·관측](https://cilium.io/)
- [Hubble — Cilium 네트워크 관측](https://github.com/cilium/hubble)
- [Tetragon — eBPF 기반 보안 관측·런타임 강제](https://tetragon.io/)
- [How to Use eBPF for Kubernetes Observability — OneUptime](https://oneuptime.com/blog/post/2026-02-20-ebpf-kubernetes-observability/view)
