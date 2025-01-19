---
# layout: post
title: "[Kubernetes] kubectl attach command"
date: 2022-03-05
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, attach]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl attach [파드 이름] -c [컨테이너 이름]

# my-pod Pod의 my-container 컨테이너 내부의 터미널 세션에 접속할 수 있다.
kubectl attach my-pod -c my-container
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `-c`, `--container`: 컨테이너 이름을 지정
    ```bash
    # my-pod 파드의 my-container 컨테이너 내부의 터미널 세션에 접속
    kubectl attach my-pod -c my-container
    ```

- `--stdin`, `--tty`: 터미널 입력/출력을 가능하게 한다.
    ```bash
    # my-pod 파드의 my-container 컨테이너 내부의 터미널 세션에 접속하면서 터미널 입력/출력을 가능하게 한다.
    kubectl attach my-pod -c my-container --stdin --tty
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }