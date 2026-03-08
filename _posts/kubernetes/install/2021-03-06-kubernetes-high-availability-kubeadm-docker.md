---
title: "[Kubernetes] kubeadm으로 마스터 노드 고가용성(HA) 클러스터 구축하기(Docker)"
date: 2021-03-06
categories: [Kubernetes, HA]
tags: [kubernetes, docker, kubeadm, highavailability, haproxy, keepalived, cluster]
---

## 🏗️ 1. 클러스터 구성 및 아키텍처

본 가이드는 마스터 노드 안에 etcd를 함께 배포하는 **Stacked etcd** 방식을 사용합니다.

* **Load Balancer (VIP)**: HAProxy + Keepalived (대표 IP: `192.168.0.100`)
* **Master Nodes**: 최소 3대 권장 (홀수 구성)
* **Worker Nodes**: 실제 서비스가 구동될 노드들

---

## ⚙️ 2. 사전 준비 (모든 노드 공통)

모든 노드(마스터, 워커, 로드밸런서)에서 기본적인 시스템 설정을 진행합니다.

### 2.1 Swap 및 방화벽 설정 🛑
```bash
# Swap 비활성화
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab

# 방화벽 해제 (학습용 환경 기준)
sudo ufw disable
```

### 2.2 커널 모듈 및 네트워크 브리지 설정

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system
```

---

## 📦 3. Docker 설치 및 Cgroup Driver 설정

쿠버네티스와 Docker의 자원 관리 방식(Cgroup)을 일치시키는 것이 매우 중요합니다.

```bash
# Docker 설치
sudo apt-get update && sudo apt-get install -y docker.io
sudo systemctl enable --now docker

# 🚨 중요: Docker Cgroup Driver를 systemd로 변경
# K8s 1.22 버전 이상부터는 systemd가 기본이자 권장사항입니다.
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

## ⚖️ 4. 로드밸런서(LB) 구성 (LB 노드)

마스터 노드들의 API Server(6443 포트)로 트래픽을 분산해 줄 **HAProxy**를 설정합니다.

**`/etc/haproxy/haproxy.cfg` 설정:**

```haproxy
frontend k8s-api
    bind *:6443
    mode tcp
    default_backend k8s-api-nodes

backend k8s-api-nodes
    mode tcp
    balance roundrobin
    server master1 192.168.0.11:6443 check
    server master2 192.168.0.12:6443 check
    server master3 192.168.0.13:6443 check
```

---

## 🚩 5. 클러스터 초기화 (첫 번째 마스터)

### ⚠️ [주의] VIP 설정을 절대 빠뜨리지 마세요!

고가용성 클러스터의 핵심은 모든 노드가 **로드밸런서의 VIP**를 바라보게 하는 것입니다. `--control-plane-endpoint` 옵션을 **빠뜨리면(누락하면)** HA 구성이 무의미해집니다.

```bash
# 첫 번째 마스터에서 실행 (VIP 주소 사용)
sudo kubeadm init \
  --control-plane-endpoint "192.168.0.100:6443" \
  --upload-certs \
  --pod-network-cidr=10.244.0.0/16
```

성공 시 화면에 나타나는 `kubeadm join ... --control-plane` 명령어를 복사해 두세요. ✨

---

## 🤝 6. 마스터 및 워커 노드 조인 (Join)

### 6.1 추가 마스터 노드 (Master 2, 3)

복사해둔 명령어에 `--control-plane` 옵션이 포함되어 있는지 확인 후 실행합니다.

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH> \
    --control-plane --certificate-key <KEY>
```

### 6.2 워커 노드 (Worker)

일반 조인 명령어를 실행합니다.

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH>
```

---

## ✅ 7. 최종 상태 확인

모든 설정이 끝났습니다. 마스터 노드에서 전체 노드 상태를 확인합니다.

```bash
kubectl get nodes
```

**STATUS**가 모두 `Ready`라면, Docker 기반의 견고한 HA 클러스터 구축이 완료되었습니다! 🎉

### 💡 요약 포인트:

1. Docker 설치 후 **Systemd Cgroup Driver** 설정은 필수입니다.
2. `kubeadm init` 시 **로드밸런서 VIP**를 **빠뜨리지 말아야** 진정한 고가용성이 구현됩니다.
3. `--upload-certs` 옵션은 마스터 노드 간 인증서 공유를 아주 편하게 해줍니다.
