---
# layout: post
title: "[Kubernetes] kubectl get command"
date: 2022-01-22
categories: [Kubernetes, Tool]
tags: [Kubernetes, kubectl, Command, get]
# comments: true
pin: true
---

## 기본 구조

```bash
kubectl get [리소스 종류] [옵션]
```

- 리소스 종류
    - Pod
    - Service
    - Deployment
    - ConfigMap
    - Secret
    - Node
    - Namespace
    - PersistentVolume
    - StorageClass
    - Ingress

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--all-namespaces`, `-A`: 모든 네임스페이스에서 리소스를 조회
    ```bash
    kubectl get pods --all-namespaces
    ```

- `--selector`, `-l`: 라벨 셀렉터를 사용하여 특정 리소스를 조회
    ```bash
    kubectl get pods -l app=myapp
    ```

- `--output`, `-o`: 출력 형식을 지정
    ```bash
    kubectl get pods -o wide
    ```

- `--watch`, `-w`: 리소스 변경 사항을 실시간으로 모니터링
    ```bash
    kubectl get pods -w
    ```

- `--sort-by`: 조회 결과를 정렬
    ```bash
    # "--sort-by=.metadata.creationTimestamp" 명령은 생성된 시간에 따라 정렬
    kubectl get pods --sort-by=.status.phase
    ```

-` --field-selector`: 필드 셀렉터를 사용하여 특정 필드의 값을 기준으로 리소스를 조회
    ```bash
    kubectl get pods --field-selector=status.phase=Running
    ```

- `--show-labels`: 리소스에 대한 라벨 정보를 표시
    ```bash
    kubectl get pods --show-labels
    ```

- `--no-headers`: 표 헤더를 표시하지 않는다.
    ```bash
    kubectl get pods --no-headers
    ```

- `--export`: 출력 결과에서 불필요한 정보를 제거
    ```bash
    # "my-pod" 이름을 가진 파드의 YAML 파일을 생성, 이 때 --export 옵션을 사용하면 출력 결과에서 상태 및 메타데이터와 같은 불필요한 정보가 제거
    kubectl get pod my-pod -o yaml --export > my-pod.yaml
    ```

- `--field-selector`와 함께 사용할 수 있는 필드는 다양
    - `"status.phase"` 필드는 파드의 실행 상태를 나타내며, `"metadata.name"` 필드는 파드의 이름을 나타낸다.

- `--show-kind`: 조회 결과에 리소스 유형을 표시
    ```bash
    kubectl get pods --show-kind
    ```

- `--ignore-not-found`: 조회 결과가 없는 경우 에러를 발생시키지 않고 정상적으로 종료
    ```bash
    kubectl get pods my-pod --ignore-not-found
    ```

- `--timeout`: 조회 시간 제한을 설정
    ```bash
    # "--timeout=5s" 명령은 5초 동안 조회를 시도
    kubectl get pods --timeout=10s
    ```

- `--selector`와 함께 사용할 수 있는 라벨 셀렉터의 사용 예시는 다음과 같다.
    ```bash
    # "app=myapp" 라벨을 가진 파드를 조회
    kubectl get pods -l app=myapp

    # "app" 라벨이 "myapp"이 아닌 파드를 조회
    kubectl get pods -l app!=myapp

    # "app" 라벨이 "myapp" 또는 "yourapp"인 파드를 조회
    kubectl get pods -l 'app in (myapp, yourapp)'

    # "app" 라벨이 "myapp" 또는 "yourapp"이 아닌 파드를 조회
    kubectl get pods -l 'app notin (myapp, yourapp)'
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }