---
# layout: post
title: "[Kubernetes] kubectl proxy command"
date: 2022-06-25
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, proxy]
# comments: true
# pin: true
---

## 기본 구조
```
# URL을 통해 API 서버와 통신할 수 있다.
kubectl proxy http://localhost:8001
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- --port: proxy 서버가 사용할 포트 번호를 지정
```
# proxy 서버를 8080 포트에서 실행
kubectl proxy --port=8080
```

- --address: proxy 서버가 사용할 IP 주소를 지정
```
# proxy 서버를 모든 IP 주소에서 실행
kubectl proxy --address=0.0.0.0
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }