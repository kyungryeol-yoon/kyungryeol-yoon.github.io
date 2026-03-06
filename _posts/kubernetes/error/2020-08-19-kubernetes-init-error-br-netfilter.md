---
title: "[Kubernetes] kubeadm init 시 bridge-nf-call-iptables 에러 해결"
date: 2020-08-19
categories: [Kubernetes, Error]
tags: [kubernetes, kubeadm, error, br_netfilter]
---

# 🛠️ kubeadm init 도중 발생하는 네트워크 에러 해결

쿠버네티스 초기화(`kubeadm init`) 중 발생하는 대표적인 네트워크 브리지 에러 해결법을 정리합니다. 🔍

---

## 🚨 문제 상황

`kubeadm init` 실행 시 아래와 같은 `preflight` 체크 에러가 발생할 수 있습니다.

```bash
[init] Using Kubernetes version: v1.15.3
[preflight] Running pre-flight checks
...
error execution phase preflight: [preflight] Some fatal errors occurred:
[ERROR FileContent--proc-sys-net-bridge-bridge-nf-call-iptables]: /proc/sys/net/bridge/bridge-nf-call-iptables does not exist
[preflight] If you know what you are doing, you can make a check non-fatal with `--ignore-preflight-errors=...`

```

`/proc/sys/net/bridge/bridge-nf-call-iptables` 파일이 존재하지 않는다는 에러이며, 단순히 `echo 1`을 통해 값을 넣으려 해도 파일이 없어 실패하게 됩니다.

---

## ✅ 해결 방법: br_netfilter 모듈 로드

이 에러는 리눅스 커널의 **br_netfilter** 모듈이 활성화되지 않아 관련 커널 파라미터 경로가 생성되지 않았을 때 발생합니다. `modprobe` 명령어를 사용하여 모듈을 강제로 로드해 주어야 합니다.

### 1.1 커널 모듈 로드

```bash
# br_netfilter 모듈 로드
sudo modprobe br_netfilter

```

### 1.2 커널 파라미터 설정

모듈 로드 후, 해당 경로에 값을 설정할 수 있게 됩니다.

```bash
# bridge-nf-call-iptables 활성화
sudo echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables

```

---

## 2. 결과 확인 및 재시도

설정을 마친 후 다시 `kubeadm init`을 실행하면 정상적으로 `preflight` 체크를 통과하고 클러스터 초기화가 진행됩니다.

```bash
sudo kubeadm init --config=kubeadm-config.yaml --upload-certs

# 실행 결과 예시
[init] Using Kubernetes version: v1.15.3
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
...
[kubelet-start] Activating the kubelet service

```

이후 과정은 일반적인 마스터 노드 설정 방식(kubeconfig 설정 등)에 따라 진행하시면 됩니다.
