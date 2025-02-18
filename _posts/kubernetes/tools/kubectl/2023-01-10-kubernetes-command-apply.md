---
# layout: post
title: "[Kubernetes] kubectl apply command"
date: 2023-01-10
categories: [Kubernetes, Tool]
tags: [Kubernetes, kubectl, Command, apply]
# comments: true
---

## 기본 구조

```bash
kubectl apply -f [파일 경로]

# deployment.yaml 파일에 정의된 deployment 리소스를 Cluster에 배포
kubectl apply -f deployment.yaml
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `-f`, `--filename`: 배포할 YAML 또는 JSON 파일의 경로를 지정할 수 있으며, 파일 이름이나 directory 이름을 지정할 수 있다.
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 배포
    kubectl apply -f deployment.yaml
    ```

- `--prune`: 새로운 YAML 또는 JSON 파일에 정의되지 않은 기존 리소스를 삭제
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 배포하면서, 새로운 파일에 정의되지 않은 기존 리소스를 삭제
    kubectl apply --prune -f deployment.yaml
    ```

- `--selector`: 리소스를 선택하는 Label selector를 지정
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 배포하면서, app=nginx Label을 가진 기존 리소스를 선택
    kubectl apply --selector app=nginx -f deployment.yaml
    ```

- `-R`, `--recursive`: directory 내부의 모든 YAML 또는 JSON 파일을 배포
    ```bash
    # deployments directory 내부의 모든 YAML 또는 JSON 파일을 배포
    kubectl apply -R -f ./deployments
    ```

- `--validate`: 배포하기 전 YAML 또는 JSON 파일을 검증
    ```bash
    # YAML 또는 JSON 파일을 검증하지 않고 배포
    kubectl apply --validate=false -f deployment.yaml
    ```

- `--overwrite`: 기존 리소스를 덮어쓰기 한다. `--force`와 유사하지만, 롤링 업데이트 중에 리소스를 강제로 교체할 때 사용
    ```bash
    # nginx-deployment.yaml 파일을 사용하여 Deployment 오브젝트를 생성하거나 수정하되, 이미 존재하는 경우 덮어쓰기(overwrite)를 하라는 옵션
    kubectl apply --overwrite -f nginx-deployment.yaml
    ```

- `--force`: 기존 리소스를 덮어쓰기
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 Cluster에 배포하면서, 기존 리소스를 덮어쓴다.
    kubectl apply --force -f deployment.yaml
    ```

- `--force-conflicts`: 리소스 간의 충돌을 해결하기 위해 강제로 덮어쓰기 한다.
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 Cluster에 배포하면서, 리소스 간의 충돌이 발생하면 강제로 덮어쓴다.
    kubectl apply --force-conflicts -f deployment.yaml
    ```

- `--prune-whitelist`: `--prune` 옵션과 함께 사용되며, 삭제하지 않을 리소스를 지정
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 배포하면서, configmap 리소스는 삭제하지 않도록 지정
    kubectl apply --prune --prune-whitelist=configmap -f deployment.yaml
    ```

- `--dry-run`: 배포하지 않고 배포 결과만 미리 확인
    ```bash
    # deployment.yaml 파일에 정의된 리소스를 배포하지 않고, 배포 결과만 미리 확인
    kubectl apply --dry-run -f deployment.yaml
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }