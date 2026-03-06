---
title: "[Kubernetes] Containerd 기반 마스터 노드 고가용성(HA) 클러스터 구축 (ft. VIP 설정 주의사항)"
date: 2025-08-06
categories: [Kubernetes, HA]
tags: [kubernetes, containerd, kubeadm, high-availability, haproxy, troubleshooting]
---

# Containerd 환경에서 kubeadm으로 HA 클러스터 구축하기

쿠버네티스 운영 환경에서 가장 중요한 것은 **고가용성(High Availability)**입니다. 마스터 노드(Control Plane)가 하나뿐이라면, 그 노드에 장애가 생기는 순간 클러스터 전체의 제어권을 잃게 됩니다.

본 포스팅에서는 **Containerd**를 런타임으로 사용하고, **HAProxy + Keepalived**로 마스터 노드들을 묶어 가상 IP(VIP)를 통해 통신하는 안정적인 HA 클러스터 구축법을 다룹니다.

---

## 1. 클러스터 아키텍처 이해

고가용성 구성을 위해서는 여러 대의 마스터 노드 앞단에 **Load Balancer**가 위치해야 합니다. 모든 노드(Master, Worker)는 특정 마스터의 개별 IP가 아닌, 로드밸런서가 제공하는 **대표 VIP(Virtual IP)**를 통해 통신합니다.



---

## 2. 사전 준비 (모든 노드 공통)

### 2.1 시스템 설정 및 Swap 비활성화
```bash
# Swap 비활성화 (K8s 필수 사항)
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab

# 커널 모듈 로드
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# sysctl 설정 (IP 포워딩 등)
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

```

---

## 3. Containerd 설치 및 최적화

쿠버네티스 표준 런타임인 **Containerd**를 설치하고, `systemd`와 자원 관리 방식을 일치시킵니다.

```bash
sudo apt-get update && sudo apt-get install -y containerd

# 기본 설정 생성 및 SystemdCgroup 활성화
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml

sudo systemctl restart containerd

```

---

## 4. 로드밸런서 설정 (LB 노드 전용)

마스터 노드 3대를 하나로 묶어줄 **HAProxy**를 설정합니다. (VIP 주소를 `192.168.0.100`이라고 가정합니다.)

```haproxy
# /etc/haproxy/haproxy.cfg 하단 추가
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

## 5. 클러스터 초기화 (Master 1)

### 🚨 [중요] 절대 주의: --control-plane-endpoint의 의미

HA 구성을 할 때 가장 많이 하는 실수가 `kubeadm init` 단계에서 `--control-plane-endpoint` 옵션을 빠뜨리는 것입니다.

* **빠뜨릴 경우**: 클러스터 엔드포인트가 **첫 번째 마스터 노드의 실제 IP**로 고정됩니다. 나중에 마스터를 아무리 추가해도, 첫 번째 노드가 죽으면 클러스터 통신이 끊깁니다. (진정한 HA가 아님)
* **해결책**: 반드시 **로드밸런서의 VIP**를 엔드포인트로 지정해야 합니다. 그래야 노드 장애 시에도 LB가 살아있는 다른 마스터로 연결을 넘겨줄 수 있습니다.

```bash
# 첫 번째 마스터 노드에서 실행
sudo kubeadm init \
  --control-plane-endpoint "192.168.0.100:6443" \
  --upload-certs \
  --pod-network-cidr=10.244.0.0/16 \
  --cri-socket unix:///run/containerd/containerd.sock

```

---

## 6. 노드 조인 (Join)

초기화 성공 후 나타나는 명령어 중, 용도에 맞는 명령어를 각 노드에 입력합니다.

### 6.1 추가 마스터 노드 (Master 2, 3)

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH> \
    --control-plane --certificate-key <KEY>

```

### 6.2 워커 노드 (Worker)

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH>

```

---

## 7. 마무리 및 확인

모든 노드가 추가되었다면 마스터 노드에서 상태를 확인합니다.

```bash
kubectl get nodes

```

이 구성은 특정 마스터 노드가 오프라인이 되어도 **VIP**를 통해 클러스터 운영이 중단되지 않는 강력한 가용성을 제공합니다.
