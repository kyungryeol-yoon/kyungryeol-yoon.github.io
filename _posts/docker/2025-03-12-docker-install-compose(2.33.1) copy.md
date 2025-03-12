---
title: "[Docker-Compose] Install Docker-Compose(2.33.1)"
date: 2025-03-12
categories: [Docker, Docker-Compose]
tags: [docker, install, docker-compose]
---

## Install using the repository

### For Ubuntu and Debian

```bash
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### For RPM-based distributions

```bash
sudo yum update
sudo yum install docker-compose-plugin
```

### 설치 확인

```bash
docker compose version
```

### Update Docker Compose

#### For Ubuntu and Debian

```bash
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

#### For RPM-based distributions

```bash
sudo yum update
sudo yum install docker-compose-plugin
```

## Install the plugin manually

### curl 명령어를 통해 Docker-Compose를 설치

```bash
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.33.1/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
```

> 다른 버전을 다운로드하고 싶을 경우, [GitHub에서 버전 확인](https://github.com/docker/compose/releases) 후 다운로드
{: .prompt-info }

### 다운로드한 Docker-Compose 파일을 실행 가능하도록 권한 부여

```bash
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# if you chose to install Compose for all users:
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### 설치 확인

```bash
docker compose version
```