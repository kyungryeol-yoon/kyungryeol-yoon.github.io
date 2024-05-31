---
# layout: post
title: "Kubernetes auth reconcile command"
date: 2022-11-19
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, auth reconcile]
# comments: true
# pin: true
---

## 기본 구조
```
kubectl auth reconcile -f [파일 경로]

# 현재 클러스터에 적용된 ./rbac.yaml 파일의 권한 부여를 재조정할 수 있다.
kubectl auth reconcile -f ./rbac.yaml
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- -f, --filename: 대상 파일을 지정
```
# ./rbac.yaml 파일의 권한 부여를 재조정
kubectl auth reconcile -f ./rbac.yaml
```

- --dry-run: 실제 작업을 수행하지 않고 결과만 확인
```
# 실제 작업을 수행하지 않고 ./rbac.yaml 파일의 재조정 결과만 확인
kubectl auth reconcile -f ./rbac.yaml --dry-run
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }