---
title: "[Kubernetes] kubeadm init 시 bridge-nf-call-iptables 에러 해결"
date: 2020-08-19
categories: [Kubernetes, Error]
tags: [kubernetes, kubeadm, error, br_netfilter]
---

# 🛠️ kubeadm init 중 발생하는 네트워크 브리지 에러 해결하기

쿠버네티스 클러스터를 초기화하는 `kubeadm init` 과정은 생각보다 까다로울 수 있습니다. 특히 네트워크 설정 단계에서 발생하는 **"bridge-nf-call-iptables"** 관련 에러는 입문자들이 가장 당황하는 부분 중 하나입니다. 🔍


---

## 🚨 1. 문제 상황 (The Error)

`kubeadm init` 명령어를 실행하면 시스템의 사전 상태를 점검(Pre-flight check)하는데, 이때 아래와 같은 치명적인 에러(Fatal Error)를 마주하게 됩니다.

```bash
[init] Using Kubernetes version: v1.2x.x
[preflight] Running pre-flight checks
...
error execution phase preflight: [preflight] Some fatal errors occurred:
[ERROR FileContent--proc-sys-net-bridge-bridge-nf-call-iptables]: /proc/sys/net/bridge/bridge-nf-call-iptables does not exist

```

직역하자면 `/proc/sys/net/bridge/bridge-nf-call-iptables`라는 파일이 존재하지 않는다는 뜻입니다. 이 파일이 없으면 쿠버네티스의 파드(Pod) 간 네트워크 트래픽을 iptables가 제어할 수 없게 됩니다. 🛑

---

## 💡 2. 원인 분석 (Root Cause)

이 문제는 리눅스 커널의 **`br_netfilter`** 모듈이 활성화되지 않았기 때문에 발생합니다.

* **br_netfilter**: 브리지 네트워크 인터페이스를 통과하는 패킷을 iptables(Netfilter)가 처리할 수 있게 해주는 커널 모듈입니다.
* 이 모듈이 로드되지 않으면 `/proc/sys/net/bridge/` 경로 자체가 생성되지 않으므로, 아무리 설정값을 넣으려 해도 "No such file or directory" 에러가 뜨는 것입니다.

---

## ✅ 3. 해결 방법 (The Solution)

### Step 3.1: 커널 모듈 강제 로드

먼저, `modprobe` 명령어를 사용하여 즉시 모듈을 활성화합니다.

```bash
# br_netfilter 모듈 로드
sudo modprobe br_netfilter

# 모듈이 잘 올라왔는지 확인
lsmod | grep br_netfilter

```

### Step 3.2: 커널 파라미터 활성화

이제 파일 경로가 생겼으니, 필요한 설정값을 1(True)로 변경해 줍니다.

```bash
# bridge-nf-call-iptables 활성화
sudo echo 1 | sudo tee /proc/sys/net/bridge/bridge-nf-call-iptables

# bridge-nf-call-ip6tables 활성화 (IPv6용)
sudo echo 1 | sudo tee /proc/sys/net/bridge/bridge-nf-call-ip6tables

```

---

## 🔄 4. 재부팅 시에도 자동 적용하기 (영구 설정)

위의 과정만으로는 서버를 재부팅하면 다시 에러가 발생할 수 있습니다. 영구적으로 설정을 유지하려면 아래 작업을 꼭 추가해 주세요. 🌟

### 4.1 모듈 자동 로드 설정

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

```

### 4.2 시스템 설정 파일에 등록

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

# 설정 즉시 적용
sudo sysctl --system

```

---

## 🏁 5. 결과 확인

모든 설정을 마친 후 다시 `kubeadm init`을 실행하면, 네트워크 관련 에러 없이 정상적으로 클러스터 초기화가 진행되는 것을 보실 수 있습니다! 🎉

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

```
