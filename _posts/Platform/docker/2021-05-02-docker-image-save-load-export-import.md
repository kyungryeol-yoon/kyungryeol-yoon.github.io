---
title: "[Docker] Docker Image Save & Load, Export & Import"
date: 2021-05-02
categories: [Docker, Image]
tags: [docker, image, save, load, export, import]
---

- Docker를 tar 파일로 저장하는 데는 save, export 두 가지 명령어가 있다.
- 추출한 tar 파일을 Docker Image로 저장하는 데는 load, import 두 가지 명령어가 있다.
- save로 저장한 tar 파일은 load를 사용하고, export로 저장한 tar 파일은 import를 사용한다.

## Docker save (docer image → tar file)

- 저장할 파일명을 지정하는 옵션은 -o 를 사용한다

  ```bash
  docker save [옵션] <파일명> [Image명]
  ```

  ```bash
  sudo docker save -o file_name.tar image_name
  ```

  ```bash
  sudo docker save -o $(pwd)/test-api.tar test-api:latest
  sudo docker save -o $(pwd)/mongo.tar mongo:4.2
  sudo docker save -o $(pwd)/redis.tar redis:7.0
  sudo docker save -o $(pwd)/mysql.tar mysql:8.0
  ```

## Docker load (tar file → docker image)

- tar파일로 만들어진 Image를 다시 docker image로 되돌리기 위해서는 docker load Command를 사용한다.

  ```bash
  docker load -i [tar 파일명]
  ```

  ```bash
  sudo docker load -i file_name.tar
  ```

  ```bash
  sudo docker load -i test-api.tar && sudo docker load -i mongo.tar && sudo docker load -i mysql.tar && sudo docker load -i redis.tar
  ```

## Docker export (docker container → tar file)

- docker는 Image 뿐 아니라 container를 tar파일로 저장하는 명령어를 제공한다.

  ```bash
  docker export <Container Name or Container ID> > [tar 파일명]
  ```

  ```bash
  sudo docker export -o file_name.tar image_name
  ```

## Docker import (tar file → docker image)

- export Command를 통해 만들어진 tar 파일을 다시 docker image로 생성하는 명령어이다.

  ```bash
  docker import <파일 or URL> - [image name[:tag name]]
  ```

  ```bash
  sudo docker import file_name.tar image_name
  ```

> root 권한으로 실행하지 않을 경우, 액세스 권한이 없는 파일들이 포함되지 않는 문제가 발생할 수 있다.
{: .prompt-info }

## Export & Import 와 Save & Load의 차이

- docker export의 경우 Container를 동작하는데 필요한 모든 파일이 압축된다.
- 즉, tar파일에 Container의 Root 파일시스템 전체가 들어있는 것이다.
- 반면에 docker save는 Layer 구조까지 포함한 형태로 압축이 된다.

- 즉, 기반이 되는 Image가 같더라도 export와 save는 압축되는 파일 구조와 Directory가 다르다.
- 결론은 export를 통해 생성한 tar 파일은 import로, save로 생성한 파일은 load로 Image화 해야 한다.