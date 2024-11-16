---
# layout: post
title: "[Kubernetes] kubeadm init command"
date: 2022-09-25
categories: [Kubeadm, command]
tags: [kubeadm, command, init]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubeadm init [옵션]

# 10.244.0.0/16 CIDR 범위의 Pod 네트워크를 생성하면서 Kubernetes Cluster를 초기화
kubeadm init --pod-network-cidr=10.244.0.0/16
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--config`: 초기화에 사용할 구성 파일을 지정
    ```bash
    # my-config.yaml 파일에 지정된 구성 파일을 사용하여 Kubernetes Cluster를 초기화
    kubeadm init --config=my-config.yaml
    ```

- `--token`: Cluster에 대한 액세스를 허용하는 토큰을 생성
    ```bash
    # 액세스를 허용하는 토큰이 abcdef.1234567890abcdef인 Kubernetes Cluster를 초기화
    kubeadm init --token abcdef.1234567890abcdef
    ```

- `--pod-network-cidr`: Cluster에 대한 Pod 네트워크 CIDR 범위를 지정
    ```bash
    # 10.244.0.0/16 CIDR 범위의 Pod 네트워크를 생성하면서 Kubernetes Cluster를 초기화
    kubeadm init --pod-network-cidr=10.244.0.0/16
    ```

- `--apiserver-cert-extra-sans`: Master Node 인증서에 추가할 DNS 이름을 지정
    ```bash
    # Master Node 인증서에 www.example.com DNS 이름을 추가하면서 Kubernetes Cluster를 초기화
    kubeadm init --apiserver-cert-extra-sans=www.example.com
    ```

- `--skip-phases`: 특정 초기화 단계를 건너뛴다.
    ```bash
    # kube-proxy 애드온 초기화를 건너뛴다.
    kubeadm init --skip-phases=addon/kube-proxy
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }