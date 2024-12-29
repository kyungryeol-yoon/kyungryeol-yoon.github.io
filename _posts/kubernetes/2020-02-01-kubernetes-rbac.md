---
# layout: post
title: "[Kubernetes] RBAC"
date: 2020-02-01
categories: [Kubernetes, RBAC]
tags: [Kubernetes, kubectl, RBAC]
# comments: true
---

- RBAC (Role-based Access Control)는 쿠버네티스 환경에서 Node 또는 네트워크 리소스 등 여러가지 접근 권한에 대한 Role 관리하는 작업 요소 이다.
- RBAC는 rbac.authorization.k8s.io API를 사용하며, K8s 1.8 이상부터 RBAC Mode가 Stable 한다.
- 또한, RBAC 활성화를 위한 --authorization-mode=RBAC 설정이 필요하다.

## Role & ClusterRle

- Role : Default 라는 Namespace에 모든 Pod의 읽기권한(get, watch, list)을 설정하고 pod-read 라고 정의한다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadate:
  namespaces: default
  name: pod-read
rules:
 - apiGroups: [""] // "" 는 Core API Group 을 나타냄.
   resources: ["pods"]
   verbs: ["get", "watch", "list"]
```

- ClusterRole : Cluster 의 Secret 정보에 대한 읽기 권한을 설정하고 secret-read 라고 정의함. (Node, Endpoint, Namespace, Service 등 모든 권한 설정)

- ClusterRole은 namespace 영역이 아니기 때문에 생략된다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-read
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "watch", "list"]
```

- Sample (admin-manager.yaml)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ServiceAccount
metadata:
  name: admin-manager
  namespace: kube-system
```

## RoleBinding & ClusterRoleBinding

- RoleBinding 은 User, Team 단위의 권한 부여 기능이며, ClusterRoleBinding은 클러스터 단위의 권한 부여 기능을 나타낸다.

- RoleBinding : Reference 라는 User 에게 Pod-read 권한 설정. 즉, Reference 라는 User는 Namespace가 Default인 모든 Pod을 읽기가 가능하다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: reference
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role // Role & ClusterRole 적용.
  name: pod-reader // 바인딩할 Role & ClusterRole 이름과 일치해야 함.
  apiGroup: rbac.authorization.k8s.io
```

- ClusterRoleBinding : ManagerGroup 에게 Secret-Read 권한 설정. 즉, Manager-Group 의 모든 사용자가 모든 Namespace에서  Secret 을 읽을 수 있다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
- kind: Group
  name: manager-group
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole // Role & ClusterRole 적용
  name: secret-read // 바인딩할 Role & ClusterRole 이름과 일치해야 함.
  apiGroup: rbac.authorization.k8s.io
```

- Sample (admin-rolebinding.yaml)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-manager
subjects:
- kind: ServiceAccount
  name: admin-manager
  namespcae: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
```

## K8s API 호출 권한

- K8s api 호출시 RBAC role 에 의한 접근 불가 오류 메세지 출력되면 K8s api 호출 error example - kryoon에서 pod에 대한 정보를 요청할 때 RBAC role에 막혔다

```bash
GET /api/v1/namespaces/{namespace}/pods/{name}/log

WARNING: Failed to count the # of live instances on Kubernetes
io.fabric8.kubernetes.client.KubernetesClientException: Failure executing: GET
at: https://kubernetes.default/api/v1/namespaces/kryoon/pods.
Message: Forbidden!Configured service account doesn't have access.
Service account may have been revoked. pods is forbidden:
User "system:serviceaccount:kryoon:default" cannot list pods in the namespace "kryoon":
Unknown user "system:serviceaccount:kryoon:default".
```

- 아래와 같이 pod(resource), log(subresource of pods)에 대한 권한을 추가해야 한다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-and-pod-logs-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list"]
```
