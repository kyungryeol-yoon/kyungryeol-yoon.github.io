---
# layout: post
title: "[Kubernetes] kubectl annotate command"
date: 2023-11-19
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, annotate]
# comments: true
---

## 기본 구조

```bash
kubectl annotate [리소스 종류] [리소스 이름] [주석 이름]=[주석 값]

# my-pod 이름의 Pod에 description="This is my pod" 주석을 추가할 수 있다.
kubectl annotate pods my-pod description="This is my pod"
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--overwrite`: 이미 존재하는 주석 값을 덮어쓰기 한다.
    ```bash
    # my-pod 이름의 Pod에 이미 존재하는 description 주석 값을 This is my new pod으로 덮어쓴다.
    kubectl annotate pods my-pod description="This is my new pod" --overwrite
    ```

- `--namespace`: 리소스가 포함된 Namespace를 지정한다.
    ```bash
    # my-namespace Namespace에 속한 my-pod 이름의 Pod에 description="This is my pod" 주석을 추가
    kubectl annotate pods my-pod description="This is my pod" --namespace my-namespace
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }