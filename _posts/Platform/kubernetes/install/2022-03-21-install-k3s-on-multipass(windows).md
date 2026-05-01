---
title: "[Kubernetes] k3s로 손쉬운 Kubernetes 클러스터 만들기 (Windows + Multipass + Ubuntu)"
date: 2022-03-21
description: "Windows 환경에서 Ubuntu Multipass를 이용해 k3s 기반 Kubernetes 클러스터를 구축하는 실전 설치 가이드"
categories: [Platform, Kubernetes, Install]
tags: [kubernetes, k3s, multipass, ubuntu, devops]
---

## k3s로 손쉬운 Kubernetes 클러스터 만들기 (Windows + Multipass + Ubuntu)

Windows 환경에서 **Multipass + Ubuntu VM**을 활용해 **k3s 기반 Kubernetes 클러스터**를 만드는 실습 가이드입니다.  
가볍고 빠르게 Kubernetes 클러스터를 실험해보고 싶을 때, k3s는 매우 적합합니다.

> k3s는 Rancher Labs에서 만든 경량 Kubernetes 배포판입니다. 프로덕션보다는 테스트/개발/엣지 환경에서 많이 활용됩니다.

---

## 🎯 목표

- Windows에서 Ubuntu VM 여러 대를 띄우기
- Master 노드 1대 + Worker 노드 3대를 구성
- Ubuntu 간 통신 및 고정 IP 설정
- k3s 설치 및 노드 조인

---

## 🛠️ 사용 도구

| 도구 | 역할 |
|------|------|
| **Windows + Hyper-V** | 하이퍼바이저 |
| **Multipass** | Ubuntu VM 생성 |
| **k3s** | Lightweight Kubernetes 배포 |

---

## 🐧 1. Ubuntu VM 생성 (Multipass)

Windows에서 다음과 같이 Ubuntu 인스턴스 4대를 띄웁니다.

```powershell
multipass launch -n k3s-master -c 2 -m 2G -d 20G impish
multipass launch -n k3s-node1 -c 2 -m 2G -d 20G impish
multipass launch -n k3s-node2 -c 2 -m 2G -d 20G impish
multipass launch -n k3s-node3 -c 2 -m 2G -d 20G impish
```

> 각 VM은 CPU 2코어, 메모리 2GB, 디스크 20GB로 설정합니다.

---

## 🚫 2. Swap 비활성화

각 Ubuntu VM에서 Swap을 끕니다. (k3s/k8s 필수)

```bash
sudo swapoff -a
```

각 노드에서 동일하게 실행합니다.

---

## 📡 3. 네트워크 고려사항

Multipass가 Hyper-V에서 제공하는 기본 네트워크는 재부팅 시 IP가 바뀝니다.
이를 해결할 수 있는 2가지 방법:

### ✔ 방법 1: Hyper-V 내부 네트워크 + 고정 IP

Hyper-V 내부 스위치를 생성하고 NAT로 네트워크를 구성해 고정 IP를 할당할 수 있습니다.
이후 multipass VM 생성 시 **새로 생성한 스위치**를 지정합니다.

### ✔ 방법 2: 호스트 시스템 hosts 파일 활용

재부팅 시 IP 변경이 빈번한 환경에서 hosts 파일에 도메인/IP 관계를 적어 관리할 수도 있습니다.

---

## ☸️ 4. k3s 설치 – Master

Master 노드에서 다음 명령으로 k3s를 설치합니다.

```bash
curl -sfL https://get.k3s.io | sh -
```

설치가 완료되면 다음 파일을 복사합니다.

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

이 토큰은 Worker가 Master에 조인할 때 필요합니다.

---

## 👷 5. k3s 설치 – Worker 노드 조인

Master에서 받은 토큰을 이용하여 각 Worker 노드를 클러스터에 조인합니다.

```bash
curl -sfL https://get.k3s.io | K3S_TOKEN="<토큰>" K3S_URL="https://<MASTER_IP>:6443" sh -
```

각 Worker에서도 위 명령을 반복 실행합니다.

---

## 🔧 6. kubectl 설정 (관리 PC)

Master VM에서 kubeconfig 파일을 복사하여 로컬 kubectl에서 활용합니다.

```bash
multipass exec k3s-master -- sudo cat /etc/rancher/k3s/k3s.yaml > k3s.yaml
```

복사한 `k3s.yaml`을 열고 **server 주소**를 Master IP로 변경합니다.

```yaml
server: https://<MASTER_IP>:6443
```

그 후 로컬에서 아래처럼 kubectl을 실행합니다.

```bash
export KUBECONFIG=$(pwd)/k3s.yaml
kubectl get nodes
```

성공적으로 노드가 등록되어 있는지 확인합니다.

---

## 💡 팁

* **k9s** 같은 터미널 UI 도구를 설치하면 클러스터 모니터링이 편해집니다.
* yaml manifest를 여러 VM에 배포할 때는 네트워크 지연을 고려하세요.

---

## 🧠 정리

| 단계          | 요약                       |
| ----------- | ------------------------ |
| VM 생성       | Multipass로 Ubuntu VM 띄우기 |
| Swap Off    | Kubernetes 요구 스왑 비활성화    |
| k3s 설치      | Master + Worker          |
| 토큰          | Master node-token 확보     |
| Worker Join | 토큰 + Master IP 활용        |
| kubectl     | kubeconfig로 원격 제어        |

---

## 📌 참고

k3s는 **lightweight Kubernetes**로, 실제 운영보다는 **개발/테스트/엣지 환경**에서 적합합니다.
멀티 VM 환경을 손쉽게 시도해보고 싶을 때 매우 유용합니다.

---
