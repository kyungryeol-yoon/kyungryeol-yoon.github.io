---
title: "[Ubuntu] Install containerd on Ubuntu 22.04"
date: 2022-03-23
description: "Ubuntu 22.04 서버에 containerd 컨테이너 런타임을 설치하고 Kubernetes 환경에 맞게 설정하는 과정입니다."
categories: [OS, Linux]
tags: [ubuntu, containerd, kubernetes, runtime]
---

# containerd 설치 – Ubuntu 22.04

containerd는 컨테이너의 라이프사이클(이미지 다운로드, 네트워크, 컨테이너 실행 등)을 관리하는 런타임입니다. Kubernetes에서는 기본 컨테이너 런타임으로 containerd를 사용합니다.

아래 절차는 Ubuntu 22.04 기준이며 Kubernetes 등 컨테이너 오케스트레이션 환경에서 흔히 사용하는 설치 방법입니다.

---

## 사전 요구사항

- Ubuntu 22.04 LTS
- sudo 권한 사용자
- 인터넷 연결

---

## 1) 패키지 준비 & Docker 저장소 추가

APT로 containerd를 설치하기 위해 Docker 저장소를 추가합니다.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
````

그 다음 Docker 공식 GPG 키를 추가하고 저장소를 등록합니다:

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

---

## 2) containerd 설치

Docker 저장소를 추가한 후, `containerd.io` 패키지를 설치합니다.

```bash
sudo apt update
sudo apt install -y containerd.io
```

설치 후 서비스 상태를 확인합니다:

```bash
sudo systemctl status containerd
```

서비스가 **active (running)** 상태면 정상입니다.

---

## 3) containerd 기본 설정 파일 생성

Kubernetes와 호환되도록 기본 설정 파일을 생성합니다.

```bash
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
```

생성된 `/etc/containerd/config.toml`에서 `SystemdCgroup` 값을 **true**로 설정합니다. 이는 cgroup 드라이버를 systemd로 맞추기 위함입니다.

```bash
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

설정 완료 후 containerd를 재시작합니다.

```bash
sudo systemctl restart containerd
```

---

## 4) 설치 확인

containerd 소켓과 상태를 확인합니다.

```bash
ls -l /var/run/containerd/containerd.sock
sudo systemctl status containerd
```

정상적으로 실행 중이라면 해당 런타임을 Kubernetes에서 사용할 준비가 된 것입니다.

---

## 장점 및 고려사항

* containerd는 Docker보다 **가볍고 Kubernetes 친화적**입니다.
* Ubuntu 22.04 기본 패키지 버전이 Kubernetes 요구 버전보다 낮은 경우가 있어, Docker 저장소에서 설치하는 것이 안정적이라는 경험이 있습니다 (예: containerd 1.6 이상)

---

## 요약

Ubuntu 22.04에 containerd를 설치하고 Kubernetes 환경에 맞게 설정하는 과정은 다음과 같습니다.

1. Docker 저장소 추가
2. containerd 설치
3. config.toml 생성 및 SystemdCgroup 활성화
4. 서비스 재시작 및 상태 확인

이제 이 노드에서 컨테이너를 실행하거나 Kubernetes 클러스터 환경을 구성할 준비가 되었습니다.

```

---

### 정리 체크포인트

✔ Docker 저장소 추가를 통해 최신 `containerd.io` 설치  
✔ `SystemdCgroup=true` 설정으로 Kubernetes 호환성 확보  
✔ Ubuntu 22.04 환경에 맞춘 기본 설치 가이드

---
