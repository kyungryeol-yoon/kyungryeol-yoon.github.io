---
title: "[Docker] Dangling Image란? (Build 후 Repository:Tag 가 none 인 경우)"
date: 2021-01-23
categories: [Docker, Image]
tags: [Docker, Image, Dangling]
---

## Dangling Images

- Image를 사용중인 Container가 존재할 때 아래와 같이 docker rmi 명령어로 Image를 지우려 하면 다음과 같은 에러가 뜬다.

  ```bash
  docker rmi test

  Error response from daemon: conflict: unable to remove repository reference "test" (must force) - container 8bd39093b5cf is using its referenced image 83f310aba04a
  ```

- Image를 사용 중인 Container가 존재하므로 해당 Image를 삭제할 수 없다는 내용이다.

- 보통의 경우 Container를 먼저 삭제한 후 Image를 삭제한다.
- 이 경우 Image Layer 파일까지 삭제되는데, Image를 사용중인 Container가 있는 상황에서 -f 옵션을 추가해 Image를 강제로 삭제하게 되면 Image Layer 파일을 실제로 삭제하지 않고 Image 이름만 삭제하게 된다.
- 이를 Dangling Image 라고 부른다. 


### `docker rmi -f` 명령어로 Image를 강제로 삭제

  ```bash
  docker rmi -f test

  Untagged: test:latest
  ```

### `docker images` 명령어로 Image의 상태를 확인

  ```bash
  docker images

  REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
  <none>       <none>    83f310aba04a   4 hours ago   910MB
  ```

- 이처럼 Container가 사용 중인 Image를 강제로 삭제하면 Image의 이름이 <none>으로 변겅되며, 이를 Dangling Image라 부른다.

- Dangling Image는 다음과 같은 명령어를 사용해 별도로 확인할 수 있다.

  ```bash
  docker images -f dangling=true
  REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
  <none>       <none>    83f310aba04a   4 hours ago   910MB
  ```

## Solution 1. docker system prune

- [OPTIONS] `--a`, `-a`	: dangling된 것 뿐만 아니라, 모든 사용하지않는 Container 종료 및 Image 삭제

  ```bash
  docker system prune [OPTIONS]
  ```

## Solution 2. docker image prune

- Dangling Image 삭제

  ```bash
  docker image prune
  ```

## Solution 3. dangling images 전부 삭제

  ```bash
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
  ```

  ```bash
  docker images
  REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
  gitea/gitea   latest    203b931e8dab   6 weeks ago     148MB
  ubuntu        20.04     ba6acccedd29   2 months ago    72.8MB
  mariadb       10.4.11   bc20d5f8d0fe   23 months ago   355MB
  ```

## Solution 4. dangling image에 Repository Name 과 Tag를 정한 후 삭제

  ```bash
  docker tag 83ac flaskapi:v0.1
  ```

  ```bash
  docker images
  REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
  flaskapi      v0.1      83ac5b135a68   2 hours ago     105MB
  gitea/gitea   latest    203b931e8dab   6 weeks ago     148MB
  ubuntu        20.04     ba6acccedd29   2 months ago    72.8MB
  mariadb       10.4.11   bc20d5f8d0fe   23 months ago   355MB
  ```

  ```bash
  docker rmi flaskapi:v0.1
  ```

## Solution 5. Repo와 Tag가 <none>인 Image들 전부 삭제

  ```bash
  docker rmi $(docker images -a|grep "<none>"|awk '$1=="<none>" {print $3}')
  ```