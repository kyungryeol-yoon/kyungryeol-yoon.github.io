---
title: "[Kubernetes] Dashboard 설치"
date: 2024-11-21
categories: [Platform, Kubernetes, Tools]
tags: [kubernetes, dashboard]
---

## 📌 1. Kubernetes Dashboard란?

Kubernetes Dashboard는 클러스터 리소스를 **웹 UI로 시각화하고 관리할 수 있는 공식 웹 인터페이스**입니다.

주요 기능:

* Pod / Deployment / Service 조회
* 로그 확인
* 리소스 생성 및 삭제
* 네임스페이스 관리
* RBAC 기반 인증

---

## 📦 2. Dashboard 설치

공식 manifest를 이용해 설치합니다.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

### 🔎 생성되는 주요 리소스

* `Namespace`: kubernetes-dashboard
* `Deployment`: kubernetes-dashboard
* `Deployment`: dashboard-metrics-scraper
* `Service`
* `ServiceAccount`
* `Role / RoleBinding`

설치 확인:

```bash
kubectl get all -n kubernetes-dashboard
```

---

## 🌐 3. Dashboard 외부 접속 (NodePort 방식)

기본적으로 Service 타입은 `ClusterIP`이므로 외부에서 접근할 수 없습니다.

### 1️⃣ Service 타입 변경

```bash
kubectl edit svc kubernetes-dashboard -n kubernetes-dashboard
```

아래 부분을 수정합니다.

```yaml
spec:
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 31000
```

저장 후 확인:

```bash
kubectl get svc -n kubernetes-dashboard
```

예시 출력:

```
kubernetes-dashboard   NodePort   10.97.112.43   443:31000/TCP
```

---

### 2️⃣ 브라우저 접속

```
https://<NodeIP>:31000
```

⚠️ Self-signed 인증서이므로 브라우저에서 보안 경고가 발생할 수 있습니다.

---

## 🔐 4. 관리자 계정 및 토큰 생성

Dashboard는 기본적으로 **Token 인증 방식**을 사용합니다.

### 1️⃣ ServiceAccount 생성

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

```bash
kubectl apply -f admin-user.yaml
```

---

### 2️⃣ ClusterRoleBinding 생성

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
```

```bash
kubectl apply -f cluster-role-binding.yaml
```

---

### 3️⃣ 토큰 생성

```bash
kubectl -n kubernetes-dashboard create token admin-user
```

출력된 토큰을 복사하여 Dashboard 로그인 화면에 붙여넣습니다.

---

## ⚠️ 5. 자주 발생하는 이슈

### 🔸 1. NET::ERR_CERT_INVALID

* Self-signed 인증서로 인한 브라우저 경고
* 실서비스 환경에서는 Ingress + TLS 구성 권장

---

### 🔸 2. 권한 관련 에러

* `Forbidden` 오류 발생 시 RBAC 확인
* 실 운영 환경에서는 `cluster-admin` 대신 최소 권한 Role 사용 권장

---

## 🔐 보안 관점에서의 주의사항

운영 환경에서 반드시 고려해야 할 사항:

* ❌ NodePort 직접 오픈은 지양
* ✅ Ingress + 인증서(TLS) 적용
* ✅ OIDC / SSO 연동 고려
* ✅ 최소 권한 RBAC 구성

---

## 🧠 개발자 관점 정리

| 항목         | Dev 환경        | 운영 환경      |
| ---------- | ------------- | ---------- |
| Service 타입 | NodePort      | Ingress    |
| 인증         | Admin Token   | OIDC / SSO |
| 권한         | cluster-admin | 최소 권한      |
| 인증서        | Self-signed   | 공인 TLS     |

---

## 🏁 마무리

Kubernetes Dashboard는:

* 빠르게 클러스터를 시각적으로 확인할 수 있고
* 리소스 디버깅에 매우 유용하지만
* 보안 설정 없이 운영 환경에 노출하는 것은 위험합니다.

Dev/Test 환경에서는 빠른 실습용으로,
운영 환경에서는 보안 구성을 충분히 고려하여 사용하세요.

---
