---
title: "[Linux] zip 압축 및 해제"
date: 2018-05-07
categories: [OS, Linux]
tags: [linux, file, directory, compress, zip]
---

## zip, unzip 설치하기
### Ubuntu에서 zip, unzip 설치

- zip, unzip이 설치되지 않은 Ubuntu에서는 아래 명령어로 설치할 수 있다.

#### 명령어

```bash
sudo apt-get install zip unzip
```

## zip 압축하기
### 명령어

```bash
zip {압축 파일명}.zip {압축할 파일 혹은 Directory1} {압축할 파일 혹은 Directory2}...
```

### 파일 압축하기

- 특정 Directory에 모든 파일(./*)를 test.zip으로 압축한다.

```bash
zip test.zip ./*
```

### 파일 및 Directory 압축하기

- 현재 폴더에 여러 하위 폴더가 있는데, 그것도 다 같이 압축하기 위해서는 `-r` 이라는 옵션을 추가한다.
- 특정 Directory에 모든 파일 및 Directory(./*)를 test.zip으로 압축한다.

```bash
zip -r test.zip ./*
```

## zip 압축풀기

- zip파일을 압축을 푸는 명령어는 아래와 같다.

### 명령어

```bash
unzip {압축 파일명}.zip
```

### 파일 압축풀기

- test.zip 파일의 압축을 푸는 명령어는 아래와 같다.

```bash
unzip test.zip
```

### 특정 Directory에 파일 압축풀기

- test.zip 파일을 /home/kryoon Directory에 압축을 푸는 명령어는 아래와 같다.

```bash
unzip test.zip -d /home/kryoon
```