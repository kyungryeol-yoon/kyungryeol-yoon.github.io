---
title: "[Linux] 파일 관리 - chmod 파일/Directory 권한 변경"
date: 2018-05-01
categories: [OS, Linux]
tags: [linux, file, directory, chmod]
---

## chmod 명령어

- 파일의 권한을 변경한다.
- chmod는 change mod의 약자이다.

### 사용법

```bash
chmod [option (ex.744)] [변경할 파일 위치/이름]
```

1. 권한은 숫자로 표현되며 읽기(4), 쓰기(2), 실행(1)으로 나뉜다.
2. 읽고쓰기=4+2=6, 읽고실행=4+1=5, 쓰고실행=2+1=3, 읽고쓰고실행=4+2+1=7
3. 권한은 총 3구역으로 설정되며, 나 / 내가 속한 그룹 / 다른 그룹 으로 나뉜다.
4. 나는 읽고 / 내가 속한 그룹은 쓰고 / 다른 그룹은 실행 = 421