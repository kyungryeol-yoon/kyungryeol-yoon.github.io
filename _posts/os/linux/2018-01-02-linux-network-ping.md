---
title: "[Linux] Network - ping 상대 호스트와 연결 가능 여부 확인"
date: 2018-01-02
categories: [OS, Linux]
tags: [linux, network, ping, host]
---

## ping 명령어

- 상대 호스트와 연결 가능 여부 확인한다.

### 사용법

- ping (option) [연결 가능 여부 IP 및 도메인]

### option:

- `-c (count)` : ping을 보낼 횟수
- `-i (interval)` : ping을 보낼 간격
- `-s (size)` : ping의 크기(최대 65507)
- `-f (fast)` : 최대 속도

## ping 명령어 사용 예제

```bash
[kryoon@localhost ~]$ ping -c 3 www.google.com

PING www.google.com (172.217.24.196): 56 data bytes
64 bytes from 172.217.24.196: icmp_seq=0 ttl=49 time=68.258 ms
64 bytes from 172.217.24.196: icmp_seq=1 ttl=49 time=70.593 ms
64 bytes from 172.217.24.196: icmp_seq=2 ttl=49 time=68.935 ms

--- www.google.com ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 68.258/69.262/70.593/0.981 ms
```

## ping 트래픽

- ping 기본 값: 8byte
- ping 최댓값: 65515byte (65507 + 8)

## ping 고급 설정
### ping 막기(ICMF 막기)

```bash
echo 1 > /proc/sys/net/ipv4/icmp_echo_ignore_all
```

### ping 허용(ICMF 허용)

```bash
echo 0 > /proc/sys/net/ipv4/icmp_echo_ignore_all
```