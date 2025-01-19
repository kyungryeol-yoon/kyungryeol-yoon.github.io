---
title: "[Linux] 파일 관리 - mkdir Directory 생성"
date: 2018-01-11
categories: [Linux, File]
tags: [Linux, File, mkdir, Directory]
---

## mkdir 명령어

- Directory 생성한다.
- mkdir는 make directory의 약자이다.

### 사용법

```bash
mkdir [생성할 Directory 이름]
```

### option

- `-p` : 상위 Directory까지 생성

## mkdir 명령어 사용예제
### 예제 1)

- 최상위 Directory에 test Directory를 생성한다.

```bash
mkdir /test
```

- 이 명령어는 root 권한이 없다면 생성되지 않는다.

```bash
[kryoon@localhost ~]$ mkdir /test

mkdir: /test: Permission denied
```

- 최상위 Directory에 Directory를 생성하려면 root 권한이 필요하다.

### 예제 2)

- 현재 Directory에서 a Directory 안에 b라는 Directory 생성한다.

```bash
mkdir a/b
```

- 이 명령어는 현재 Directory에서 aDirectory가 존재하지 않는다면 생성되지 않는다.

```bash
[kryoon@localhost ~]$ mkdir a/b

mkdir: a: No such file or directory
```

- 여러 경로(a/b) 존재시에 항상 마지막 경로(b)가 타겟이 된다.
- 위의 명령어는 aDirectory와 그 안에 bDirectory를 생성하라는 것이 아니라, aDirectory가 존재할 경우 그 안에 b라는 Directory를 생성하라는 뜻이다.

### 예제 3)

- 현재 Directory에서 a Directory를 생성한뒤 그안에 b라는 Directory 생성한다.

```bash
mkdir -p a/b
```