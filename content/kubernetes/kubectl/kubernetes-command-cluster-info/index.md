---
title: "[Kubernetes] kubectl cluster-info command"
date: 2023-08-09
tags: [kubernetes, kubectl, command, cluster-info]
description: "kubectl cluster-info 명령어로 클러스터 API 서버·DNS 엔드포인트와 버전 정보를 조회하는 방법. --context, --namespace 옵션을 예제로 정리합니다."
---

## 기본 구조

- 클러스터의 API 서버와 DNS 서비스의 IP 주소, 포트, 클러스터의 CA 인증서, API 서버의 버전 정보 등을 포함
    ```bash
    kubectl cluster-info
    ```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

### Option

- `--context`: 사용할 컨텍스트를 지정
    ```bash
    # my-context 컨텍스트를 사용하여 클러스터 정보를 출력
    kubectl cluster-info --context=my-context
    ```

- `--namespace`: 리소스가 포함된 네임스페이스를 지정
    ```bash
    # my-namespace 네임스페이스에 대한 클러스터 정보를 출력
    kubectl cluster-info --namespace=my-namespace
    ```

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)