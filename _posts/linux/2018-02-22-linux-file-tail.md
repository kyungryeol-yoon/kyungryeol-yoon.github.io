---
title: "[Linux] 파일 관리 - tail 파일 내용 제일 아래줄부터 출력"
date: 2018-02-22
categories: [Linux, File]
tags: [Linux, file, directory, tail]
---

## tail 명령어
파일의 내용을 제일 아래 라인부터 화면에 출력한다.

파일 내용을 아래에서 부터 기본 10라인 출력한다.

### 사용법
```
tail (옵션) [보고 싶은 파일 위치/이름]
```

### option
- `-[숫자]` : 지정한 숫자만큼 행을 출력
- `-c` (--bytes=K) : 지정한 바이트 수 만큼 파일의 마지막 부분을 출력
- `-f` (--follow[={name|descriptor}]) : 지정한 파일의 추가된 데이터를 실시간으로 출력
- `-F` : -f 옵션의 long 옵션과 동일
- `-n` (--lines=K) : 파일의 마지막 부분을 지정한 라인만큼 출력
- `-q` (--quiet, --silent) : 내용을 출력하기 전 항상 파일명을 출력하지 않는다.
- `-s` (--sleep-interal=N) : 지정한 파일을 n초 만큼 sleep 상태였다가 다시 확인 (with -f)
- `-v` (--verbose) : 내용을 출력하기 전 항상 파일명을 출력

## tail 명령어 사용 예제
### 예제 1)
/etc/passwd 파일 내용을 아래줄부터 5라인 출력한다.
```
tail -5 /etc/passwd
```

### 예제 2)
/etc/passwd 파일 내용을 아래줄부터 10라인 출력하고, 좌측에 라인 번호를 출력한다.
```
tail /etc/passwd | cat -n
```