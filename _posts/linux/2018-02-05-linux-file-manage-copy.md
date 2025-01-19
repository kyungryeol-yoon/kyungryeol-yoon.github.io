---
title: "[Linux] 파일 관리 - cp 파일/Directory 복사"
date: 2018-02-05
categories: [Linux, File]
tags: [Linux, File, Directory, cp, copy]
---

## cp 명령어

- 파일/Directory을 복사한다.
- cp는 copy의 약자이다.

### 사용법

```bash
cp (옵션) [대상 파일의 위치/이름(여러 개 가능)] [복사하고 싶은 위치/이름]
```

### option

- `-r` : 하위 Directory와 파일 전체를 복사
- `-p` : 소유주, 그룹, 권한, 시간 정보를 보존하여 복사

> 복사하고 싶은 위치에 같은 이름의 파일명이 존재 할 경우 덮어쓰기(y/n?, y=yes)를 묻는다.
{: .prompt-info }

## CP 명령어 사용 예제
### 예제 1)

- inittab파일과 passwd파일과 grub.conf파일을 /backup Directory에 복사한다.

```bash
cp /etc/inittab /etc/passwd /boot/grub/grub.conf /backup
```

### 예제 2)

- skel 폴더(하위 Directory 및 파일 전체 포함)를 /backup 안에 복사한다.

```bash
cp -r /etc/skel /backup
```

### 예제 3)

- passwd 파일을 /backup Directory로 보존 복사한다.

```bash
cp -p /etc/passwd /backup
```

### 예제 4)

- inittab 파일을 init로 이름 변경 복사한다.

```bash
cp /etc/inittab /backup/init
```