---
title: "[Docker] Dockerfile 작성 및 명령어"
date: 2021-01-17
categories: [Docker, Dockerfile]
tags: [Docker, Dockerfile]
---

- **FROM** : Base Image
  - 어느 Image에서 시작할건지를 의미한다.
- **MAINTAINER** : Image를 생성한 개발자의 정보 (1.13.0 이후 사용 X)
- **LABEL** : Image에 메타데이터를 추가 (key-value 형태)
- **RUN** : 새로운 Layer에서 명령어를 실행하고, 새로운 Image를 생성한다.
  - RUN 명령을 실행할 때 마다 Layer가 생성되고 캐시된다.
  - 따라서 RUN 명령을 따로 실행하면 apt-get update는 다시 실행되지 않아서 최신 패키지를 설치할 수 없다.
  - 위 처럼 RUN 명령 하나에 apt-get update와 install을 함께 실행
- **WORKDIR** : 작업 Directory를 지정한다. 해당 Directory가 없으면 새로 생성한다.
  - 작업 Directory를 지정하면 그 이후 명령어는 해당 Directory를 기준으로 동작한다.
  - cd 명령어와 동일하다.
- **EXPOSE** : Dockerfile의 빌드로 생성된 Image에서 열어줄 포트를 의미한다.
  - 호스트 머신과 Container의 포트 Mapping시에 사용된다.
  - Container 생성 시 -p 옵션의 Container 포트 값으로 EXPOSE 값을 적어야한다.
- **USER** : Image를 어떤 계정에서 실행 하는지 지정
  - 기본적으로 root에서 해준다.
- **COPY / ADD** : build 명령 중간에 호스트의 파일 또는 폴더를 Image에 가져오는 것
  - ADD 명령문은 좀 더 파워풀한 COPY 명령문이라고 생각할 수 있다.
  - ADD 명령문은 일반 파일 뿐만 아니라 압축 파일이나 네트워크 상의 파일도 사용할 수 있다.
  - 이렇게 특수한 파일을 다루는 게 아니라면 COPY 명령문을 사용하는 것이 권장된다.
- **ENV** : Image에서 사용할 환경 변수 값을 지정한다.
  - path 등
- **CMD / ENTRYPOINT** : Container를 생성 및 실행 할 때 실행할 명령어
  - 보통 Container 내부에서 항상 돌아가야하는 서버를 띄울 때 사용한다.
  - **CMD**
    - Container를 생성할 때만 실행됩니다. (`docker run`)
    - Container 생성 시, 추가적인 명령어에 따라 설정한 명령어를 수정할 수 있다.
  - **ENTRYPOINT**
    - Container를 시작할 때마다 실행됩니다. (`docker start`)
    - Container 시작 시, 추가적인 명령어 존재 여부와 상관 없이 무조건 실행된다.
  - **명령어 형식**
    - CMD ["<Command>", "<Parameter1>", "<Parameter2>"]
    - CMD <Command> <Parameter1> <Parameter2>
    - ENTRYPOINT ["<Command>", "<Parameter1>", "<Parameter2>"]
    - ENTRYPOINT <Command> <Parameter1> <Parameter2>