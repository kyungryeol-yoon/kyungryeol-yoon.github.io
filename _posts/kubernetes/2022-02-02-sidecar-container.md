---
title: "[Kubernetes] 사이드카 컨테이너(Sidecar Container) 이해"
date: 2022-02-02
categories: [Kubernetes, Sidecar]
tags: [kubernetes, container, sidecar, pod, microservices, logging, proxy]
---

# 🚀 사이드카 컨테이너(Sidecar Container)란?

**사이드카 컨테이너**는 주 컨테이너(main container)와 함께 **동일 Pod에서 실행되는 보조 컨테이너**입니다.  

주 목적은:

- 주 컨테이너의 기능을 **보완하거나 확장**
- 인프라 기능을 **독립적으로 관리**
- 주 컨테이너 코드를 수정하지 않고 **추가 기능 제공**

---

## 1️⃣ 특징

- **독립적 실행**: 주 컨테이너와 별개로 실행되지만 Pod 단위로 배포  
- **보조 역할**: 로깅, 모니터링, 프록시, 보안, 설정 관리 등  
- **재사용 가능**: 동일한 사이드카 컨테이너를 여러 Pod에서 활용 가능  
- **주 컨테이너와 통신**: 로컬 네트워크, 공유 볼륨, 환경 변수 등을 통해 통신  

---

## 2️⃣ 대표 사용 사례

| 역할 | 설명 |
|------|------|
| **로깅** | Fluentd/Logstash 같은 로그 수집 에이전트 |
| **모니터링/메트릭** | Prometheus exporter, 데이터 수집 |
| **프록시/서비스 메시** | Envoy, Istio Sidecar Proxy |
| **보안/인증** | TLS 인증서 갱신, Vault agent |
| **캐싱/프록시** | Redis/Memcached 프록시로 요청 처리 |

---

## 3️⃣ 아키텍처 예시

```

Pod
├─ Main Container (애플리케이션)
├─ Sidecar Container (로깅/프록시)
└─ 공유 볼륨

```

- Main Container: 비즈니스 로직  
- Sidecar Container: 보조 기능  
- Shared Volume: 로그, 설정, 캐시 데이터 공유  

> 💡 주 컨테이너 코드를 건드리지 않고 기능을 확장할 수 있는 구조

---

## 4️⃣ Kubernetes에서의 사이드카

- Pod 단위로 배포  
- Deployment/StatefulSet 안에서 Main Container와 동일 Pod에 정의  
- Sidecar는 주 컨테이너 시작 전후 관계 설정 가능 (`initContainer`와 구분)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app-pod
spec:
  containers:
    - name: app
      image: my-app:latest
    - name: log-agent
      image: fluentd:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
  volumes:
    - name: shared-logs
      emptyDir: {}
```

---

## 5️⃣ 장점

* 주 컨테이너를 **단순하게 유지**
* **기능 확장**과 **유지보수 분리**
* **재사용 가능** → 여러 서비스에 공통 기능 적용 가능

---

## 6️⃣ 요약

* 사이드카 컨테이너 = **주 컨테이너 보조 컨테이너**
* 로그 수집, 프록시, 모니터링 등 부가 기능 수행
* Pod 단위로 배포되고 공유 볼륨/네트워크로 주 컨테이너와 상호작용
* 주 컨테이너 코드를 변경하지 않고 기능 확장 가능

> 💡 결론: 사이드카 패턴은 **마이크로서비스 환경에서 확장성과 재사용성을 높이는 핵심 패턴**입니다.
