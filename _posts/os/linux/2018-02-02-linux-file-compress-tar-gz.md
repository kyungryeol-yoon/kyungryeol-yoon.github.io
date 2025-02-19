---
title: "[Linux] tar, gz 압축 및 해제"
date: 2018-02-02
categories: [OS, Linux]
tags: [linux, file, directory, compress, tar, gz]
---

## tar로 압축하기

```bash
tar -cvf [파일명.tar] [폴더명]


ex) abc라는 폴더를 aaa.tar로 압축하고자 한다면
  > tar -cvf aaa.tar abc
```

## tar 압축 풀기

```bash
tar -xvf [파일명.tar]


ex) aaa.tar라는 tar파일 압축을 풀고자 한다면
  > tar -xvf aaa.tar
```

## tar.gz로 압축하기

```bash
> tar -zcvf [파일명.tar.gz] [폴더명]


ex) abc라는 폴더를 aaa.tar.gz로 압축하고자 한다면
  > tar -zcvf aaa.tar.gz abc
```

## tar.gz 압축 풀기

```bash
tar -zxvf [파일명.tar.gz]


ex) aaa.tar.gz라는 tar.gz파일 압축을 풀고자 한다면
  > tar -zxvf aaa.tar.gz
```

> 위의 옵션들을 포함한 그나마 자주 사용되는 tar 명령어의 옵션들은 아래와 같다.
{: .prompt-info }

`옵션`
- `-c` : 파일을 tar로 묶음
- `-p` : 파일 권한을 저장
- `-v` : 묶거나 파일을 풀 때 과정을 화면으로 출력
- `-f` : 파일 이름을 지정
- `-C` : 경로를 지정
- `-x` : tar 압축을 풂
- `-z` : gzip으로 압축하거나 해제함