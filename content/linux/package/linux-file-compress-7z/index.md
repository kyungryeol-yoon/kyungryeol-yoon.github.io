---
title: "[Linux] 7z 압축 및 해제"
date: 2018-05-25
tags: [linux, file, directory, compress, 7z]
description: "리눅스에서 7z로 압축·해제하는 방법. Ubuntu·Fedora의 p7zip 설치와 7z 압축·해제 명령어를 예제로 정리합니다."
---

## p7zip 설치하기
### 우분투(Ubuntu)에서 p7zip 설치하기

```bash
sudo apt-get install p7zip
```

- 위 명령어로 설치가 안되면 아래 명령어로 검색하셔서 설치하시길 바란다.

```bash
apt-cache search 7z
```

- 페도라(Fedora)에서 p7zip 설치하기

```bash
yum install p7zip
```

- 위 명령어로 설치가 안되면 아래 명령어로 검색하셔서 설치하시길 바란다.

```bash
yum search 7z
```

## 7z 압축하기
### 명령어

```bash
7zr a {압축 파일명}.zip {압축할 파일 혹은 Directory1} {압축할 파일 혹은 Directory2}...
```

### 파일 압축하기

- test1, test2, test3 파일을 라고 test.7z 파일명으로 압축을 하는 명령어는 다음과 같다.

```bash
7zr a test.7z test1 test2 test3
```

## 7z 압축 풀기
### 명령어

```bash
7zr x {압축 파일명}.zip
```

- test.7z 압축 파일을 푸는 명령어를 다음과 같다.

```bash
7zr x test.7z
```