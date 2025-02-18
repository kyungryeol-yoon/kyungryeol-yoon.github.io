---
# layout: post
title: "[Kubernetes] kubectl patch command"
date: 2023-02-21
categories: [Kubernetes, Tool]
tags: [Kubernetes, kubectl, Command, patch]
# comments: true
---

## 기본 구조

```bash
kubectl patch [리소스 종류] [리소스 이름] [수정할 필드]=[새 값]

# my-deployment 이름의 배포의 replica 수를 3으로 변경할 수 있다.
kubectl patch deployment my-deployment -p '{"spec":{"replicas":3}}'
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `-p`, `--patch`: JSON 포맷으로 수정 내용을 지정
    ```bash
    # my-deployment 이름의 배포의 replica 수를 3으로 변경
    kubectl patch deployment my-deployment -p '{"spec":{"replicas":3}}'
    ```

- `--type`: 수정 내용의 포맷을 지정. json, merge, strategic 중 하나를 지정할 수 있다. 기본값은 strategic
    ```bash
    # my-deployment 이름의 배포의 replica 수를 3으로 변경합니다. --type=json 옵션을 사용하여 JSON 포맷으로 수정 내용을 지정
    kubectl patch deployment my-deployment --type=json -p '[{"op":"replace","path":"/spec/replicas","value":3}]'
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }