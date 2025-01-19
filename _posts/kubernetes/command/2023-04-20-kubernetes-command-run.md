---
# layout: post
title: "[Kubernetes] kubectl run command"
date: 2023-04-20
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, run]
# comments: true
---

## 기본 구조

```bash
kubectl run [파드 이름] --image=[이미지 이름]

# 명령어를 실행하여 nginx 이미지를 실행하는 nginx 파드를 생성할 수 있다.
kubectl run nginx --image=nginx
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- `--image`: 실행할 이미지 이름을 지정
    ```bash
    # nginx 이미지를 사용하여 파드를 생성
    kubectl run nginx --image=nginx
    ```

- `--replicas`: 생성할 파드나 작업의 개수를 지정
    ```bash
    # nginx 이미지를 사용하여 파드를 3개 생성
    kubectl run nginx --image=nginx --replicas=3
    ```

- `--port`: 파드나 작업에서 노출할 포트 번호를 지정
    ```bash
    # nginx 이미지를 사용하여 파드를 생성하고, 80번 포트를 노출
    kubectl run nginx --image=nginx --port=80
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }