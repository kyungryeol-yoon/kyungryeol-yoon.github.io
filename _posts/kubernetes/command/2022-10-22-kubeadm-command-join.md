---
# layout: post
title: "[Kubernetes] kubeadm join command"
date: 2022-10-22
categories: [Kubeadm, Command]
tags: [kubeadm, command, join]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubeadm join [Master Node IP]:[Port] --token [Token] --discovery-token-ca-cert-hash [디스커버리 Token CA 인증서 해시]

# Master Node IP가 192.168.0.1이고, Token이 abcdef.1234567890abcdef이며, 디스커버리 Token CA 인증서 해시가 sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef인 Worker Node를 추가할 수 있다.
kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef --discovery-token-ca-cert-hash sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--token`: Cluster에 대한 액세스를 허용하는 Token을 지정
    ```bash
    # 액세스를 허용하는 Token이 abcdef.1234567890abcdef인 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef
    ```

- `--discovery-token-ca-cert-hash`: 디스커버리 Token CA 인증서 해시를 지정
    ```bash
    # 디스커버리 Token CA 인증서 해시가 sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef인 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --discovery-token-ca-certhash\ sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
    ```

> `\` 는 아랫줄까지 한줄로 쓰겠다는 의미
{: .prompt-tip }

- `--control-plane`: Master Node에서 실행되는 Kubernetes 컨트롤 플레인 구성 요소를 설치
    ```bash
    kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef --discovery-token-ca-cert-hash sha256:1234567890abcdef1234567890abcdef1234567890
    ```

- `--certificate-key`: Master Node에서 생성된 인증서 키를 지정
    ```bash
    # 인증서 키가 abcdef1234567890인 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef --discovery-token-ca-cert-hash sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef --certificate-key abcdef1234567890
    ```

- `--cri-socket`: 사용할 CRI 소켓 경로를 지정
    ```bash
    # Docker CRI를 사용하고, /var/run/dockershim.sock CRI 소켓을 사용하는 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef --discovery-token-ca-cert-hash sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef --cri-socket /var/run/dockershim.sock
    ```

- `--discovery-file`: 디스커버리 Token 파일의 경로를 지정
    ```bash
    # /etc/kubernetes/discovery-token-ca-cert-hash.txt 파일에서 디스커버리 Token CA 인증서 해시를 읽어들여 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --discovery-file=/etc/kubernetes/discovery-token-ca-cert-hash.txt
    ```

- `--skip-preflight-checks`: 사전 검사를 건너뛴다.
    ```bash
    # 사전 검사를 건너뛰고 Worker Node를 추가
    kubeadm join 192.168.0.1:6443 --token abcdef.1234567890abcdef --discovery-token-ca-cert-hash sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef --skip-preflight-checks
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }