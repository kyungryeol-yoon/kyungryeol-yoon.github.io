---
title: "[DevOps] GitLab Kubernetes Runner: Service Account 권한 에러 해결"
date: 2024-12-01
description: "Kubernetes에 GitLab Runner를 설치했을 때 발생하는 Service Account 관련 권한 문제를 분석하고 해결하는 방법입니다."
categories: [DevOps, GitLab]
tags: [gitlab, kubernetes, runner, serviceaccount, rbac]
---

## 🔎 문제 상황

Helm 기반으로 GitLab Runner를 설치하면 다음 리소스가 생성됩니다.

- `Pod`, `Role`, `RoleBinding`, `ServiceAccount`
- Runner 서비스 어카운트(`sa`)가 namespace에 생성

예시: `gitlab-runner` 네임스페이스에 설치된 리소스

```

kubectl get pod,role,rolebinding,sa -n gitlab-runner

```

보면 `default`와 `gitlab-runner`라는 두 ServiceAccount가 생성됩니다.

---

### 🚨 실제 에러

CI 파이프라인에서 아래와 같이 kubectl 명령을 실행하면 다음과 같은 에러가 발생합니다.

```

Error from server (Forbidden): pods "nginx-test" is forbidden:
User "system:serviceaccount:gitlab-runner:default"
cannot get resource "pods" in API group "" in the namespace "gitlab-runner"

```

즉, **Runner가 잘 설치됐지만 잘못된 ServiceAccount를 사용**하여 권한이 없어 작업을 수행할 수 없는 상황입니다.

---

## ❓ 원인 분석

Kubernetes에서 GitLab Runner는 기본적으로 `default` ServiceAccount를 사용하는데, 
이 경우 Runner가 파이프라인에서 필요한 리소스(예: Pod, Secrets)에 대한 권한을 가지지 못합니다.

특히 다음과 같은 CI/CD 작업에서 `kubectl apply`나 리소스 조회를 할 때 이 문제가 발생합니다.

---

## ✅ 해결 방법

### 1) Runner Helm values 파일 설정

Helm 설치 시 `values.yaml`에서 다음 값을 반드시 override해야 합니다.

```yaml
gitlabUrl: "<GITLAB_URL>"
runnerToken: "<RUNNER_TOKEN>"
rbac:
  create: true
  rules:
    - resources: ["configmaps","events","pods","pods/attach","pods/exec","secrets","services"]
      verbs: ["get","list","watch","create","patch","update","delete"]
    - apiGroups: [""]
      resources: ["pods/exec"]
      verbs: ["create","patch","delete"]
    - apiGroups: [""]
      resources: ["pods/log"]
      verbs: ["get"]
```

위 설정으로 Runner가 처리할 리소스에 대한 RBAC 권한을 충분히 부여합니다.

---

### 2) ServiceAccount 지정

Runner가 사용할 **ServiceAccount 이름을 직접 지정**해야 합니다.

```yaml
runners:
  config: |
    [[runners]]
      [runners.kubernetes]
        namespace = "{{ .Release.Namespace }}"
        image = "alpine"
        privileged = true
        service_account = "<GITLAB_RUNNER_SA_NAME>"
```

이렇게 함으로써 Runner가 실제로 생성된 `ServiceAccount`를 명시적으로 사용하도록 설정합니다.

---

## 🧪 실행 예시

Helm으로 Runner를 설치할 때 아래처럼 실행합니다.

```bash
helm install --namespace gitlab-runner gitlab-runner \
  -f values.yaml \
  gitlab/gitlab-runner
```

설치 후 파이프라인을 다시 실행하면,
Runner가 올바른 `ServiceAccount`를 이용해 Kubernetes 리소스에 접근합니다.

---

## 📌 요약

* GitLab Runner를 Kubernetes에 설치하면 `default` ServiceAccount가 기본적으로 선택됩니다.
* 이 경우 필요한 권한이 없어 `kubectl` 명령이 실패할 수 있습니다.
* 해결 방법은:
  * RBAC rules로 리소스 권한을 명시적으로 추가
  * Runner가 사용할 ServiceAccount를 지정

이 설정이 적용되면 **CI 파이프라인에서 kubectl 작업이 정상적으로 실행**됩니다.
