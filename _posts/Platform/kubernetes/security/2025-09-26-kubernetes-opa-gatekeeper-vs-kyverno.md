---
title: "[Kubernetes] 🛡️ OPA Gatekeeper vs Kyverno: 쿠버네티스 정책 관리 완전 가이드"
date: 2025-09-26
categories: [Kubernetes, Security]
tags: [kubernetes, opa, gatekeeper, kyverno, policy, admission-controller, security, rego]
pin: false
---

쿠버네티스 클러스터를 운영하다 보면 "모든 Pod에 리소스 제한을 설정해야 한다", "승인된 레지스트리의 이미지만 사용해야 한다"처럼 조직 차원의 정책을 강제해야 하는 상황이 생깁니다.
이를 코드 리뷰에만 의존하면 누락이 발생하기 쉽습니다.
**OPA Gatekeeper**와 **Kyverno**는 이런 정책을 클러스터 레벨에서 자동으로 강제하는 대표적인 도구입니다.

---

## 🔑 Kubernetes 정책 관리란?

쿠버네티스는 리소스 생성·수정·삭제 요청이 API 서버에 도달했을 때 이를 검사하는 **Admission Controller** 플러그인을 제공합니다.

```text
kubectl apply
    ↓
API Server
    ↓
Authentication → Authorization → Admission Control → etcd 저장
                                       ↑
                            Mutating / Validating Webhook
                          (Gatekeeper / Kyverno 가 여기서 동작)
```

두 도구 모두 Webhook 형태로 동작하며 요청을 가로채 정책 준수 여부를 검사합니다.

> **Tip**: 쿠버네티스 1.25에서 Pod Security Policy(PSP)가 제거된 이후 OPA Gatekeeper와 Kyverno가 PSP의 실질적인 대안으로 자리잡았습니다.

---

## 🔵 OPA Gatekeeper

### 개념 및 아키텍처

**OPA(Open Policy Agent)** 는 CNCF에서 관리하는 범용 정책 엔진입니다.
**Gatekeeper**는 OPA를 쿠버네티스 Admission Webhook과 연결하는 브리지 역할을 합니다.

```text
API Server
    │ AdmissionReview 요청
    ▼
Gatekeeper Webhook
    │ Rego 정책 평가
    ▼
OPA (정책 평가 엔진)
    │ allow / deny 반환
    ▼
API Server (요청 허용 or 거부)
```

Gatekeeper v3.0부터는 **OPA Constraint Framework**를 기반으로 CRD(Custom Resource Definition)를 통해 정책을 선언적으로 관리합니다.

### ConstraintTemplate — 정책 템플릿 정의

`ConstraintTemplate`은 정책의 로직(Rego)과 파라미터 스키마를 정의하는 청사진입니다.
한 번 정의하면 여러 클러스터, 여러 네임스페이스에 재사용할 수 있습니다.

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels

        deny[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("필수 레이블이 누락되었습니다: %v", [missing])
        }
```

### Constraint — 정책 인스턴스 생성

`ConstraintTemplate`으로 만들어진 CRD를 인스턴스화하여 실제 정책을 적용합니다.
`match` 필드로 적용 대상을 세밀하게 지정할 수 있습니다.

```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: ns-must-have-owner
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Namespace"]
  parameters:
    labels: ["owner", "env"]
```

위 정책 적용 후 `owner`, `env` 레이블 없이 네임스페이스를 생성하면 아래처럼 거부됩니다.

```text
Error from server ([ns-must-have-owner] 필수 레이블이 누락되었습니다: {"env", "owner"})
```

### 설치

```bash
# Helm으로 설치
helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts
helm install gatekeeper/gatekeeper \
  --name-template=gatekeeper \
  --namespace gatekeeper-system \
  --create-namespace
```

```bash
# 또는 manifest로 설치
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml
```

설치 후 `gatekeeper-system` 네임스페이스에 컨트롤러 파드가 생성됩니다.

```bash
kubectl get pods -n gatekeeper-system
# NAME                                             READY   STATUS
# gatekeeper-audit-xxxxxxxxx                       1/1     Running
# gatekeeper-controller-manager-xxxxxxxxx          1/1     Running
```

### Audit 기능

Gatekeeper는 **Audit** 기능을 통해 이미 배포된 리소스도 정책 위반 여부를 감사합니다.
정책 적용 시점 이전에 생성된 리소스까지 소급 검사할 수 있습니다.

```bash
# 정책 위반 리소스 확인
kubectl get k8srequiredlabels ns-must-have-owner -o yaml
# status.violations 필드에 위반 리소스 목록이 표시됩니다
```

또한 클러스터 내 리소스를 Gatekeeper에 복제하여 정책 간 데이터 참조가 가능합니다.

```yaml
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  sync:
    syncOnly:
      - group: ""
        version: "v1"
        kind: "Namespace"
```

---

## 🟢 Kyverno

### 개념 및 아키텍처

Kyverno는 **Kubernetes Native** 정책 엔진입니다.
정책을 Rego 같은 별도 언어 없이 순수 YAML(CR)로 표현할 수 있어 학습 곡선이 낮습니다.

```text
API Server
    │ AdmissionReview 요청
    ▼
Kyverno Webhook
    │ ClusterPolicy / Policy 평가
    ├── Mutate  → 리소스 자동 수정 후 허용
    ├── Validate → 검증 실패 시 거부
    └── Generate → 새 리소스 자동 생성
```

Kyverno는 4개의 컨트롤러로 구성됩니다.

| 컨트롤러 | 역할 |
|----------|------|
| Webhook | AdmissionReview 요청 처리 |
| Monitor | 필수 설정(웹훅 등) 유지 관리 |
| PolicyController | 정책 CR 변경 감시 |
| GenerateController | Generate 정책으로 생성된 리소스 관리 |

### 설치

```bash
# Helm으로 설치 (권장)
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno \
  -n kyverno \
  --create-namespace
```

```bash
# 또는 manifest로 설치
kubectl create -f https://raw.githubusercontent.com/kyverno/kyverno/main/config/install.yaml
```

> ⚠️ Kyverno는 Kubernetes 1.14 이상이 필요합니다. 고가용성 환경에서는 `replicaCount=3`으로 설정을 권장합니다.

### 정책 유형

Kyverno 정책은 `ClusterPolicy`(클러스터 전체) 또는 `Policy`(네임스페이스 범위) 두 가지 스코프로 생성합니다.

| 유형 | 설명 | 실행 시점 |
|------|------|----------|
| **Validate** | 리소스가 정책을 준수하는지 검증 | 생성·수정 시 |
| **Mutate** | 리소스를 자동으로 수정 | 생성·수정 시 (Validate 전) |
| **Generate** | 새로운 리소스를 자동 생성 | 트리거 리소스 생성 시 |
| **Cleanup** | 불필요한 리소스를 자동 삭제 | 주기적 실행 |

### Validate 예제: 필수 레이블 강제

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-app-label
spec:
  validationFailureAction: Enforce   # Audit으로 변경하면 감사 모드
  rules:
    - name: check-app-label
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "레이블 'app.kubernetes.io/name' 이 필요합니다."
        pattern:
          metadata:
            labels:
              app.kubernetes.io/name: "?*"
```

정책 위반 시 아래 메시지와 함께 거부됩니다.

```text
Error from server: admission webhook "validate.kyverno.svc-fail" denied the request:
resource Pod was blocked due to the following policies: require-app-label
```

### Mutate 예제: 리소스 제한 자동 주입

레이블이나 리소스 제한이 없는 Pod에 기본값을 자동으로 삽입합니다.

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-resources
spec:
  rules:
    - name: add-resource-limits
      match:
        any:
          - resources:
              kinds:
                - Pod
      mutate:
        patchStrategicMerge:
          spec:
            containers:
              - (name): "*"
                resources:
                  limits:
                    +(memory): "256Mi"
                    +(cpu): "500m"
```

> **Tip**: `+()` 표기는 해당 필드가 없을 때만 값을 추가합니다. 기존 설정을 덮어쓰지 않습니다.

### Generate 예제: 네임스페이스 생성 시 NetworkPolicy 자동 생성

새 네임스페이스가 생성될 때 기본 NetworkPolicy를 자동으로 생성합니다.

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: default-network-policy
spec:
  rules:
    - name: default-deny-ingress
      match:
        any:
          - resources:
              kinds:
                - Namespace
      generate:
        apiVersion: networking.k8s.io/v1
        kind: NetworkPolicy
        name: default-deny-ingress
        namespace: "{{request.object.metadata.name}}"
        synchronize: true
        data:
          spec:
            podSelector: {}
            policyTypes:
              - Ingress
```

---

## ⚖️ OPA Gatekeeper vs Kyverno 비교

| 항목 | OPA Gatekeeper | Kyverno |
|------|---------------|---------|
| **정책 언어** | Rego (전용 DSL) | YAML (Kubernetes 네이티브) |
| **학습 곡선** | 높음 (Rego 학습 필요) | 낮음 |
| **적용 범위** | 멀티 플랫폼 (쿠버네티스 외 지원) | 쿠버네티스 전용 |
| **정책 유형** | Validate, Audit | Validate, Mutate, Generate, Cleanup |
| **Mutate 지원** | 제한적 | 강력한 기본 지원 |
| **Generate 지원** | ✗ | ✅ |
| **Audit** | ✅ (내장) | ✅ (내장) |
| **CLI 도구** | OPA CLI | Kyverno CLI |
| **CNCF 등급** | Graduated | Incubating |
| **커뮤니티 성숙도** | 높음 | 빠르게 성장 중 |

---

## 🎯 어떤 것을 선택할까?

**OPA Gatekeeper를 선택해야 할 때:**

- 쿠버네티스 외 다른 시스템(Terraform, API 서버 등)에도 동일한 정책 엔진을 사용하고 싶은 경우
- 정책 로직이 복잡하여 Rego의 표현력이 필요한 경우
- 이미 OPA 생태계를 사용 중인 경우

**Kyverno를 선택해야 할 때:**

- 쿠버네티스 전용 정책 관리가 목적인 경우
- Rego 학습 없이 빠르게 도입하고 싶은 경우
- Mutate, Generate 등 다양한 정책 유형이 필요한 경우
- GitOps 환경에서 YAML 기반으로 정책을 관리하고 싶은 경우

> **Tip**: 두 도구를 함께 사용하는 것도 가능합니다. 예를 들어 복잡한 검증 정책은 OPA Gatekeeper로, 리소스 자동 변형·생성은 Kyverno로 역할을 분담할 수 있습니다.