---
title: "Kubernetes Control-Plane Node에 Pod 띄우기"
date: 2019-07-05
categories: [Kubernetes, Node]
tags: [Kubernetes, Control-Plane, Node, Pod]
---

#### Control-Plane Node에 Pod를 올릴경우 아래처럼 Pending 상태로 진행되지 않음 (테스트를 위해 Contrl-Plane Node만 Ready인 상태로 진행)

##### deployment yaml 생성
```nginx-deployment.yaml
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
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```

##### Apply
```
kubectl apply -f nginx-deployment.yaml

deployment.apps/nginx-deployment created
```

##### Pod 상태 확인 (Pending 상태로 지속 됨)
```
$ kubectl get pods

NAME                               READY   STATUS    RESTARTS   AGE
nginx-deployment-6dd86d77d-4rkhf   0/1     Pending   0          20m
```

##### Pod 상태 자세히 확인
```
$ kubectl describe pod nginx-deployment-6dd86d77d-4rkhf

Name:               nginx-deployment-6dd86d77d-4rkhf                                     
Namespace:          default                                                              

... 생략 ...

Events:                                                                                                                                        
  Type     Reason            Age                 From               Message                                                                    
  ----     ------            ----                ----               -------                                                                    
  Warning  FailedScheduling  43s (x17 over 22m)  default-scheduler  0/3 nodes are available: 3 node(s) had taints that the pod didn't tolerate.
```

#### 위처럼 Pending 상태로 안올라오는 이유는 Contrl-Plane Node에 Pod를 못 올리도록 설정되어 있기 때문

##### Contrl-Plane Node 확인 (아래 master는 Contrl-Plane Node Name)
```
$ kubectl describe node master | grep Taints

Taints:             node-role.kubernetes.io/master:NoSchedule
```

#### Pod를 올리고 싶을 경우

##### Taint 설정 해제
```
$ kubectl taint nodes –all node-role.kubernetes.io/master-

node/master untainted
Pod 상태 재조회 (자동으로 리스타트 됨)
$ kubectl get pods -o wide

NAME                               READY   STATUS    RESTARTS   AGE   IP           NODE     NOMINATED NODE   READINESS GATES
nginx-deployment-6dd86d77d-4rkhf   1/1     Running   0          35m   10.244.0.7   master   <none>           <none>
```

#### 다시 Pod를 못 올리도록 설정하고 싶은 경우

##### Taint 설정
```
$ kubectl taint nodes master node-role.kubernetes.io=master:NoSchedule

node/master tainted
```

##### 확인
```
$ kubectl describe node master | grep Taints

Taints:             node-role.kubernetes.io=master:NoSchedule
```