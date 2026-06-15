---
title: "[Kubernetes] kubectl auth reconcile command"
date: 2022-11-10
tags: [kubernetes, kubectl, command, auth reconcile]
description: "kubectl auth reconcile 명령어로 RBAC Role·RoleBinding 규칙을 조정·적용하는 방법. -f, --dry-run 옵션과 사용 예제를 정리합니다."
---

## 기본 구조

```bash
kubectl auth reconcile -f [파일 경로]

# 현재 클러스터에 적용된 ./rbac.yaml 파일의 권한 부여를 재조정할 수 있다.
kubectl auth reconcile -f ./rbac.yaml
```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

### Option

- `-f`, `--filename`: 대상 파일을 지정
    ```bash
    # ./rbac.yaml 파일의 권한 부여를 재조정
    kubectl auth reconcile -f ./rbac.yaml
    ```

- `--dry-run`: 실제 작업을 수행하지 않고 결과만 확인
    ```bash
    # 실제 작업을 수행하지 않고 ./rbac.yaml 파일의 재조정 결과만 확인
    kubectl auth reconcile -f ./rbac.yaml --dry-run
    ```

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)