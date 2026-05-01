---
title: "[Linux] 파일 관리 - touch 빈 파일 생성"
date: 2018-03-25
categories: [OS, Linux]
tags: [linux, file, touch]
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