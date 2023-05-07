---
title: "[Linux] 파일 관리 - find 파일/디렉토리 검색"
date: 2018-03-11
categories: [Linux, File]
tags: [Linux, File, find]
---

## find 명령어
파일및 디렉토리 검색한다.
```
find [경로] [-name] [파일 및 디렉토리 명] [-type d/f]
```

### 예제 1)
/etc안에서 이름이 config인 파일 및 디렉토리 검색
```
find /etc/ -name config
```

### 예제 2)
최상위에서 이름이 home이고 타입이 디렉토리인 것만 검색한다.
```
find / -name home -type d
```

### 예제 3)
최상위에서 이름이 passwd이고 타입이 파일인 것만 검색한다.
```
find / -name passwd -type f
```

## find 고급 명령어
### 예제 1)
파일에 접근한지 n일 이상 검색한다.
```
find [경로] [-atime] [+n] (-n일 경우 n일 이내)
```

### 예제 2)
파일을 생성한지 n일 이상 검색한다.
```
find [경로] [-ctime] [+n] (-n일 경우 n일 이내)
```

### 예제 3)
파일을 변경한지 n일 이상 검색한다.
```
find [경로] [-mtime] [+n] (-n일 경우 n일 이내)
```

### 예제 4)
파일에 접근한지 n분 이상 검색한다.
```
find [경로] [-amin] [+n] (-n일 경우 n분 이내)
```

### 예제 5)
파일을 생성한지 n분 이상 검색한다.
```
find [경로] [-cmin] [+n] (-n일 경우 n분 이내)
```

### 예제 6)
파일을 변경한지 n분 이상 검색한다.
```
find [경로] [-mmin] [+n] (-n일 경우 n분 이내)
```

### 예제 7)
[파일 및 디렉토리 명]이 생성후 수정된 모든 파일 및 디렉토리 검색한다.
```
find [경로] [-newer] [파일 및 디렉토리 명]
```

### 예제 8)
여러 명령어를 한줄에 줄 수도 있다.
```
find / -name a
find / -name b
find / -name a -o -name  b   ## 이렇게 한줄로 줄여서 쓸수도 있음.
```