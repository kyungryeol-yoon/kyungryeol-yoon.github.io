---
title: "[Kubernetes] kubeadm으로 쿠버네티스 클러스터 설치하기 (Ubuntu/Debian)"
date: 2022-05-06
categories: [Kubernetes, Kubeadm]
tags: [kubernetes, kubeadm, ubuntu, debian, docker]
---

# ☸️ kubeadm을 이용한 쿠버네티스 클러스터 구축 (Step-by-Step)

---

## 🏗️ 1. 클러스터 구성 환경
본 가이드는 **Ubuntu 20.04 LTS** 이상 환경을 기준으로 작성되었습니다.

* **Master Node (1대)**: 클러스터 관리 및 제어 (최소 2 vCPU, 2GB RAM)
* **Worker Node (N대)**: 실제 컨테이너(Pod)가 실행되는 노드
* **OS**: Ubuntu 20.04 / 22.04 LTS

---

## ⚙️ 2. 사전 준비 작업 (모든 노드 공통)

쿠버네티스가 안정적으로 돌아가기 위해 시스템의 기초를 다지는 단계입니다. **모든 노드**에서 실행해 주세요.

### 2.1 Swap 메모리 비활성화 🛑
쿠버네티스는 성능과 안정성을 위해 스왑 메모리를 사용하지 않습니다.
```bash
# 즉시 비활성화
sudo swapoff -a

# 재부팅 시에도 적용되도록 설정 (fstab에서 swap 라인 주석 처리)
sudo sed -i '/swap/s/^/#/' /etc/fstab

# 확인 (Swap 항목이 0B여야 함)
free -h

```

### 2.2 네트워크 브리지 및 커널 모듈 설정 🌐

노드 간 통신과 iptables가 브리지 트래픽을 올바르게 처리하도록 설정합니다.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# 설정 적용
sudo sysctl --system

```

---

## 📦 3. 컨테이너 런타임(Docker) 설치

요즘은 `Containerd`를 많이 쓰지만, 기본 학습을 위해 가장 친숙한 `Docker`를 설치하는 과정입니다.

```bash
# 패키지 업데이트 및 필수 도구 설치
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Docker 설치
sudo apt-get install -y docker.io

# Docker 서비스 활성화 및 시작
sudo systemctl enable --now docker

# Docker cgroup driver를 systemd로 변경 (K8s 권장사항)
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker

```

---

## 🛠️ 4. Kubernetes 컴포넌트 설치

클러스터 운영의 핵심 도구인 `kubeadm`, `kubelet`, `kubectl`을 설치합니다.

```bash
# 구글 클라우드 퍼블릭 키 다운로드
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg [https://packages.cloud.google.com/apt/doc/apt-key.gpg](https://packages.cloud.google.com/apt/doc/apt-key.gpg)

# 쿠버네티스 리포지토리 추가
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] [https://apt.kubernetes.io/](https://apt.kubernetes.io/) kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

# 패키지 설치
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl

# 버전 업데이트로 인한 혼란 방지를 위해 버전 고정
sudo apt-mark hold kubelet kubeadm kubectl

```

---

## 🚩 5. 마스터 노드 초기화 (Master Node Only)

이제 실제로 클러스터를 시작합니다. **마스터 노드에서만** 실행하세요.

```bash
# pod-network-cidr은 이후 설치할 CNI(예: Flannel)에 맞춰 설정합니다.
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

```

### 💡 초기화 완료 후 설정 (일반 사용자용)

초기화가 끝나면 화면에 나오는 명령어를 복사해서 실행해 주세요.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

> **주의!** 마지막에 출력되는 `kubeadm join ...` 명령어를 별도로 메모장 등에 꼭 저장해 두세요. 워커 노드를 연결할 때 필요합니다.

---

## 🤝 6. 네트워크 플러그인(CNI) 설치

파드(Pod)끼리 통신할 수 있도록 **Flannel** 네트워크를 설치합니다.

```bash
kubectl apply -f [https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml](https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml)

```

---

## ✅ 7. 워커 노드 연결 및 상태 확인

이제 **워커 노드**로 가서 아까 저장해둔 `join` 명령어를 입력합니다.

```bash
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH>

```

마지막으로 마스터 노드에서 상태를 확인합니다.

```bash
kubectl get nodes

```
