---
# layout: post
title: "[Kubernetes] kubectl explain command"
date: 2023-08-07
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, explain]
# comments: true
---

## 기본 구조

```bash
kubectl explain [리소스 종류]

#  리소스의 필드와 값을 확인할 수 있다.
kubectl explain podPod
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--recursive`, `-r`: 모든 참조된 리소스의 필드와 값을 출력
    ```bash
    # Pod 리소스와 관련된 모든 참조된 리소스의 필드와 값을 출력
    kubectl explain pod --recursive
    ```

- `--api-version`: API 버전을 지정
    ```bash
    # v1 버전의 Pod 리소스의 필드와 값을 출력
    kubectl explain pod --api-version=v1
    ```

- `--show-defaults`: 기본값을 포함하여 출력
    ```bash
    # Pod 리소스의 필드와 값을 기본값과 함께 출력
    kubectl explain pod --show-defaults
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }