---
title: "[Docker-Compose] Docker-Compose Command"
date: 2025-04-05
categories: [Docker, Docker-Compose]
tags: [docker, command, docker-compose]
---

## Version 확인

```bash
docker-compose --version
```

## Container를 생성 및 실행

- `-d` : 백그라운드 실행
- `--no-deps` : 링크 서비스 실행하지 않음
- `--build` : 이미지 빌드
- `-t` : 타임아웃을 지정(기본 10초)

```bash
docker-compose up [옵션] [서비스명]
```

> 특정 서비스들의 경우 백그라운드로 실행하지 않으면 Container가 생성 및 실행되며, 바로 종료될 수 있다.
{: .prompt-info }

## 현재 동작중인 Container들의 상태를 확인할 수 있다.

```bash
docker-compose ps
```

## Container들의 로그를 출력

```bash
docker-compose logs
```

## docker-compose up 명령어를 이용해 생성 및 실행된 Container에서 임의의 명령을 실행하기 위해 사용

- Container들을 모두 삭제할 경우 docker-compose start가 아닌, docker-compose up으로 다시 Container들을 생성 해주어야 한다.

```bash
docker-compose run
```

- 만약 특정 서비스에서 `/bin/bash`를 실행시켜 쉘 환경으로 진입하고 싶다면 아래와 같은 명령어를 이용하면 된다.
- 참고로 서비스명과 Container명은 다른거다.
- 서비스명은 docker-compose.yml의 services: 밑에 작성한 서비스 이름이다.

```bash
# docker-compose run [서비스명] [명령]
docker-compose run redis /bin/bash
```

## 여러개의 서비스 또는 특정 서비스를 시작 / 정지 / 일시정지 / 재시작을 할 수 있다.

```bash
# 서비스 시작
docker-compose start

# 서비스 정지
docker-compose stop

# 서비스 일시 정지
docker-compose pause

# 서비스 일시 정지 해제
docker-compose unpause

# 서비스 재시작
docker-compose restart
```

> 각각의 설정 뒤에 서비스명을 붙이면 특정 서비스만 제어할 수 있다.
```bash
docker-compose restart [서비스명]
```
{: .prompt-info }

## docker-compose로 생성한 Container들을 일괄 삭제 한다. (삭제 전, 관련 Container들을 종료 시켜두어야 한다.)

```bash
docker-compose rm
```

## 실행중인 Container를 강제로 정지 시킨다.

- `-s`옵션을 사용하여 시그널을 지정해줄 수 있는데, 아래 코드에서는 SIGINT를 사용 하였다. `-s` 옵션을 사용하지 않고 docker-compose kill만 사용할 경우 SIGKILL 이 전송된다.

- kill 뒤에 서비스를 지정하여 특정 서비스만 kill할 수 있다.

```bash
# docker-compose kill [옵션]
docker-compose kill -s SIGINT
```

## 네트워크 정보, 볼륨, Container들을 일괄 정지 및 삭제 처리한다.

```bash
docker-compose down
```

- 만약 `docker-compose down --rmi all` 명령을 사용한다면 모든 이미지까지 삭제한다.


## 서비스 프라이빗 포트 번호의 설정을 확인할 수 있다.

```bash
# docker-compose port [서비스명] [프라이빗 포트 번호]
docker-compose port nginx 80
```

## docker-compose 구성 파일의 내용을 확인할 수 있다. docker-compose.yml의 내용을 출력 해주므로 많이 쓸일은 없다.

```bash
docker-compose config
```