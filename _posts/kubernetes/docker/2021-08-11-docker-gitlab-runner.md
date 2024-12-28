---
title: "[Gitlab] Gitlab Runner"
date: 2021-08-11
categories: [Docker, Gitlab]
tags: [Docker, Gitlab, Runner]
---

## GitLab Runner 설치

- GitLab Runner 작업 디렉토리 (Working directory)와 데이터를 영속적(Persistent)으로 저장하기 위한 바인드 마운트(Bind mount)용 디렉토리를 생성
    ```bash
    sudo mkdir -p /data/gitlab-runner/config && cd /data/gitlab-runner
    ```

- `gitlab-runner` 디렉토리의 소유권을 `$USER`로 변경하고 권한을 변경
    ```bash
    sudo chown -R $USER:$USER /data/gitlab-runner
    ```

- docker-compose.yml 파일을 생성
    ```yaml
    version: '3.9'
    services:
    gitlab-runner:
        image: 'gitlab/gitlab-runner:v17.6.1'
        container_name: gitlab-runner
        restart: always
        volumes:
        - './config:/etc/gitlab-runner'
        - '/var/run/docker.sock:/var/run/docker.sock'
    ```

## GitLab Runner 시작
- `docker-compose up -d` 명령을 실행하여 Runner를 시작


## GitLab Runner 등록

- GitLab UI에는 액세스 할 사용자에 따라 세 가지 유형의 Runner가 있다.
    - 공유 러너는 GitLab 인스턴스의 모든 그룹 및 프로젝트에서 사용할 수 있다. (Admin Area의 **CI/CD > Runners**)
    - 그룹 러너는 그룹의 모든 프로젝트와 하위 그룹에서 사용할 수 있다. (그룹의 **Settings > CI/CD > Runners 섹션**)
    - 특정 러너는 특정 프로젝트와 연결됩니다. 일반적으로 특정 러너는 하나의 프로젝트에서만 사용된다. (프로젝트의 **Settings > CI/CD > Runners** 섹션)
- 여기에서는 **공유 러너(Shared runner)** 를 등록하는 방법을 설명 (Admin 권한 필요)

### GitLab Admin Area 페이지로 이동한다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step1.png)

### 사이드 바에서 CI/CD > Runners를 클릭한다. 이후 New instance runner 를 클릭한다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step2.png)

### 태그 없이 Runner을 사용하기 위해 Run untaged jobs 를 체크한다. 이후 Create runner 를 클릭하여 러너를 생성한다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step3.png)

### Step1 의 명령어를 복사한다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step4.png)

```bash
gitlab-runner register  --url http://192.168.0.54  --token glrt-t1__YKDoWm-di4smDhcNoCX
```

### gitlab-runner 컨네이너에 대화형(interactive) bash 셸을 실행

```bash
docker exec -it gitlab-runner bash
```

### `gitlab-runner register ~` 명령을 실행하고 지침에 따라 아래 항목을 입력

- Enter the GitLab instance URL : 아무것도 입력하지 않고 Enter 키를 누른다. `--url` 값이 설정된다.
- Enter the registration token : 아무것도 입력하지 않고 Enter 키를 누른다. `--token` 값이 설정된다.
- Enter a description for the runner : 러너에 대한 설명을 입력하고 Enter 키를 누른다. (예: `docker runner`)
- Enter tags for the runner : 아무것도 입력하지 않고 Enter 키를 누른다.
- Enter an executor : `docker`을 입력하고 Enter 키를 누른다.
- Enter the default Docker image : `alpine:latest`을 입력하고 Enter 키를 누른다.

```bash
ubuntu@mp-repo:/data/gitlab-runner$ sudo docker exec -it gitlab-runner bash
root@183e583bf883:/# gitlab-runner register  --url http://192.168.0.54  --token glrt-t1_bkEhznhp1Qbdow6o44TK
Runtime platform                                    arch=amd64 os=linux pid=52 revision=6826a62f version=17.6.1
Running in system-mode.

Enter the GitLab instance URL (for example, https://gitlab.com/):
[http://192.168.0.54]:
Verifying runner... is valid                        runner=t1_bkEhzn
Enter a name for the runner. This is stored only in the local config.toml file:
[183e583bf883]: docker runner
Enter an executor: shell, docker-windows, docker+machine, kubernetes, docker-autoscaler, instance, custom, ssh, parallels, virtualbox, docker:
docker
Enter the default Docker image (for example, ruby:2.7):
alpine:latest
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!

Configuration (with the authentication token) was saved in "/etc/gitlab-runner/config.toml"
```

- 정상적으로 등록이 완료되면 You’ve created a new runner! 문구가 나타난다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step5.png)

### CI/CD > Runners 페이지에서 GitLab UI를 새로고침하면 등록된 러너가 목록에 나타난다.

![](/images/kubernetes/docker/gitlab/gitlab-runner-step6.png)

## Gitlab 웹에서 프로젝트 CI/CD 설정

- CI/CD 조건 활성화
    - Settings ▶ General ▶ Visibility, project features, permissions으로 이동 ▶ CI/CD 조건 활성화

- 공유러너 비활성화
    - Settings > CI/CD > Runners > Shared runners 비활성화

## Gitlab-runner 설치 및 설정

- Gitlab-runner DinD(Docker in Docker) 방식 사용
- 원하는 Directory에서 아래와 같이 gitlab-runner 폴더 생성 후 하위에 config 폴더 생성
    ```bash
    sudo mkdir gitlab-runner
    cd gitlab-runner
    sudo mkdir config
    ```

- gitlab-runner 폴더 하위에 docker-compose.yml 파일 생성
    - docker-compose.yml
        ```yaml
        version: '3.9'
        services:
        gitlab-runner:
            container_name: gitlab-runner
            image: gitlab/gitlab-runner:latest
            restart: always
            volumes:
            - ./config:/etc/gitlab-runner
            - /var/run/docker.sock:/var/run/docker.sock
        ```

- gitlab-runner Docker Container 실행
    ```bash
    docker-compose up -d
    ```

- gitlab-runner Docker Container 실행 확인
    ```bash
    docker container ls or docker ps
    ```








