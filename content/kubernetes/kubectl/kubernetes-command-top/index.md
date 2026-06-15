---
title: "[Kubernetes] kubectl top command"
date: 2022-07-09
tags: [kubernetes, kubectl, command, top]
description: "kubectl top 명령어로 노드·파드의 CPU·메모리 사용량을 조회하는 방법. --containers, --namespace 옵션과 metrics-server 사용 예제를 정리합니다."
---

## 기본 구조

```bash
kubectl top [리소스 종류] [리소스 이름]

# Cluster 내 모든 Pod의 리소스 사용량을 확인
kubectl top pods

# Cluster 내 모든 Node의 리소스 사용량을 확인
kubectl top nodes
```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

### Option

- `--containers`: Container 단위의 리소스 사용량을 확인
    ```bash
    # 모든 파드의 Container 단위의 리소스 사용량을 확인
    kubectl top pods --containers
    ```

- `--kryoon-namespace`: kryoon의 Namespace를 지정
    ```bash
    # kryoon가 설치된 kube-system Namespace에 대한 Pod의 리소스 사용량을 확인
    kubectl top pods --kryoon-namespace=kube-system
    ```

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)