---
title: "[Docker-Compose] Install Docker-Compose(2.33.1)"
date: 2025-03-12
categories: [Docker, Docker-Compose]
tags: [docker, install, docker-compose]
---

## 도커 (Docker) 설치
 
### 시스템 업데이트

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
```

### 의존성 패키지 설치

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```

### 도커 GPG 키 추가

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 도커 레포지토리 설정

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 도커 설치

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```

### 도커 시작 및 활성화

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 도커 상태 확인

```bash
sudo systemctl status docker
```

## 도커 컴포즈 (Docker-Compose) 설치

### 도커 컴포즈 다운로드 및 설치

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.33.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

### 도커 컴포즈 실행 권한 부여

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

### 도커 컴포즈 설치 확인

```bash
docker-compose --version
```

## 도커 컴포즈 CURL 오류 발생 시

- 우분투 22.04 서버에서 도커 컴포즈 `CURL` 설치 시 아래와 같은 오류가 발생하는 경우가 있다.

### 오류 코드를 살펴보면 아래와 같다.

```bash
Failed to create the file /usr/local/bin/docker-compose: No such file or directory
curl: (23) Failure writing output to destination 오류 발생
```
 
- 위 오류는 설치하려는 대상 디렉토리인 `/usr/local/bin` 폴더가 없어서 나는 오류이므로 폴더를 만들어주면 간단히 해결된다.

### `/usr/local/bin` 폴더 생성

```bash
sudo mkdir -p /usr/local/bin
```

- 이후 다시 `CURL` 명령어를 실행하면 잘 설치가 된다.

### 도커 권한 부여

- 도커를 `sudo` 없이 실행시키려면 아래 명령어를 통해 모든 유저가 도커에 접근할 수 있도록 해주면 된다.

  ```bash
  sudo chmod 666 /var/run/docker.sock
  ```

- 위 명령어를 실행하면 `super user`가 아니더라도 `sudo` 없이 실행할 수 있다.