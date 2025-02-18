---
# layout: post
title: "[Kubernetes] kubectl api-resources command"
date: 2023-09-12
categories: [Kubernetes, Tool]
tags: [Kubernetes, kubectl, Command, api-resources]
# comments: true
---

## 기본 구조

- Kubernetes API에 정의된 모든 리소스 종류와 해당 리소스의 별칭, 리소스 유형 등의 정보를 출력
    ```bash
    kubectl api-resources
    ```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespaced`: 네임스페이스를 사용하는 리소스만 출력
    ```bash
    # namespace를 사용하는 리소스 종류만 출력
    kubectl api-resources --namespaced
    ```

- `--verbs`: 지정한 액션을 수행할 수 있는 리소스만 출력
    ```bash
    # get과 delete 액션을 수행할 수 있는 리소스 종류만 출력
    kubectl api-resources --verbs=get,delete
    ```

- `--api-group`: 지정한 API 그룹에 속한 리소스만 출력
    ```bash
    # apps API 그룹에 속한 리소스 종류만 출력
    kubectl api-resources --api-group=apps
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }