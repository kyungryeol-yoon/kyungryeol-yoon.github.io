---
# layout: post
title: "[Kubernetes] kubectl version command"
date: 2022-08-12
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, version]
# comments: true
# pin: true
---

## 기본 구조

```bash
# Cluster의 버전 정보와 kubectl 명령어의 버전 정보가 출력
kubectl version
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

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

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }