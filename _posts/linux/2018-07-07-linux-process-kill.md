---
title: "[Linux] 프로세스 관리 - kill 프로세스 종료"
date: 2018-07-07
categories: [Linux, Process]
tags: [Linux, process, kill]
---

## kill
프로세스 종료시킨다.

### 사용법
```
kill (option) [PID:프로세스 아이디]
```

### option(signal)
- `-1` : 재실행(HUP)
- `-9` : 강제종료(KILL)
- `-15` : 기다렸다 정상 종료(TERM)