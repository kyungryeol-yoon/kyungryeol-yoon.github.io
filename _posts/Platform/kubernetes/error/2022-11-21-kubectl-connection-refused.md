---
title: "[Kubernetes] kubectl Connection Refused 문제 분석 및 해결"
date: 2022-11-21
description: "Windows 환경에서 Ubuntu Multipass를 이용해 k3s 기반 Kubernetes 클러스터를 구축하는 실전 설치 가이드"
categories: [Kubernetes, Error]
tags: [kubernetes, troubleshooting, containerd, connection refused]
---

## 🧪 문제 발생 환경

- Ubuntu 22.04 (VirtualBox VM)
- Kubernetes: kubeadm 기반 설치
- Kubernetes v1.25.x
- containerd v1.6.x
- CNI: Weave Net
- Swap off, Firewall off

Master / Worker 노드 join은 정상적으로 완료된 상태였습니다.

---

## 🔍 문제 증상 분석

### 1️⃣ kube-system 컴포넌트 CrashLoopBackOff

`kube-system` 네임스페이스의 일부 컴포넌트가 반복적으로 재시작되었습니다.

kube-proxy 로그에서 다음과 같은 메시지가 확인되었습니다.

```

dial tcp <IP>:6443: connect: connection refused

```

이는 kube-proxy가 API Server에 연결하지 못하고 있다는 의미입니다.

---

### 2️⃣ 노드 IP 감지 오류 의심

로그 중 다음 메시지도 확인되었습니다.

```

Can't determine this node's IP, assuming 127.0.0.1

```

IP 인식 문제를 의심했으나, admin.conf 및 API Server 설정을 점검해도 해결되지 않았습니다.

---

### 3️⃣ Proxy Mode / Dual Stack 이슈 검토

```

Unknown proxy mode, assuming iptables proxy
kube-proxy running in dual-stack mode

```

IPv6 또는 proxy-mode 설정 문제도 의심했지만 직접적인 원인은 아니었습니다.

---

### 4️⃣ OOM 여부 확인

Memory 부족으로 프로세스가 종료되는지 확인했으나 OOM 로그는 발견되지 않았습니다.

---

## 🧠 최종 원인

문제의 핵심은 **containerd와 kubelet 간 cgroup driver 불일치**였습니다.

Ubuntu 22.04 기본 containerd 설정은 다음과 같습니다.

```

SystemdCgroup = false

```

하지만 kubelet은 systemd cgroup을 사용하는 경우가 많습니다.  
이 설정 불일치로 인해 kubelet ↔ container runtime 간 충돌이 발생하면서 API Server 연결이 불안정해진 것으로 보입니다.

---

## ✅ 해결 방법

### 1️⃣ containerd 설정 수정

```bash
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd
```

수정 후 kubelet도 재시작합니다.

```bash
sudo systemctl restart kubelet
```

---

### 2️⃣ 네트워크 브리지 설정 (필요 시)

```bash
sudo modprobe br_netfilter
echo 1 | sudo tee /proc/sys/net/bridge/bridge-nf-call-iptables
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
```

---

## 📊 해결 후 확인

```bash
kubectl get nodes
```

정상 출력:

```
NAME      STATUS   ROLES           VERSION
master    Ready    control-plane   v1.25.x
worker1   Ready    <none>          v1.25.x
```

이후 `kubectl` connection refused 오류는 더 이상 발생하지 않았습니다.

---

## 🧠 개발자 관점 정리

| 구분                 | 원인                       | 해결                   |
| ------------------ | ------------------------ | -------------------- |
| API Server 연결 실패   | containerd cgroup 설정 불일치 | SystemdCgroup = true |
| CrashLoopBackOff   | Runtime 충돌               | containerd 재설정       |
| Ubuntu 22.04 기본 설정 | Kubernetes와 비호환 가능성      | 설정 수정 또는 버전 조정       |

---

## 🏁 마무리

Ubuntu 22.04 + containerd + kubeadm 조합에서는
**cgroup driver 설정을 반드시 확인해야 합니다.**

Kubernetes 트러블슈팅 시에는:

1. kube-system 로그 확인
2. container runtime 설정 점검
3. cgroup driver 일치 여부 확인

이 3가지를 우선 체크하는 것이 좋습니다.

---
