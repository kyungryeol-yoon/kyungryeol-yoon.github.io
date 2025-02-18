---
# layout: post
title: "[Kubernetes] kubectl certificate command"
date: 2022-02-15
categories: [Kubernetes, Tool]
tags: [Kubernetes, kubectl, Command, certificate]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl create certificate [이름] --cert [인증서 파일 경로] --key [개인 키 파일 경로]

# my-cert.crt 파일과 my-cert.key 파일을 사용하여 my-cert 인증서를 생성할 수 있습니다.
kubectl create certificate my-cert --cert=./my-cert.crt --key=./my-cert.key
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--cert`: 인증서 파일 경로를 지정
    ```bash
    # my-cert.crt 파일을 사용하여 인증서를 생성
    kubectl create certificate my-cert --cert=./my-cert.crt --key=./my-cert.key
    ```

- `--key`: 개인 키 파일 경로를 지정
    ```bash
    # my-cert.key 파일을 사용하여 인증서를 생성
    kubectl create certificate my-cert --cert=./my-cert.crt --key=./my-cert.key
    ```

- `--namespace`: 네임스페이스를 지정
    ```bash
    # my-namespace 네임스페이스에 my-cert 인증서를 생성
    kubectl create certificate my-cert --cert=./my-cert.crt --key=./my-cert.key --namespace=my-namespace
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }