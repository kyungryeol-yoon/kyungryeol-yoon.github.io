---
title: "[Kubernetes] Control-Plane Node에 Pod 띄우기"
date: 2019-07-05
categories: [Kubernetes, Node]
tags: [Kubernetes, Control-Plane, Node, Pod]
---

## Control-Plane Node에 Pod를 올릴 경우

### deployment yaml 생성

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

### Apply

```bash
kubectl apply -f nginx-deployment.yaml

deployment.apps/nginx-deployment created
```

### Pod 상태 확인 (Pending 상태로 지속 됨)

```bash
kubectl get pods

NAME                               READY   STATUS    RESTARTS   AGE
nginx-deployment-6dd86d77d-4rkhf   0/1     Pending   0          20m
```

### Pod 상태 자세히 확인

```bash
kubectl describe pod nginx-deployment-6dd86d77d-4rkhf

Name:               nginx-deployment-6dd86d77d-4rkhf
Namespace:          default

... 생략 ...

Events:
  Type     Reason            Age                 From               Message                                                                    
  ----     ------            ----                ----               -------                                                                    
  Warning  FailedScheduling  43s (x17 over 22m)  default-scheduler  0/3 nodes are available: 3 node(s) had taints that the pod didn't tolerate.
```

## 위처럼 Pending 상태로 안올라오는 이유는 Contrl-Plane Node에 Pod를 못 올리도록 설정되어 있기 때문

### Contrl-Plane Node 확인 (아래 master는 Contrl-Plane Node Name)

```bash
kubectl describe node master | grep Taints

Taints:             node-role.kubernetes.io/master:NoSchedule
```

## Pod를 올리고 싶을 경우

### Taint 설정 해제

```bash
kubectl taint nodes –all node-role.kubernetes.io/master-

node/master untainted
Pod 상태 재조회 (자동으로 restart)
kubectl get pods -o wide

NAME                               READY   STATUS    RESTARTS   AGE   IP           NODE     NOMINATED NODE   READINESS GATES
nginx-deployment-6dd86d77d-4rkhf   1/1     Running   0          35m   10.244.0.7   master   <none>           <none>
```

## 다시 Pod를 못 올리도록 설정하고 싶은 경우

### Taint 설정

```bash
kubectl taint nodes master node-role.kubernetes.io=master:NoSchedule

node/master tainted
```

### 확인

```bash
kubectl describe node master | grep Taints

Taints:             node-role.kubernetes.io=master:NoSchedule
```