---
# layout: post
title: "[Kubernetes] kubectl label command"
date: 2023-11-11
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, label]
# comments: true
---

## 기본 구조

```bash
kubectl label [리소스 종류] [리소스 이름] [Label 이름]=[Label 값]

# my-pod 이름의 Pod에 app=my-app Label을 추가할 수 있다.
kubectl label pods my-pod app=my-app
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--overwrite`: 이미 존재하는 Label 값을 덮어쓰기 한다.
    ```bash
    # my-pod 이름의 Pod에 이미 존재하는 app Label 값을 my-new-app으로 덮어쓴다.
    kubectl label pods my-pod app=my-new-app --overwrite
    ```

- `--namespace`: 리소스가 포함된 Namespace를 지정
    ```bash
    # my-namespace Namespace에 속한 my-pod 이름의 Pod에 app=my-app Label을 추가
    kubectl label pods my-pod app=my-app --namespace my-namespace
    ```

- `--selector`: Label을 추가할 리소스를 선택
    ```bash
    # app=my-app Label을 가진 모든 Pod에 release=beta Label을 추가
    kubectl label pods --selector app=my-app release=beta
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }