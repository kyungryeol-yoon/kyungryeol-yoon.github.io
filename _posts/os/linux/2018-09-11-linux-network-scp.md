---
title: "[Linux] 네트워크 - scp 서버간 파일 복사"
date: 2018-09-11
categories: [OS, Linux]
tags: [Linux, Network, scp]
---

## scp 명령어

- 리눅스에서 서버 간에 파일 복사에 사용되는 명령어이다.

### 명령어

```bash
scp {복사하려는 파일명}  {서버 사용자 아이디}@{서버 주소}:{서버의 복사 경로 위치}
```

### 참고

- 서버의 아이디 및 비밀번호를 알고 있어야 한다.
- 서버의 복사 경로 위치 앞에 : (콜론)을 꼭 붙어야 한다.
- 서버의 복사 경로 위치는 기입한 서버의 아이디 계정의 쓰기 권한이 있어야 된다.

## scp 명령어 사용 예제
### 예제) 파일 복사

- 로컬에 있는 test.txt 라는 파일을 서버에 /home/kryoon 의 Directory에 복사한다.

```bash
scp ./test.txt kryoon@192.168.0.10:/home/kryoon
```

### 예제) Directory 복사

- 로컬에 있는 test_dir Directory를 서버에 /home/kryoon 의 Directory에 복사한다.

```bash
scp -r ./test_dir kryoon@192.168.0.10:/home/kryoon
```

- 파일을 복사할 때와 다른 점은 옵션 -r이 추가되었다.