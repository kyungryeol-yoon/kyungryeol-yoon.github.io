---
title: "[Kubernetes] kubeadm으로 마스터 노드 고가용성(HA) 클러스터 구축하기(Docker)"
date: 2021-03-06
categories: [Kubernetes, HA]
tags: [kubernetes, kubeadm, high-availability, haproxy, keepalived]
---

# Kubernetes 마스터 노드 고가용성(HA) 클러스터 구성

단일 마스터 노드 구성은 해당 노드에 장애가 발생할 경우 클러스터 전체의 제어가 불가능해지는 **Single Point of Failure(SPOF)** 문제가 있습니다. 이를 해결하기 위해 Load Balancer를 활용한 마스터 노드 고가용성 클러스터를 구축해 보겠습니다.



---

## 1. 클러스터 구성 개요

본 가이드에서는 **Stacked etcd** 방식(마스터 노드 내에 etcd를 함께 배포)을 기준으로 설명합니다.

* **Load Balancer (2대)**: HAProxy + Keepalived (Virtual IP 활용)
* **Master Nodes (3대)**: 고가용성을 위해 홀수 개(최소 3대) 구성 권장
* **Worker Nodes (N대)**: 실제 워크로드가 실행되는 노드

---

## 2. 사전 준비 (모든 노드 공통)

모든 노드에 Docker(또는 Containerd), kubeadm, kubectl, kubelet이 설치되어 있어야 하며, Swap은 비활성화되어야 합니다.

```bash
# Swap 비활성화
sudo swapoff -a && sudo sed -i '/swap/s/^/#/' /etc/fstab

# 기본 네트워크 설정
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF
sudo modprobe br_netfilter
sudo sysctl --system

```

---

## 3. Load Balancer 설정 (LB 노드 전용)

마스터 노드들의 API Server(6443 포트)로 트래픽을 분산하기 위해 **HAProxy**와 **Keepalived**를 설정합니다.

### 3.1 HAProxy 설정

`/etc/haproxy/haproxy.cfg` 파일 하단에 마스터 노드 정보를 추가합니다.

```haproxy
frontend k8s-api
    bind *:6443
    mode tcp
    option tcplog
    default_backend k8s-api-backend

backend k8s-api-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server master1 <MASTER1_IP>:6443 check
    server master2 <MASTER2_IP>:6443 check
    server master3 <MASTER3_IP>:6443 check

```

### 3.2 Keepalived 설정 (Virtual IP)

두 대의 LB 중 한 대가 죽더라도 **VIP(Virtual IP)**를 통해 접속이 유지되도록 설정합니다.

---

## 4. 클러스터 초기화 (첫 번째 마스터 노드)

첫 번째 마스터 노드에서만 실행합니다. 핵심은 `--control-plane-endpoint` 옵션에 **Load Balancer의 VIP**를 지정하는 것입니다.

```bash
sudo kubeadm init --control-plane-endpoint "<LB_VIP>:6443" --upload-certs --pod-network-cidr=10.244.0.0/16

```

* `--upload-certs`: 인증서를 자동으로 클러스터에 업로드하여 다른 마스터 노드가 조인할 때 공유받을 수 있게 합니다.
* **결과값 저장**: 실행 후 출력되는 `kubeadm join ... --control-plane` 명령어를 반드시 복사해 두세요.

---

## 5. 추가 마스터 및 워커 노드 조인

### 5.1 추가 마스터 노드 (Master 2, 3)

복사해둔 명령어에 `--control-plane`과 `--certificate-key`가 포함된 구문을 실행합니다.

```bash
sudo kubeadm join <LB_VIP>:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH> \
    --control-plane --certificate-key <KEY>

```

### 5.2 워커 노드 (Worker Nodes)

일반적인 join 명령어를 실행합니다.

```bash
sudo kubeadm join <LB_VIP>:6443 --token <TOKEN> \
    --discovery-token-ca-cert-hash sha256:<HASH>

```

---

## 6. 설치 확인

마스터 노드에서 아래 명령어를 통해 모든 노드가 `Ready` 상태인지 확인합니다.

```bash
kubectl get nodes

```

모든 마스터 노드의 `ROLES`가 `control-plane,master`로 표시되고 상태가 정상이라면 고가용성 클러스터 구축이 완료된 것입니다.
