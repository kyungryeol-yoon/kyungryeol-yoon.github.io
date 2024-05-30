---
# layout: post
title: "Kubernetes copy command"
date: 2023-06-11
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, copy]
# comments: true
pin: true
---

## 기본 구조
```
kubectl cp [소스] [대상]

# Local Machine의 /path/to/local/file 파일을 my-pod 파드의 /path/to/destination 경로로 복사할 수 있다.
kubectl cp /path/to/local/file my-pod:/path/to/destination
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- -c, --container: 컨테이너 이름을 지정
```
# my-pod 파드의 my-container 컨테이너 내부의 /path/to/destination 경로에 로컬 머신의 /path/to/local/file 파일을 복사
kubectl cp /path/to/local/file my-pod:/path/to/destination -c my-container
```

- --no-preserve: 파일 속성을 유지하지 않는다.
```
# my-pod 파드의 /path/to/destination 경로에 로컬 머신의 /path/to/local/file 파일을 복사하되, 속성은 유지하지 않는다.
kubectl cp /path/to/local/file my-pod:/path/to/destination --no-preserve
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }