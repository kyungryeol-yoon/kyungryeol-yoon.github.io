---
title: "[Docker-Compose] Install Harbor"
date: 2021-09-19
categories: [DevOps, Harbor]
tags: [docker, install, harbor, docker-compose]
---

> [Docker-Compose 설치 참고](https://kyungryeol-yoon.github.io/posts/docker-install-compose/)
{: .prompt-info }

## Harbor

- 기존 docker-registry와는 달리 policy와 role 기반으로 access를 제어(RBAC)하는 것이 가능하다는 점이 가장 큰 특징
- 또한 Harbor가 보관하고 있는 이미지의 취약성 등을 체크하여 해당 이미지가 신뢰할 수 있는 것인지 증빙해주는 역할도 수행
- 그리고 Container Image만 보관할 수 있는 것이 아니라, Helm Package와 Cloud Native Application Bundle이라 하는 CNAB 패키지도 보관할 수 있다.
- 또한 자체 WEB UI도 제공하여 관리가 편리하다는 장점이 있다.
  - 물론 기존에도 docker-registry 용 UI container를 구성하여 이용하고는 있었지만, 특정 이미지가 Registry에 보관되어 있는지 등을 확인하는 정도로만 사용할 수 있어서 그 활용도가 굉장히 제한적이었다.

## 인증기관 인증서 생성 - CA Certificates 생성

- 실제 RootCA (신뢰할 수 있는 루트 인증 기관)를 사용하는게 아니라면, 직접 CA (인증 기관)를 생성하여 Server의 인증서가 안전하다고 인증해주어야 한다.
- 따라서 아래의 명령어로 개인용 Root CA 역할을 할 CA.key를 생성하고, CA.key의 짝이 되는 CA.crt 공개키를 생성한다.

- Root CA의 비밀키 생성
  ```bash
  openssl genrsa -out ca.key 4096
  ```

- Root CA의 비밀키와 짝지을 공개키 생성
  ```bash
  openssl req -x509 -new -nodes -sha512 -days 3650 -key ca.key -out ca.crt
  openssl req -x509 -new -nodes -sha512 -days 3650 -subj "<원하는 도메인 명>" -key ca.key -out ca.crt
  ```

## 서버인증서 생성 - Server Certificates 생성

- 서버의 인증서를 생성한다.
- Root CA의 비밀키와 공개키를 만들 때와 마찬가지로 서버의 비밀키를 생성하고, 생성한 비밀키를 넣어 CSR 파일을 생성한다.
- CSR 파일은 Certificate Signing Request 파일로, 인증서를 발급하기 위해 필요한 정보를 담고 있는 데이터이다.
- CSR 파일은 SSL 발급을 신청하기 위해 해당 파일 내용을 Root CA에 제출하는 용도로 사용하게 된다.

- Server Key 생성
  ```bash
  openssl genrsa -out server.key 4096
  openssl genrsa -out <원하는 도메인 명>.key 4096
  ```

- Server의 csr 파일 생성
  ```bash
  openssl req -sha512 -new -key server.key -out server.csr
  openssl req -sha512 -new -subj "/C=KR/ST=Seoul/L=Seoul/O=example/OU=Personal/CN=<원하는 도메인 명>" -key <원하는 도메인 명>.key -out <원하는 도메인 명>.csr
  ```

## 설정 파일 생성 - SAN 등록

- 이제 위에서 생성한 서버의 CSR 파일을, 직접 만든 Root CA에 인증해달라고 요청하는 작업을 수행한다.
- CSR 파일을 가지고 서버의 인증키를 생성하게 된다.

- vi v3.ext
  ```
  authorityKeyIdentifier=keyid,issuer
  basicConstraints=CA:FALSE
  keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
  extendedKeyUsage = serverAuth
  subjectAltName = @alt_names

  [alt_names]
  IP.1=192.168.0.54 # (인증서를 사용할 서버 IP 입력)
  IP.2=127.0.0.1
  # DNS.1=<원하는 도메인명>
  # hostname=<원하는 호스트명>
  ```

### 위 작업 수행 이후, SAN(Subject Alternative Name) 등록하는 작업 수행

```bash
openssl x509 -req -sha512 -days 3650 -extfile v3.ext  -CA ca.crt -CAkey ca.key -CAcreateserial -in server.csr -out server.crt
```

```bash
openssl x509 -req -sha512 -days 3650 -extfile v3.ext -CA ca.crt -CAkey ca.key -CAcreateserial -in <원하는 도메인 명>.csr -out <원하는 도메인 명>.crt
```

## Certificate 업데이트

- Docker에서는 .crt 파일을 CA (인증 기관)의 인증서라고 간주한다.
- 서버의 인증서라는 것을 표현하고 싶다면 .crt 형식이 아닌 .cert 형식으로 변환해주어야 한다.
- 따라서 server.crt 파일을 server.cert 파일로 변환한다.
  ```bash
  openssl x509 -inform PEM -in server.crt -out server.cert
  ```

- 만들어진 인증서 파일들을 Docker와 Host에 등록(아래에서 한번 더 설명), 업데이트하는 작업을 수행한다.
- host의 이름을 server라고 했으므로, `/certs.d/server`로 생성

- 폴더 생성
  ```bash
  sudo mkdir -p /etc/docker/certs.d/server
  ```

```bash
# Docker
cp server.cert /etc/docker/certs.d/server/
cp server.key /etc/docker/certs.d/server/
cp ca.crt /etc/docker/certs.d/server/

# Host
sudo cp ca.crt /usr/local/share/ca-certificates/harbor-ca.crt
sudo cp server.crt /usr/local/share/ca-certificates/harbor-server.crt
sudo update-ca-certificates
```

### 특정 도메인으로 생성할 때

```bash
# Docker
cp <원하는 도메인 명>.cert /etc/docker/certs.d/<원하는 도메인 명>/
cp <원하는 도메인 명>.key /etc/docker/certs.d/<원하는 도메인 명>/
cp <원하는 도메인 명>.crt /etc/docker/certs.d/<원하는 도메인 명>/

# Host
sudo cp ca.crt /usr/local/share/ca-certificates/harbor-ca.crt
sudo cp <원하는 도메인 명>.crt /usr/local/share/ca-certificates/harbor-server.crt
sudo update-ca-certificates
```

## Docker 재시작

```bash
systemctl restart docker
```

## Harbor package 다운로드

- Harbor는 Offline Install과 Online Install 두 가지 방식으로 설치를 지원하고 있다.

```bash
wget https://github.com/goharbor/harbor/releases/download/v2.12.1/harbor-offline-installer-v2.12.1.tgz  # habor 다운

tar xvzf harbor-offline-installer-v2.12.1.tgz # 압축해제
```

## harbor.yml 작성

- 기본적으로 Directory 내에는 harbor.yml.tmpl 파일이 존재
- 이 파일의 이름을 harbor.yml로 수정하고 내용을 필요에 맞게 수정
  ```bash
  cp harbor.yml.tmpl harbor.yml
  ```

- vi harbor.yml
  ```yml
  # 아래 내용 수정
  hostname: reg.mydomain.com      # IP주소로 수정 (예시, 192.168.X.X)

  # http related config
  http:
  # port for http, default is 80. If https enabled, this port will redirect to https port
  port: 8000

  # https related config
  https:
  # https port for harbor, default is 443
  port: 8443
  # The path of cert and key files for nginx
  certificate: /your/certificate/path       # server.cert로 수정 (예시, /etc/docker/certs.d/server/server.cert)
  private_key: /your/private/key/path       # server.key로 수정 (예시, /etc/docker/certs.d/server/server.key)
  # enable strong ssl ciphers (default: false)
  # strong_ssl_ciphers: false

  ..
  ..

  harbor_admin_password: Harbor12345       # admin 로그인 비밀번호 수정
  ```

## Deploy

- 위 문단에서 작업한 harbor.yml의 작성이 끝나면, Harbor 설치의 사전 작업을 수행하는 prepare 스크립트를 실행
- prepare 스크립트는 결과적으로 prepare 컨테이너를 생성
  ```bash
  sudo ./prepare
  sudo ./install.sh
  ```

### 다른 방법으로는

```bash
sudo ./prepare
```

- 정상적으로 Script가 돌아가면 docker-compose.yml 파일이 생성
  ```bash
  docker compose up -d
  ```

## Repository Login 및 Image Upload

```bash
docker login ip:8443
```

- 이미지를 저장소로 push하기 위해서는 login이 되어야 한다.
- 아래와 같이 새 저장소 서버에 로그인을 해보면 인증서 fail 에러가 남을 볼 수 있다.
  ```bash
  Error response from daemon: Get "https://192.168.0.54:8443/v2/": tls: failed to verify certificate: x509: certificate signed by unknown authority
  ```

- 현재 서버에 사용했던 인증서가 docker 실행 wsl 리눅스 상에 install되어 있지 않기 때문이다.
- 위에서 서버에 사용하기 위해 생성한 crt 인증서 파일을 아래 위치에 복사하고 update-ca-certificates 명령으로 적용한 후 docker, harbor를 재시작 하면 정상적으로 로그인 됨을 볼 수 있다.

### 인증 방법

```bash
# Host
sudo cp ca.crt /usr/local/share/ca-certificates/harbor-ca.crt
sudo cp server.crt /usr/local/share/ca-certificates/harbor-server.crt
sudo update-ca-certificates
```

```bash
sudo docker-compose down -v
```

```bash
sudo systemctl restart docker.service
```

```bash
sudo docker-compose up -d
```

```bash
sudo docker login 192.168.0.54:8443
Username: admin
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

### 인증 Skip

#### docker

- 만약 /etc/docker Directory에 daemon.json 파일이 없는 경우 새롭게 생성
- vi /etc/docker/daemon.json (아래 insecure 입력)
  ```json
  {
      "insecure-registries": ["192.168.0.54:8443"]
  }
  ```

- Docker Restart
  ```bash
  sudo systemctl restart docker
  ```

- Repository Login 
  ```bash
  sudo docker login 192.168.0.54:8443
  ```

- Docker Tag
  ```bash
  sudo docker tag gitlab/gitlab-ce:17.6.2-ce.0 192.168.0.54:8443/mgmt-system/gitlab/gitlab-ce:17.6.2-ce.0
  ```

- Docker 확인
  ```bash
  sudo docker images
  ```

- Docker Push
  ```bash
  sudo docker push 192.168.0.54:8443/mgmt-system/gitlab/gitlab-ce:17.6.2-ce.0
  ```

- Web Page에서 확인
  ![](/images/kubernetes/docker/harbor/docker-harbor-3.png)

#### containerd

- private registry dns name `/etc/hosts` 등록
  ```
  172.x.x.x   harbor.kryoon.io
  ```

- config.toml 파일 확인
- containerd 설정 파일을 확인 해줍니다.

- `/etc/containerd/config.toml` 에 주로 있지만, 혹시 파일이 없다면

- `containerd config default > /etc/containerd/config.toml` 명령어를 통해 생성해줍니다.

- private registry 주소 등록
- `[plugins."io.containerd.grpc.v1.cri".registry.mirrors]` 아래에 registry 주소 추가

```
ex)
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."<private-registry 주소>"]
    endpoint = ["https://<private-registry 주소>"]
```

- tls 설정 제외
- 원래라면 https 인증이 필요하지만 cert가 없어도 이미지를 받을 수 있게 설정해보도록 하겠습니다.

- `[plugins."io.containerd.grpc.v1.cri".registry.configs]` 아래에 harbor 레지스트리의 ID, PW 정보와 verify skip 설정을 넣도록 하겠습니다.

```
ex) 
[plugins."io.containerd.grpc.v1.cri".registry.configs]
  [plugins."io.containerd.grpc.v1.cri".registry.configs."<private-registry 주소>".auth]
    username = "<harbor ID>"
    password = "<harbor PW>"
  [plugins."io.containerd.grpc.v1.cri".registry.configs."<private-registry 주소>".tls]
    insecure_skip_verify = true  <= 이 설정을 넣어주어야 인증서 없이도 이미지를 받을 수 있습니다.
```

```
[plugins.cri.registry]
[plugins.cri.registry.mirrors]
[plugins.cri.registry.mirrors."docker.io"]
  endpoint = ["https://mirror.gcr.io","https://registry-1.docker.io","https://harbor.spk.io"]
[plugins.cri.registry.configs."harbor.spk.io".tls]
  insecure_skip_verify = true
# mirrors 설정은 굳이 필요 없기는 하다. 도커 허브(docker.io) 이미지를 2번째 pull 부터는 내부 private registry 에서 가져오겠다는 설정이다. 
```

```bash
systemctl restart containerd
```

### image upload

```bash
sudo docker pull 192.168.0.54:8443/mgmt-system/gitlab/gitlab-ce:17.6.2-ce.0

or

sudo crictl pull harbor.kryoon.io/mgmt-system/gitlab/gitlab-ce:17.6.2-ce.0
```


## 접속

- IP 주소로 접속(192.168.77.163)해보면 NET::ERR_CERT_AUTHORITY_INVALID 에러가 뜬다.

![](/images/kubernetes/docker/harbor/docker-harbor-1.png)

![](/images/kubernetes/docker/harbor/docker-harbor-2.png)

- 접속한 웹사이트의 SSL/TLS 인증서가 신뢰할 수 있는 인증 기관(CA)에서 발급한 것이 아닌 경우에 발생하는데, 자체 서명된 인증서라 로컬에 인증서를 등록해야 https 연결이 가능하다(로컬에서만 연결됨).

![](/images/kubernetes/docker/harbor/docker-harbor-4.png)

![](/images/kubernetes/docker/harbor/docker-harbor-5.png)

### 인증서 설치

#### Windows

#### Mac

- keychain Access 실행 및 가져오기
  ![](/images/kubernetes/docker/harbor/harbor-mac-1.png)

- 인증서 **항상 신뢰**로 설정
  ![](/images/kubernetes/docker/harbor/harbor-mac-2.png)

- 확인
  ![](/images/kubernetes/docker/harbor/harbor-mac-3.png)

## 로그인

- reg.mydomain.com:8443
  - admin
  - Harbor12345