---
title: "[Linux] 파일 관리 - rmdir, rm"
date: 2018-01-15
categories: [OS, Linux]
tags: [linux, file, rmdir, rm, directory]
---

## rmdir 명령어

- 비어있는 Directory 삭제한다.
- rmdir는 remove directory의 약자이다.

### 문법

```bash
rmdir (옵션) [삭제할 Directory 이름]
```

### option

- `p` : 상위 Directory도 삭제

### 예제 1)

```bash
rmdir aaa
```

- 빈 Directory aaa 삭제한다.

### 예제 2)

```bash
rmdir -p /a/b/c
```

- 빈 Directory a, b, c,를 한 번에 삭제한다.
- 파일이 존재할 경우 서브 Directory는 그대로 존재한다.

## 파일 삭제

```bash
rm [option] [삭제할 파일 위치/이름]
```

- remove : 파일을 삭제한다.

### option

- `-r` : Directory와 그 하부 파일까지 삭제 (하부파일이 있는 Directory는 한번에 삭제불가)
- `-f` : 삭제 여부를 묻지 않고 바로 삭제
- `-rf` : 삭제 여부를 묻지 않으며 하부 파일이 있는 Directory까지 삭제

## rm 명령어

- 파일 및 Directory 삭제한다.
- rm은 remove의 약자이다.

### 사용법

```bash
rm (옵션) [삭제할 파일 명 및 Directory 명]
```

### option

- `-r` : 일반 파일은 그냥 지우고 Directory면 Directory를 포함한 하위 경로와 파일 모두를 지운다.
- `-i` : 지울 것인지 확인을 한다 (y,n)
- `-f` : 물어보지 않고 지운다.
- `-rf` : 삭제 여부를 묻지 않으며 하부 파일이 있는 Directory까지 삭제

> 주로 `rm -rf` 옵션을 쓴다.
{: .prompt-info }

## rm 명령어 사용 예제
### 예제) 파일 삭제
#### test 파일을 삭제한다.

```bash
rm test
```

#### test 파일 삭제시 정말로 지울것인지 질의를 한다.

```bash
rm -i test
```

#### test 파일 삭제시 강제 실행한다.

```bash
rm -f test
```

### 예제) Directory 삭제
#### test-dir Directory를 삭제한다.

```bash
rm -r testdir
```

#### testdir Directory의 안에 파일이 있던 없던 무시하고 무조건 지운다.

```bash
rm -rf testdir
```