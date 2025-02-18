---
title: "[Linux] 네트워크 - wget 웹 다운로드"
date: 2018-09-25
categories: [OS, Linux]
tags: [Linux, Network, wget]
---

- 리눅스에서 wget는 웹 상에 존재하는 파일을 쉽게 다운로드 할 때 사용하는 명령어이다.

## 웹 파일 다운로드

- `wget --help` 라고 치시면 매우 다양한 옵션을 제공한다.
- 웹 상에 있는 특정 파일을 다운로드 할 때 주로 사용하고 있다.
- 예를 들어, `http://{URL}/file.tar.gz` 이라는 주소에 파일이 위치하고 있다고 가정했을 때,

```bash
wget http://{URL}/file.tar.gz
```

- 위와 같이 명령어를 입력하면, 현재 폴더에 `file.tar.gz`이 다운로드 된다.

## 웹 파일을 특정 파일명으로 다운로드

- 특정 이름으로 저장하고 싶으면 영어 대문자으로 `-O` 옵션을 주시면 된다.

- `O`는 Output의 `O`이다.

- 예를 들어, `http://{URL}/file.tar.gz` 을 `ddd.tar.gz` 으로 저장하고 싶다면

```bash
wget http://{URL}/file.tar.gz -O ddd.tar.gz
```

- 위와 같이 입력하여 `ddd.tar.gz`으로 다운로드할 수 있다.