---
# layout: post
title: "[Kubernetes] kubectl create command"
date: 2023-03-30
categories: [Kubernetes, Tool]
tags: [kubernetes, kubectl, command, create]
# comments: true
---

## 기본 구조

```bash
kubectl create [리소스 종류] [리소스 이름]
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### 자주 사용하는 Command

```bash
kubectl create pod

# Nginx 이미지를 사용하는 my-pod 이름을 가진 Pod 리소스를 생성
kubectl create pod my-pod --image=nginx
```

```bash
kubectl create deployment

# Nginx 이미지를 사용하는 my-deployment 이름을 가진 Deployment 리소스를 생성
kubectl create deployment my-deployment --image=nginx
```

```bash
kubectl create service

# 80 포트를 8080 포트로 매핑하는 my-service 이름을 가진 ClusterIP Service 리소스를 생성
kubectl create service clusterip my-service --tcp=80:8080
```

```bash
kubectl create configmap

# key1=value1, key2=value2 데이터를 가진 my-config 이름을 가진 ConfigMap 리소스를 생성
kubectl create configmap my-config --from-literal=key1=value1 --from-literal=key2=value2
```

```bash
kubectl create secret

# password=1234 데이터를 가진 my-secret 이름을 가진 Secret 리소스를 생성
kubectl create secret generic my-secret --from-literal=password=1234
```

### Option

- `--dry-run`: 리소스를 생성하지 않고 생성 결과만 미리 확인
    ```bash
    kubectl create deployment my-deployment --image=nginx --dry-run
    ```

- `-o`, `--output`: 생성한 리소스의 정보를 출력 형식을 지정, json 또는 yaml 형식을 사용할 수 있다.
    ```bash
    kubectl create deployment my-deployment --image=nginx -o json (JSON 형식으로 생성한 deployment 정보를 출력)
    ```

- `--save-config`: 리소스를 생성할 때, 생성한 리소스의 구성을 클러스터 상태 저장소에 저장
    ```bash
    # Nginx 이미지를 사용하는 my-deployment 이름을 가진 Deployment 리소스를 생성하면서, 리소스의 구성을 클러스터 상태 저장소에 저장
    kubectl create deployment my-deployment --image=nginx --save-config
    ```

- `--image`: Pod 또는 Deployment 리소스를 생성할 때, 사용할 컨테이너 이미지를 지정
    ```bash
    # Nginx 이미지를 사용하는 my-pod 이름을 가진 Pod 리소스를 생성
    kubectl create pod my-pod --image=nginx
    ```

- `-f`, `--filename`: YAML 또는 JSON 파일을 사용하여 리소스를 생성
    ```bash
    # pod.yaml 파일에 정의된 Pod 리소스를 생성
    kubectl create -f pod.yaml
    ```

- `-n`, `--namespace`: 리소스가 생성될 네임스페이스를 지정
    ```bash
    # my-deployment 이름을 가진 Deployment 리소스를 my-namespace 네임스페이스에 생성
    kubectl create deployment my-deployment --image=nginx -n my-namespace
    ```

- `--restart-policy`: 컨테이너의 재시작 정책을 지정, Always, OnFailure, Never 중 하나를 선택할 수 있다.
    ```bash
    # Nginx 이미지를 사용하는 my-pod 이름을 가진 Pod 리소스를 생성하면서, 컨테이너의 재시작 정책을 OnFailure로 지정
    kubectl create pod my-pod --image=nginx --restart-policy=OnFailure
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }