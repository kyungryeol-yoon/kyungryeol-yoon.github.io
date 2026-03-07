---
title: "[Kubernetes] eBPF + Cilium로 클러스터 심층 모니터링"
date: 2025-07-02
categories: [Kubernetes, eBPF]
tags: [kubernetes, ebpf, cilium, observability, networking, devops]
---

## 🔍 eBPF + Cilium: 개발자 관점에서 보는 심층 모니터링

쿠버네티스에서 **애플리케이션 + 클러스터 호스트 수준** Observability를 확보하려면  
OTel과 eBPF를 활용하는 것이 효과적입니다.  
특히 eBPF 기반 네트워크 모니터링 도구인 **Cilium**을 활용하면 실전 환경에서 강력한 가시성을 제공합니다.

---

## 1️⃣ eBPF란?

- **eBPF = extended Berkeley Packet Filter**  
- 리눅스 커널 내부에서 안전하게 코드 실행 가능  
- 주요 활용:
  - 커널 이벤트 트레이싱
  - 네트워크 패킷 분석
  - 성능 분석
  - 보안 이벤트 감지
- 요약: **커널 레벨에서 실시간 데이터를 수집하고 분석하는 기술**

---

## 2️⃣ Cilium이란?

- **Cilium**은 eBPF 기반 **Kubernetes 네트워크 및 보안** 솔루션
- 기능:
  - Pod-to-Pod, Pod-to-Service 트래픽 관찰
  - 네트워크 정책(enforcement) 적용
  - L7 로깅, 트레이싱
  - eBPF를 활용한 고성능 패킷 필터링과 모니터링
- 개발자 관점 핵심:
  - **네트워크 수준 Observability**와 **보안**을 동시에 제공
  - OTel과 함께 사용하면 **애플리케이션 + 네트워크 + 커널 이벤트 통합** 가능

---

## 3️⃣ OTel과 eBPF (Cilium) 통합 아키텍처

```

Application / Container → OTel SDK → OTel Collector → Backend (Loki/Prometheus/Tempo)
Host Kernel → eBPF Agent (Cilium) → OTel Collector → Backend

```

- OTel Collector가 애플리케이션 로그/트레이스와 eBPF 이벤트 모두 수집
- Loki, Prometheus, Tempo 등 백엔드로 통합 전송
- 시각화/알람/분석을 한 곳에서 관리 가능

---

## 4️⃣ 개발자 관점 통합 전략

1. **Cilium 설치**
   - DaemonSet 형태로 클러스터 전체 배포
   - eBPF로 Pod-to-Pod 트래픽 관찰, L7 로깅 가능
2. **OTel Collector 연계**
   - Collector OTLP Receiver로 Cilium에서 수집한 이벤트 전송
3. **백엔드 설정**
   - Loki → 로그/이벤트 시각화
   - Prometheus → 메트릭 수집
   - Tempo/Jaeger → 트레이스 시각화
4. **운영 체크**
   - Liveness/Readiness Probe
   - eBPF 오버헤드 모니터링
   - Cilium Hubble UI/CLI 확인

---

## 5️⃣ 실전 예시 (DaemonSet + Collector 연계)

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

* Cilium(eBPF Agent) → OTLP로 Collector 전송
* Collector에서 앱 로그와 함께 백엔드 전송

---

## 6️⃣ 개발자 관점 팁

* **데이터 수집 레이어 명확화**: 앱 로그 vs 네트워크/커널 이벤트
* **오버헤드 주의**: eBPF 스크립트 과도하게 사용 시 CPU 증가
* **보안**: eBPF Agent(Cilium)는 Host 권한 필요 → RBAC 최소화
* **통합 시각화**: Loki/Prometheus/Tempo에서 모든 이벤트 연계 확인
* **Hubble 활용**: Cilium의 시각화/CLI 도구로 네트워크 트래픽 추적

---

## 7️⃣ 요약

| 항목     | 내용                                                               |
| ------ | ---------------------------------------------------------------- |
| 목적     | 앱 + 네트워크 + 호스트 통합 Observability                                  |
| 핵심 기술  | OTel Collector, eBPF Agent (Cilium)                              |
| 배포     | OTel Collector (Deployment/DaemonSet), Cilium (DaemonSet)        |
| 장점     | 전체 클러스터 가시성, 실시간 모니터링, 트레이스/로그/메트릭 통합, 네트워크 보안 관측                |
| 운영 포인트 | Liveness/Readiness, eBPF 오버헤드 관리, RBAC 최소화, 백엔드 연결 확인, Hubble 활용 |

💡 **한 줄 기억:**

> **OTel + Cilium = “앱·네트워크·커널 통합 Observability + 보안까지 확보하는 실전 도구”**
