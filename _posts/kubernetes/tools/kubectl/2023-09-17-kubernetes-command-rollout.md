---
# layout: post
title: "[Kubernetes] kubectl rollout command"
date: 2023-09-17
categories: [Kubernetes, Tool]
tags: [kubernetes, kubectl, command, rollout]
# comments: true
---

## 기본 구조

```bash
kubectl rollout [하위 명령어] [리소스 종류]/[리소스 이름]

# deployment rollout 상태를 확인
kubectl rollout status deployment/my-deploymentmy-deployment 
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--revision`: rollout 작업에서 사용할 revision 번호를 지정
    ```bash
    # my-deployment deployment를 2번 revision으로 rollback
    kubectl rollout undo deployment/my-deployment --to-revision=2
    ```

- `--dry-run`: 실제로 명령어를 실행하지 않고, 실행 결과만 미리 확인
    ```bash
    # my-deployment deployment를 재시작할 때, 실제로는 실행하지 않고 결과만 미리 확인
    kubectl rollout restart deployment/my-deployment --dry-run
    ```

### rollout 작업 상태 확인

#### 기본 구조

```bash
kubectl rollout status [리소스 종류]/[리소스 이름]

# my-deployment deployment의 rollout 상태를 확인할 수 있다.
kubectl rollout status deployment/my-deployment
```

#### Option

- `--watch`: 롤아웃 상태를 실시간으로 확인
    ```bash
    # my-deployment deployment의 rollout 상태를 실시간으로 확인
    kubectl rollout status deployment/my-deployment --watch
    ```

- `--timeout`: 대기 시간을 지정한다. 이 시간을 초과하면 명령어가 종료
    ```bash
    # my-deployment deployment의 rollout이 60초 이내에 완료되지 않으면 명령어가 종료
    kubectl rollout status deployment/my-deployment --timeout=60s
    ```

### rollout 작업 취소하고 이전 버전으로 rollout

#### 기본 구조

```bash
kubectl rollout undo [리소스 종류] [리소스 이름]

# my-deployment 이름의 배포를 이전 버전으로 rollback할 수 있다.
kubectl rollout undo deployment/my-deployment
```

#### Option

- `--to-revision`: rollback할 배포의 revision 번호를 지정
    ```bash
    # my-deployment 이름의 배포를 2번 revision으로 rollback
    kubectl rollout undo deployment/my-deployment --to-revision=2
    ```

- `--dry-run`: 실제로 rollback하지 않고 실행 결과만 확인
    ```bash
    # my-deployment 이름의 배포를 실제로 rollback하지 않고 실행 결과만 확인
    kubectl rollout undo deployment/my-deployment --dry-run
    ```

### rollout 작업 이력을 확인

#### 기본 구조

```bash
kubectl rollout history [리소스 종류] [리소스 이름]

# 명령어를 실행하여 my-deployment 이름의 배포의 이전 rollout 기록을 확인
kubectl rollout history deployment/my-deployment
```

#### Option

- `--revision`: 특정 revision의 상세 정보를 확인
    ```bash
    # my-deployment 이름의 배포의 2번 revision의 상세 정보를 확인
    kubectl rollout history deployment/my-deployment --revision=2
    ```

- `--namespace`: 리소스가 포함된 namespace를 지정
    ```bash
    # my-namespace namespace에 속한 my-deployment 이름의 배포의 이전 rollout 기록을 확인
    kubectl rollout history deployment/my-deployment --namespace my-namespace
    ```

### rollout 작업 재시작

#### 기본 구조

```bash
kubectl rollout restart [리소스 종류]/[리소스 이름]

# my-deployment deployment를 다시 시작할 수 있다.
kubectl rollout restart deployment/my-deployment
```

#### Option

- `--selector`: Label selector를 사용하여 리소스를 선택
    ```bash
    # app=nginx Label을 가진 모든 deployment를 다시 시작
    kubectl rollout restart deployment --selector=app=nginx
    ```

### rollout 작업 일시 중지

#### 기본 구조

```bash
kubectl rollout pause [리소스 종류]/[리소스 이름]

# my-deployment deployment의 rollout 작업을 일시 중지할 수 있다.
kubectl rollout pause deployment/my-deployment
```

#### Option

- `--selector`: Label selector를 사용하여 리소스를 선택
    ```bash
    # app=nginx Label을 가진 모든 deployment의 rollout 작업을 일시 중지
    kubectl rollout pause deployment --selector=app=nginx
    ```

> 일시 중지된 rollout 작업은 kubectl rollout resume 명령어를 사용하여 다시 시작할 수 있다. 이 명령어를 사용하면, rollout 작업이 이전 상태에서 재개된다.
{: .prompt-danger }

### 일시 중지된 rollout 작업 다시 시작

#### 기본 구조

```bash
kubectl rollout resume [리소스 종류]/[리소스 이름]

# my-deployment deployment의 rollout 작업을 다시 시작할 수 있다.
kubectl rollout resume deployment/my-deployment
```

#### Option

- `--selector`: Label selector를 사용하여 리소스를 선택
    ```bash
    # app=nginx Label을 가진 모든 deployment의 rollout 작업을 다시 시작
    kubectl rollout resume deployment --selector=app=nginx
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }