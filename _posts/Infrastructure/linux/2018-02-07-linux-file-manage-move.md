---
title: "[Linux] 파일 관리 - mv 파일/Directory 이동"
date: 2018-02-07
categories: [OS, Linux]
tags: [linux, file, directory, mv, move]
---

## mv 명령어

- 파일/Directory를 이동시키거나 이름을 바꿔준다. mv는 move의 약자이다.
  - 이동하고 싶은 위치에 같은 이름의 파일명이 존재 하지 않을 경우 이동
  - 이동하고 싶은 위치에 같은 이름의 파일명이 존재 할 경우 이름 변경

### 사용법

```bash
mv [대상 파일의 위치/이름] [이동하고 싶은 위치/이름]
```

## mv 명령어 사용 예제

### 예제 1

- test1 파일을 /backup 으로 이동한다.

  ```bash
  mv /test/test1 /backup
  ```

### 예제 2

- passwd 파일을 pw로 이름 변경한다.

  ```bash
  mv /backup/passwd /backup/pw
  ```