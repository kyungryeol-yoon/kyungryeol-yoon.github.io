---
# layout: post
title: "[Kubernetes] kubectl auth can-i command"
date: 2023-08-11
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, auth can-i]
# comments: true
---

## 기본 구조

```bash
kubectl auth can-i [액션] [리소스 종류] [--namespace namespace] [--subresource subresource] [--list]

# 현재 인증된 사용자가 파드를 가져올 수 있는지 여부를 확인할 수 있다.
kubectl auth can-i get pods
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespace`: 네임스페이스를 지정
    ```bash
    # my-namespace 네임스페이스 내 파드를 가져올 수 있는지 여부를 확인
    kubectl auth can-i get pods --namespace=my-namespace
    ```

- `--subresource`: 서브리소스를 지정
    ```bash
    # 이벤트의 watch 서브리소스를 가져올 수 있는지 여부를 확인
    kubectl auth can-i get events --subresource=watch
    ```

- `--list`: 리소스 목록을 출력
    ```bash
    # 현재 사용자가 모든 파드를 가져올 수 있는지 여부와 함께 파드 목록을 출력
    kubectl auth can-i list pods --list
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }