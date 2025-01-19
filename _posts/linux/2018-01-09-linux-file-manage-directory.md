---
title: "[Linux] 파일 관리 - pwd, cd"
date: 2018-01-09
categories: [Linux, File]
tags: [Linux, File, cd, pwd, Directory]
---

## pwd 명령어

- 현재 위치의 절대경로를 조회한다.
- pwd는 print working directory의 약자이다.

### 사용법

```bash
pwd
```

### 예제

```bash
[kryoon@localhost ~]$ pwd

/home/kryoon
```

## cd 명령어

- 다른 Directory로 이동한다.
- cd는 change directory의 약자이다.

### 사용법

```bash
cd [이동할 Directory의 위치 (상대경로 or 절대경로)]
```

## cd 명령어 사용 예제
### 예제 1)

- 로그인된 사용자의 홈 Directory로 이동한다.

```bash
cd
```

### 예제 2)

- `/home` Directory로 이동한다.

```bash
cd /home
```

### 예제 3)

- 현재 Directory로 이동한다.

```bash
cd .
```

### 예제 4)

- 상위 Directory로 이동한다.

```bash
cd ..
```

### 예제 5)

- 로그인된 사용자의 홈 Directory로 이동한다.

```bash
cd ~
```

### 예제 6)

- 지정된 계정의 홈 Directory로 이동한다.

```bash
cd ~계정명
```

`NOTE` : 홈 Directory

- 계정 전용 공간
- 계정 접속 위치