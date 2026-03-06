---
title: "[Kubernetes] kubeadm으로 쿠버네티스 클러스터 설치하기 (Ubuntu/Debian)"
date: 2022-05-06
categories: [Kubernetes, Kubeadm]
tags: [kubernetes, kubeadm, ubuntu, debian, docker]
---

# ☸️ kubeadm으로 쿠버네티스 클러스터 구축하기

안녕하세요! 오늘은 가장 표준적인 방식인 **kubeadm**을 사용하여 Ubuntu 환경에서 쿠버네티스 클러스터를 구축하는 방법을 알아보겠습니다. 🚀

---

## 🛠️ 1. 사전 준비 (모든 노드 공통)

쿠버네티스 설치 전, 안정적인 동작을 위해 시스템 설정을 진행합니다.

### 1.1 Swap 비활성화
kubelet이 정상적으로 작동하려면 **Swap**이 반드시 꺼져 있어야 합니다. 🛑
```bash
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab

```

### 1.2 네트워크 브리지 설정

iptables가 브리지된 트래픽을 올바르게 볼 수 있도록 설정합니다.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system

```

---

## 📦 2. Docker 및 K8s 설치

### 2.1 컨네이너 런타임 설치

```bash
sudo apt-get update && sudo apt-get install -y docker.io
sudo systemctl enable --now docker

```

### 2.2 kubeadm, kubelet, kubectl 설치

```bash
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg [https://packages.cloud.google.com/apt/doc/apt-key.gpg](https://packages.cloud.google.com/apt/doc/apt-key.gpg)

echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] [https://apt.kubernetes.io/](https://apt.kubernetes.io/) kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

```

---

## 🚩 3. 클러스터 초기화 (Master)

```bash
# 마스터 노드 초기화
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# 설정 파일 복사 (일반 사용자 계정)
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
