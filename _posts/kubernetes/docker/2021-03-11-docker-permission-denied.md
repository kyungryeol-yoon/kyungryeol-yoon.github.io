---
title: "[Docker] Permission Denied 발생하는 경우"
date: 2021-03-11
categories: [Docker, Permission]
tags: [Docker, Permission, Denied]
---

## docker 설치 후 /var/run/docker.sock의 permission denied 발생하는 경우

```bash
docker ps -a

Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.40/containers/json?all=1: dial unix /var/run/docker.sock: connect: permission denied
```

### 해결
- `/var/run/docker.sock` 파일의 권한을 666으로 변경하여 그룹 내 다른 사용자도 접근 가능하게 변경

  ```bash
  sudo chmod 666 /var/run/docker.sock
  ```

- 또는 chown 으로 group ownership 변경

  ```bash
  sudo chown root:docker /var/run/docker.sock
  ```