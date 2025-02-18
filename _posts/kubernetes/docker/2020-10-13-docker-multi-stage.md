---
title: "[Docker] Docker Multi Stage란?"
date: 2020-10-13
categories: [Docker, Dockerfile]
tags: [Docker, Multi Stage]
---

## Docker Multi Stage란?

- Container Image를 만들면서 Build 등에는 필요하지만 최종 Container Image에는 필요 없는 환경을 제거할 수 있도록 단계를 나누어서 기반 Image를 만드는 방법

### Background

- Docker가 등장한 이후 Docker Image를 작게 만들기 위한 노력들이 있었다.
  - Image가 작으면 작을 수록 Build, 배포 시간이 짧아 지기 때문이이다.
- 각각의 Instruction들은 Dockerfile 하나의 Layer로 추가가 되기 때문에 여러가지 최적화가 필요했다.
- Docker Image를 가볍게 만들기 위해 나온 방법이 Multi Stage 방식이이다.

### Multi Stage build 방식이 나오기 전에

- builder-pattern을 활용했다.
  - 하나의 Dockerfile이 아닌 두 가지의 Dockerfile을 유지하는 것이이다.
- `Dockerfile.build`
  - 여러 명령어를 실행하는 데 분리하지 않고 `&&` `\`를 통해 하나의 Layer에서 처리할 수 있다.
  - Build를 위한 Image이이다.

```dockerfile
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-counter/
COPY app.go .
RUN go get -d -v golang.org/x/net/html \ -> 하나의 Layer에서 명령어를 처리하기 위한 최적화
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```

- Dockerfile
  - 어플리케이션을 실행하기 위한 Dockerfile

```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY app .
CMD ["./app"]
```

- build.sh
  - Multi stage를 지원하기 전에는 이렇게 따로 스크립트를 작성해야 했다.

```bash
#!/bin/sh
echo Building alexellis2/href-counter:build

# build image
docker build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy \
    -t alexellis2/href-counter:build . -f Dockerfile.build

docker container create --name extract alexellis2/href-counter:build
docker container cp extract:/go/src/github.com/alexellis/href-counter/app ./app
docker container rm -f extract

echo Building alexellis2/href-counter:latest

# run app
docker build --no-cache -t alexellis2/href-counter:latest .
rm ./app
```

### Multi Stage가 등장하면서

- 하나의 Dockerfile로 Build Image와 실행 Image를 분리할 수 있게 되어 훨씬 간편하게 Image를 줄일 수 있게 되었다.
  - 뿐만 아니라 배포 Image의 용량이 줄어 Build 시간이 감소하게 되었다.

```dockerfile
FROM golang:1.7.3 AS builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]
```