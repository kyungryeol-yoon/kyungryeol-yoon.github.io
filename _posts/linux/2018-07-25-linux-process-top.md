---
title: "[Linux] 프로세스 관리 - top 실시간 프로세스 모니터링"
date: 2018-07-25
categories: [Linux, Process]
tags: [Linux, Process, top]
---

## top 명령어
- 실시간 프로세스 모니터링 프로그램
- 기본적으로 3초마다 화면이 갱신되고 스페이스바를 누르면 바로 갱신된다.

### 사용법
```
top (option)
```

### option
- `-d` [시간] : 화면 갱신 시간 설정
- `-i` : idle 상태와 좀비 프로세스 무시

### top 실행중 사용 가능 명령어
- `k` : kill 명령
- `r` : nice값 변경
- `l` : top 맨 윗줄 항목 on/off
- `m` : 메모리 항목 on/off
- `t` : 프로세스와 CPU 항목 on/off
- `c` : command line의 옵션 on/off
- `q` : 프로그램 종료