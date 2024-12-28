---
title: "[Docker-Compose] Gitlab"
date: 2021-04-11
categories: [Docker, Gitlab]
tags: [Docker, Gitlab, Docker-Compose]
---

## GitLab Docker 이미지

- GitLab Docker Image는 단일 Container에서 필요한 모든 서비스를 실행하는 GitLab의 모놀리식(Monolithic) Image

- [GitLab CE Docker image](https://hub.docker.com/r/gitlab/gitlab-ce/)
- [GitLab EE Docker image](https://hub.docker.com/r/gitlab/gitlab-ee/)

## 설치 디렉토리 생성

```bash
sudo mkdir -p /data/gitlab && cd /data/gitlab
sudo mkdir data logs config
```

- `data` (`/var/opt/gitlab`) : 애플리케이션 데이터 저장용
- `logs` (`/var/log/gitlab`) : 로그 저장용
- `config` (`/etc/gitlab`) : GitLab 구성 파일 저장용

### Gitlab 디렉토리의 소유권을 $USER로 변경

```bash
sudo chown -R $USER:$USER /data/gitlab
```

### 권한을 변경

```bash
sudo chmod -R 755 /data/gitlab
```

## `docker-compose.yml` or `docker-compose_gitlab` 파일 준비

- GitLab 작업 디렉토리(예: `/data/gitlab/`)에 `docker-compose.yml` 파일을 생성
    ```bash
    vi docker-compose.yml
    ```

- `hostname`과 `external_url`은 설치할 서버의 IP 또는 도메인으로 반드시 수정
    ```yaml
    version: '3.9'

    services:
    gitlab:
        image: 'gitlab/gitlab-ce:17.6.2-ce.0' or 'gitlab/gitlab-ee:17.7.0-ee.0'
        container_name: gitlab
        restart: always
        hostname: 'gitlab.local'
        environment:
        GITLAB_OMNIBUS_CONFIG: |
            external_url 'http://192.168.0.54:80'
            # gitlab_rails['gitlab_shell_ssh_port'] = 8022
            # Add any other gitlab.rb configuration here, each on its own line
        TZ: 'Asia/Seoul'
        ports:
        - '80:80'
        - '443:443'
        - '10022:22'
        volumes:
        - './.gitlab/config:/etc/gitlab'
        - './.gitlab/logs:/var/log/gitlab'
        - './.gitlab/data:/var/opt/gitlab'
    #     networks:
    #       - gitlab_net

    # networks:
    #   gitlab_net:
    #     driver: bridge
    ```

## GitLab 시작

- 아래 명령어 실행 (작업 Directory에 파일이 있는지 확인)
    ```bash
    docker-compose up -d
    ```
    ```bash
    docker-compose -f docker-compose_gitlab.yaml up -d
    ```

## GitLab 구동 로그를 확인

```bash
docker-compose logs -f
```

## Docker Container 목록 확인

```bash
docker-compose ps
```
```bash
docker ps -a
```

## GitLab `root` 계정의 초기 패스워드를 확인

```bash
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```
```bash
cat initial_root_password
```