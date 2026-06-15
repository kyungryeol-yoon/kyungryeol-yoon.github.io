---
title: "[Kubernetes] kubectl attach command"
date: 2022-03-05
tags: [kubernetes, kubectl, command, attach]
description: "kubectl attach 명령어로 실행 중인 컨테이너의 표준 입출력에 연결하는 방법. -c, --stdin, --tty 옵션과 사용 예제를 정리합니다."
---

## 기본 구조

```bash
kubectl attach [파드 이름] -c [컨테이너 이름]

# my-pod Pod의 my-container 컨테이너 내부의 터미널 세션에 접속할 수 있다.
kubectl attach my-pod -c my-container
```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

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

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)