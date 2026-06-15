---
title: "[Linux] 파일 관리 - touch 빈 파일 생성"
date: 2018-03-25
tags: [linux, file, touch]
description: "리눅스 touch 명령어로 0바이트 빈 파일을 생성하는 방법. 여러 파일 동시 생성과 타임스탬프 갱신 사용 예제를 정리합니다."
---

## touch 명령어

- 크기가 0 byte인 파일 생성한다.

### 사용법

```bash
touch [파일명]
```

## touch 명령어 사용 예제
### 예제 1)

- `/backup`에 1이라는 파일 생성한다.

```bash
touch /backup/1
```

### 예제 2)

- `/backup`에 2와 3이라 파일 생성, `/test`에 1이라는 파일 생성한다.

```bash
touch /backup/2 3 /test 1
```