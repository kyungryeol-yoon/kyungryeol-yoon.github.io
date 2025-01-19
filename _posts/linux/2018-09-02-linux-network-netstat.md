---
title: "[Linux] 네트워크 - netstat 네트워크 상태 확인"
date: 2018-09-02
categories: [Linux, Network]
tags: [Linux, Network, netstat]
---

## netstat 명령어

- 포트와 네트워크 상태를 보여준다.

### 사용법

- netstat [옵션] [| grep 포트 번호 or 서비스 명]

### option

- `-l` (listen) : 연결 가능한 상태
- `-n` (number port) : 포트 넘버
- `-t` (tcp) : tcp
- `-u` (udp) : udp
- `-p` (Program name / PID) : 프로그램 이름 / PID
- `-a` (all) : 모두

> PORT : 서버에 열린 문을 의미하며 숫자로 표현된다. IP를 타고 서버에 접속할 때 서버에 여러 포트가 있다.
{: .prompt-info }

- `TCP` : 속도↓, 상호 통신(신뢰성↑), 질의응답 o, stream
- `UDP` : 속도↑, 일방 통신(신뢰성↓), 질의응답 x, datagram(dgram)

> netstat 옵션은 주로 -lntup를 쓴다. 그 외에 `-antup`, `-ltup`, `-atup` 등을 쓴다.
{: .prompt-info }

> /etc/services는 서비스 명 및 포트 정의 파일이고 포트 넘버를 확인 가능하다.
{: .prompt-info }