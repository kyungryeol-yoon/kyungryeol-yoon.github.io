---
title: "[Docker-Compose] Install Docker-Compose(1.27.4)"
date: 2021-02-02
categories: [Docker, Docker-Compose]
tags: [docker, install, docker-compose]
---

## Docker-Compose 설치하기

- curl 명령어를 통해 Docker-Compose를 설치
  ```bash
  sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  ```

> 다른 버전을 다운로드하고 싶을 경우, [GitHub에서 버전 확인](https://github.com/docker/compose/releases) 후 다운로드
{: .prompt-info }

## 다운로드한 Docker-Compose 파일을 실행 가능하도록 다운로드한 경로에 권한을 부여

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

## 심볼릭 링크 설정으로 path 경로를 아래와 같이 설정

```bash
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

## 정상적으로 설치되었는지 확인

```bash
docker-compose -v
```