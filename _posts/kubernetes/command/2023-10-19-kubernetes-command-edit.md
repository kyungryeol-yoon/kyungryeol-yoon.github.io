---
# layout: post
title: "[Kubernetes] kubectl edit command"
date: 2023-10-19
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, edit]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl edit [리소스 종류] [리소스 이름]

# my-deployment 이름의 deployment 리소스의 YAML 구성 파일을 열고 직접 수정할 수 있다.
kubectl edit deployment my-deployment
```

> 수정한 후에는 파일을 저장하고 종료하면, Kubernetes API 서버에 변경 내용이 자동으로 적용된다.
{: .prompt-info }

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespace`: 리소스가 포함된 namespace를 지정
    ```bash
    # my-namespace namespace에 속한 my-deployment 이름의 deployment 리소스의 YAML 구성 파일을 열고 직접 수정할 수 있다.
    kubectl edit deployment my-deployment --namespace my-namespace
    ```

- `--filename`: 파일에서 YAML 구성을 읽어온다.
    ```bash
    # my-deployment.yaml 파일에서 deployment 리소스의 YAML 구성을 읽어와 수정할 수 있다.
    kubectl edit --filename=my-deployment.yaml
    ```

- `--output`: 출력 형식을 지정
    ```bash
    # my-deployment 이름의 deployment 리소스의 YAML 구성을 편집한 후, YAML 형식으로 출력
    kubectl edit deployment my-deployment --output=yaml
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }