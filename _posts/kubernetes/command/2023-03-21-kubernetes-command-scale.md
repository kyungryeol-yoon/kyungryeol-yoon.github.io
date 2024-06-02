---
# layout: post
title: "[Kubernetes] kubectl scale command"
date: 2023-03-21
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, scale]
# comments: true
---

## 기본 구조
```
kubectl scale deployment [deployment name] --replicas=[수정할 replica 수]

# my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정
kubectl scale deployment my-deployment --replicas=3
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- --current-replicas: 현재 replica 수를 지정하며, 이 값을 지정하면 --replicas 옵션으로 지정한 값과 함께 replica 수를 변경한다.
```
# 현재 1개의 replica가 있는 my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정
kubectl scale deployment my-deployment --current-replicas=1 --replicas=3
```

- --resource-version: 리소스 버전을 지정
```
# my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정하면서, 리소스 버전을 4로 지정
kubectl scale deployment my-deployment --replicas=3 --resource-version=4
```

- -n, --namespace: 리소스가 위치한 namespace를 지정
```
# my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정하면서, my-namespace namespace에 위치한 리소스를 조정
kubectl scale deployment my-deployment --replicas=3 -n my-namespace 
```

- --timeout: replica 수를 조정할 때, 타임아웃을 설정
```
# my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정하면서, 타임아웃을 60초로 설정
kubectl scale deployment my-deployment --replicas=3 --timeout=60s
```

- --wait: replica 수를 조정한 후 변경이 완료될 때까지 대기
```
# my-deployment 이름을 가진 deployment의 replica 수를 3개로 조정하면서, 변경이 완료될 때까지 대기
kubectl scale deployment my-deployment --replicas=3 --wait
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }