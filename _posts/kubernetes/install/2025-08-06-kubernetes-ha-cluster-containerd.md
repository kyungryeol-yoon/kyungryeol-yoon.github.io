---
title: "[Kubernetes] Containerd 기반 쿠버네티스 고가용성(HA) 클러스터 완벽 구축 가이드"
date: 2025-08-06
categories: [Kubernetes, HA]
tags: [kubernetes, containerd, kubeadm, highavailability, haproxy, keepalived, cloudnative]
---

## 1. 🏗️ 클러스터 아키텍처 및 환경
고가용성 클러스터는 마스터 노드(Control Plane)를 여러 대 두어, 특정 노드에 장애가 발생해도 서비스가 중단되지 않도록 설계합니다.

* **Container Runtime**: Containerd (Docker 대체 표준)
* **Load Balancer**: HAProxy + Keepalived (Virtual IP 사용)
* **Nodes**: Master 3대, Worker N대 권장

---

## 2. ⚙️ 사전 준비 (모든 노드 공통)

가장 먼저 모든 노드에서 쿠버네티스가 구동될 수 있는 기초 공사를 진행합니다.

### 2.1 Swap 비활성화 및 네트워크 설정
쿠버네티스는 메모리 관리를 위해 **Swap 비활성화**가 필수입니다. 🛑

```bash
# 1. Swap 끄기
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab

# 2. 커널 모듈 로드 (Containerd 필수 모듈)
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 3. sysctl 파라미터 설정 (IP 포워딩 활성화)
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---

## 3. 📦 Containerd 설치 및 최적화

도커 없이 가볍고 빠른 **Containerd**를 직접 설치합니다.

```bash
sudo apt-get update && sudo apt-get install -y containerd

# 기본 설정 생성 및 SystemdCgroup 활성화 (중요!)
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml

sudo systemctl restart containerd
```

---

## 4. ⚖️ Load Balancer 구성 (LB 노드)

마스터 노드들을 하나로 묶어줄 대표 주소인 **VIP(Virtual IP)**를 설정합니다. (예: `192.168.0.100`)

**HAProxy 설정 예시 (`/etc/haproxy/haproxy.cfg`):**

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

## 5. 🚩 클러스터 초기화 (Master 1)

### ⚠️ [필독] VIP 설정을 빠뜨리면 안 되는 이유!

`kubeadm init` 실행 시 `--control-plane-endpoint` 옵션을 **빠뜨리는(빼는)** 실수를 가장 많이 합니다.

* **만약 빠뜨린다면?** 😱 클러스터가 로드밸런서가 아닌 **'첫 번째 마스터의 IP'**를 대표 주소로 기억합니다. 나중에 마스터를 추가해도, 첫 번째 노드가 죽으면 클러스터 전체가 먹통이 되어 HA 구성의 의미가 사라집니다.

```bash
# 로드밸런서 VIP를 엔드포인트로 지정하여 시작!
sudo kubeadm init \
  --control-plane-endpoint "192.168.0.100:6443" \
  --upload-certs \
  --pod-network-cidr=10.244.0.0/16 \
  --cri-socket unix:///run/containerd/containerd.sock
```

---

## 6. 🤝 노드 조인 (Join)

초기화 완료 후 출력되는 토큰을 사용하여 나머지 노드들을 연결합니다.

### 6.1 추가 마스터 노드 (Master 2, 3) 조인

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH> \
    --control-plane --certificate-key <KEY>
```

### 6.2 워커 노드 (Worker) 조인

```bash
sudo kubeadm join 192.168.0.100:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH>
```

---

## 7. ✅ 설치 확인 및 마무리

모든 노드가 정상적으로 연결되었는지 확인해 볼까요?

```bash
kubectl get nodes
```

**STATUS**가 모두 `Ready`라면 축하드립니다! 🎉 이제 어떤 마스터 노드 하나가 장애가 나더라도 끄떡없는 견고한 쿠버네티스 클러스터가 완성되었습니다.

### 💡 요약하자면:

1. **Swap 오프**는 기본!
2. **Containerd** 설정 시 `SystemdCgroup`을 꼭 `true`로!
3. `kubeadm init` 시 **LB VIP**를 절대 **빠뜨리지 말 것!**
