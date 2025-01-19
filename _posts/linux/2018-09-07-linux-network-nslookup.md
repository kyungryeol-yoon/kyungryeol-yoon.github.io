---
title: "[Linux] 네트워크 - nslookup 도메인 정보 확인"
date: 2018-09-07
categories: [Linux, Network]
tags: [Linux, Network, nslookup]
---

## nslookup 명령어

- 네임 서버에 질의하는 프로그램이다.

- IP 주소를 아는데 도메인을 모르거나, 도메인은 아는데 IP 주소를 모를 때 알기 위해 쓴다.

- DNS 정보와 연관된 도메인 정보를 확인할 수 있다.

### 사용법

```bash
nslookup [도메인 또는 아이피 입력]
```

## nslookup 명령어 사용 예제
### 예제) 구글 조회

```bash
nslookup www.google.com
```