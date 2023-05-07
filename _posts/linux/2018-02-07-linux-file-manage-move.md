---
title: "[Linux] 파일 관리 - mv 파일/디렉토리 이동"
date: 2018-02-07
categories: [Linux, File]
tags: [Linux, File, Directory, mv, move]
---

## mv 명령어
파일/디렉토리를 이동시키거나 이름을 바꿔준다. mv는 move의 약자이다.

1. 이동하고 싶은 위치에 같은 이름의 파일명이 존재 하지 않을 경우 이동
2. 이동하고 싶은 위치에 같은 이름의 파일명이 존재 할 경우 이름 변경

### 사용법
```
mv  [대상 파일의 위치/이름] [이동하고 싶은 위치/이름]
```

## mv 명령어 사용 예제
### 예제1)
test1 파일을 /backup 으로 이동한다.
```
mv /test/test1 /backup
```

### 예제2)
passwd 파일을 pw로 이름 변경한다.
```
mv /backup/passwd /backup/pw
```