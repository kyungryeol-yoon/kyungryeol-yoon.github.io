---
title: "[Linux] 프로세스 관리 - kill 프로세스 종료"
date: 2018-07-07
tags: [linux, process, kill]
description: "리눅스 kill 명령어로 프로세스를 종료하는 방법. -1(HUP), -9(KILL), -15(TERM) 등 주요 시그널의 의미와 사용 예제를 정리합니다."
---

## kill

- 프로세스 종료시킨다.

### 사용법

```bash
kill (option) [PID:프로세스 아이디]
```

### option(signal)

- `-1` : 재실행(HUP)
- `-9` : 강제종료(KILL)
- `-15` : 기다렸다 정상 종료(TERM)