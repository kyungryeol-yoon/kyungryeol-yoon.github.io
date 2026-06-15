---
title: "[Kubernetes] kubectl version command"
date: 2022-08-12
tags: [kubernetes, kubectl, command, version]
description: "kubectl version 명령어로 클라이언트·서버 버전 정보를 조회하는 방법. --short, --client, --server 옵션과 사용 예제를 정리합니다."
---

## 기본 구조

```bash
# Cluster의 버전 정보와 kubectl 명령어의 버전 정보가 출력
kubectl version
```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

### Option

- `--short`: 간략한 버전 정보를 출력
    ```bash
    # kubectl 명령어와 Cluster의 버전 정보를 간략하게 출력
    kubectl version --short
    ```

- `--client`: 클라이언트의 버전 정보만 출력
    ```bash
    # kubectl 명령어의 버전 정보만 출력
    kubectl version --client
    ```

- `--server`: 서버의 버전 정보만 출력
    ```bash
    # Cluster의 API 서버 버전 정보만 출력
    kubectl version --server
    ```

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)