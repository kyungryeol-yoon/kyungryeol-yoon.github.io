---
title: "[Linux] 파일 관리 - touch 빈 파일 생성"
date: 2018-03-25
categories: [Linux, File]
tags: [Linux, File, touch]
---

## touch 명령어
크기가 0byte인 파일 생성한다.

### 사용법
```
touch [파일명]
```

## touch 명령어 사용 예제
### 예제 1)
/backup에 1이라는 파일 생성한다.
```
touch /backup/1
```

### 예제 2)
/backup에 2와 3이라 파일 생성, /test에 1이라는 파일 생성한다.
```
touch /backup/2 3 /test 1
```