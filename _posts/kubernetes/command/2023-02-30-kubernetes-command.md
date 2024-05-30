---
# layout: post
title: "Kubernetes command"
date: 2023-02-30
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command]
# comments: true
pin: true
---

### Context 변경
```
kubectl config use-context [context-name]
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Namespace 변경
```
kubectl config set-context --current --namespace=[NAMESPACE]
```

### 기본 출력을 위한 Get 커맨드
```
kubectl get services                          # 네임스페이스 내 모든 서비스의 목록 조회
kubectl get pods --all-namespaces             # 모든 네임스페이스 내 모든 파드의 목록 조회
kubectl get pods -o wide                      # 네임스페이스 내 모든 파드의 상세 목록 조회
kubectl get deployment my-dep                 # 특정 디플로이먼트의 목록 조회
kubectl get pods                              # 네임스페이스 내 모든 파드의 목록 조회

```


## Pod Command
### pod 실행 명령어
```
kubectl exec -it -n [NAMESPACE] [POD NAME] -- bash
```

### Pod 강제 종료
```
kubectl delete pod [POD NAME] --grace-period=0 --force -n [NAMESPACE]
```

### Pod 상세 출력
```
kubectl describe pod [POD NAME]
```
### Pod Yaml
```
kubectl get pod [POD NAME] -o yaml
kubectl get pod [POD NAME] -o yaml --export   # 클러스터 명세 없이 파드의 YAML 조회
```





### 계정 만들기
```
kubectl create sa foo
```

### 계정 상세 출력
```
kubectl describe sa foo
```





### Kubernetes에 의해 발생한 모든 event 정보를 확인
```
kubectl get events -n kube-system
```

### Kubernetes에 join되어 있는 node들의 상태 정보를 확인
```
kubectl describe node master
```

### 모든 네임스페이스 내 모든 파드(또는 레이블을 지원하는 다른 쿠버네티스 오브젝트)의 레이블 조회
```
kubectl get pod --all-namespaces --show-labels
```



> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }