---
title: "[Linux] 파일 관리 - chown 파일/Directory 소유권 변경"
date: 2018-05-05
categories: [OS, Linux]
tags: [linux, file, directory, chown]
---

## 소유권 확인

- 먼저 소유권을 확인하기 위해서는 아래 명령어로 확인이 가능하다.

```bash
ls -al
```

- 위 명령어를 입력하면 아래와 같은 형태로 결과물이 나온다.

```bash
-rw-r--r--   1 kryoon  staff      36864  5 10  2017 Currency.db
```

- 여기서 소유권자가 kryoon이고, 그룹 식별자가 staff이다.

## 파일 소유권 변경

- root 권한에에서 아래 명령어를 실행한다.

### 명령어

```bash
chown {소유권자}:{그룹식별자} {소유권을 변경하고 싶은 파일명}
```

- test.sh 파일명의 소유권자를 aaa로 하고, 그룹식별자를 bbb로 변경하는 명령어는 아래와 같다.

### 예제

```bash
chown aaa:bbb test.sh
```

## Directory 소유권 변경

- root 권한에에서 아래 명령어를 실행한다.

### 명령어

```bash
chown {소유권자}:{그룹식별자} {소유권을 변경하고 싶은 Directory명}
```

- `/home/test` Directory만 소유권자를 aaa로 하고, 그룹식별자를 bbb로 변경하는 명령어는 아래와 같다.

### 예제

```bash
chown aaa:bbb /home/test
```

- 위 명령어로 Directory 소유권은 변경하게 되면 /home/test Directory만 소유권이 변경되고, 이하 Directory는 소유권이 변경되지 않는다.

## 하위 Directory까지 모두 소유권 변경

- root 권한에에서 아래 명령어를 실행한다.

### 명령어

```bash
chown -R {소유권자}:{그룹식별자} {소유권을 변경하고 싶은 Directory명}
```

- `/home/test` Directory와 이하 모든 Directory 및 파일들의 소유권자를 aaa로 하고, 그룹식별자를 bbb로 변경하는 명령어는 아래와 같다.

### 예제

```bash
chown -R aaa:bbb /home/test
```

- 위 명령어로 Directory 소유권은 변경하게 되면 `/home/test Directory`는 물론 이하 모든 Directory 소유권이 변경된다.