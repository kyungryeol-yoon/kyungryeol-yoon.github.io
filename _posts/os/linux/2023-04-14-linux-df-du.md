---
title: "[Linux] df, du란?"
date: 2023-04-14
categories: [OS, Linux]
tags: [linux, disk, usage, command, df, du]
---

## df ( Disk Free )

- Linux System 전체의(Mount 포함) Disk의 여유 공간 확인
- File System, Disk 크기, 사용량, 남아있는 용량, 사용률, Mount 지점 순으로 정보를 출력

## du ( Disk Usage )

- 해당 파일 및 Directory의 Disk 크기를 확인하는 명령어
- 옵션이 없으면 현재 경로의 모든 파일 크기를 MB단위로 출력

## df와 du의 출력 크기가 다르게 보이는 이유

- df 명령어는 현재 Mount 된 File System의 상태를 기초로 하여 사용률을 보여주는 것이고, du명령어는 실제 Directory와 파일을 확인하고 그 크기를 조사하기 때문
- 현재 실행 중인 프로세스가 열려 있는 파일에 대해서 삭제 처리를 한 후에 해당 프로세스(task)를 종료하지 않으면 그 파일은 deleted 상태로 남게 된다.
  - 즉, 파일시스템에 deleted 상태 정보로 유지되고 있는 것이기 때문에 df 명령어로 확인하게 되면 deleted 파일이 차지하는 용량까지 더해져서 du 명령어와의 차이가 나타나는 것.
  - 특히, MySQL에서 큰 데이터베이스를 날렸을 경우에는 그 차이가 크게 느껴질 수 있다.

### 확인하는 방법

- lsof라는 명령어를 통해서 `deleted` 상태에 있는 파일을 확인할 수 있으니 각각의 파일 정보에서 해당 PID를 찾아서 그 프로세스를 Reset하거나 종료하면 df에서 잠식당한 공간을 확보할 수 있다.

  ```bash
  lsof | grep deleted
  ```