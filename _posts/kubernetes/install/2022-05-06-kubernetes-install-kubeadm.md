
---
title: "[Kubernetes] kubeadm으로 쿠버네티스 클러스터 설치하기 (Ubuntu/Debian)"
date: 2022-05-06
categories: [Kubernetes, Kubeadm]
tags: [kubernetes, kubeadm, ubuntu, debian, docker]
---

# kubeadm을 이용한 쿠버네티스 클러스터 구축 가이드

본 포스팅에서는 **Debian 계열(Ubuntu 20.04 LTS)** 환경에서 `kubeadm`을 사용하여 쿠버네티스 클러스터를 설치하고 설정하는 과정을 정리합니다.

---

## 1. 설치 환경 및 사전 준비

### 1.1 설치 환경
* **OS**: Ubuntu 20.04.4 LTS
* **사양**: 최소 2 CPU, 4GB RAM 이상 권장
* **노드 구성**: Master Node 1대, Worker Node 1대 이상

### 1.2 사전 체크리스트 (모든 노드 공통)
* 모든 노드에 대해 고유한 호스트 이름, MAC 주소, `product_uuid` 확인
* 클러스터 내 노드 간 전체 네트워크 연결 가능 여부 확인
* **Swap 비활성화**: kubelet의 정상 동작을 위해 반드시 필요합니다.

```bash
# swap 비활성화
sudo swapoff -a

# 재부팅 시에도 적용되도록 설정 확인
sudo swapon -s  # 결과가 없어야 함
free -h         # Swap 항목이 0B인지 확인

```

---

## 2. 시스템 환경 설정 (모든 노드 공통)

### 2.1 iptables 브리지 트래픽 설정

리눅스 노드의 iptables가 브리지된 트래픽을 올바르게 처리하도록 설정합니다.

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

### 2.2 방화벽 비활성화 (선택 사항)

학습 환경에서는 원활한 통신을 위해 방화벽을 끄거나 필수 포트(6443, 2379-2380, 10250 등)를 개방해야 합니다.

```bash
sudo systemctl stop firewalld
sudo systemctl disable firewalld

```

---

## 3. Docker(Container Runtime) 설치

쿠버네티스의 컨테이너 런타임으로 사용할 도커 엔진을 설치합니다.

```bash
# 구버전 제거
sudo apt-get remove docker docker-engine docker.io containerd runc

# 필수 패키지 설치 및 저장소 설정
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

# Docker GPG 키 추가 및 저장소 등록
curl -fsSL [https://download.docker.com/linux/debian/gpg](https://download.docker.com/linux/debian/gpg) | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] [https://download.docker.com/linux/debian](https://download.docker.com/linux/debian) $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 일반 사용자 권한 부여 (로그아웃 후 재접속 필요)
sudo usermod -aG docker $USER
newgrp docker

# 서비스 활성화
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

```

---

## 4. Kubernetes 컴포넌트 설치 (모든 노드)

`kubeadm`, `kubelet`, `kubectl`을 설치합니다.

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl

# 구글 클라우드 공개 사이닝 키 다운로드
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg [https://packages.cloud.google.com/apt/doc/apt-key.gpg](https://packages.cloud.google.com/apt/doc/apt-key.gpg)

# 리포지토리 추가
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] [https://apt.kubernetes.io/](https://apt.kubernetes.io/) kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

# 설치 및 버전 고정
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

```

---

## 5. 클러스터 생성 (Master Node 전용)

### 5.1 마스터 노드 초기화

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

```

> **주의**: 초기화 완료 후 하단에 출력되는 `kubeadm join ...` 명령어를 복사해 두세요. Worker Node 연결 시 반드시 필요합니다.

### 5.2 환경 설정 (일반 사용자 계정)

클러스터 관리 권한을 설정합니다.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

---

## 6. CNI(Network Add-on) 설치

노드 간 파드 통신을 위해 네트워크 플러그인을 설치합니다. (Weave Net 예시)

```bash
kubectl apply -f "[https://cloud.weave.works/k8s/net?k8s-version=$(kubectl](https://cloud.weave.works/k8s/net?k8s-version=$(kubectl) version | base64 | tr -d '\n')"

```

---

## 7. Worker Node 연결

마스터 노드에서 생성된 `join` 명령어를 **각 Worker Node**에서 실행합니다.

```bash
sudo kubeadm join <Master-IP>:6443 --token <Token> \
    --discovery-token-ca-cert-hash sha256:<Hash-Value>

```

---

## 8. 트러블슈팅 가이드

1. **cgroup driver 일치**: Docker와 K8s의 cgroup driver가 다를 경우 에러가 발생할 수 있습니다. `daemon.json`에서 `systemd`로 설정하는 것을 권장합니다.
2. **IP Forwarding**: `/proc/sys/net/ipv4/ip_forward` 값이 `1`이 아닐 경우 `kubeadm init` 중 에러가 발생할 수 있습니다.
3. **토큰 재발급**: 토큰이 만료된 경우 마스터 노드에서 `kubeadm token create --print-join-command`로 다시 확인할 수 있습니다.
