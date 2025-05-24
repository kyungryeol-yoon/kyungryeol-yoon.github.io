---
title: "[Linux] Stress-ng"
date: 2025-05-10
categories: [OS, Linux]
tags: [linux, stress-ng]
---

## stress-ng 설치

- stress-ng는 다양한 스트레스 테스트를 지원하는 도구

```bash
apt install -y stress-ng
```

## CPU 스트레스 테스트 실행

- 설치 후, 아래 명령어를 사용해 CPU 스트레스 테스트를 실행할 수 있다.

```bash
stress-ng --cpu 1 --cpu-load 70 --timeout 10m --metrics --times --verify
```

- `--cpu` 1: CPU 코어 1개를 사용해 스트레스 테스트를 수행
- `--cpu-load` 70: CPU 사용률을 70%로 설정
- `--timeout` 10m: 테스트를 10분 동안 실행
- `--metrics`: 테스트 결과에 대한 성능 메트릭스를 표시
- `--times`: 테스트 완료 후 실행 시간과 관련된 통계를 출력
- `--verify`: 테스트 중 계산 결과가 정확한지 확인
 
 
## 실행 결과 예시

- 테스트를 실행하면 다음과 비슷한 결과를 볼 수 있다.

```bash
stress-ng: info:  [1234] Setting up 1 CPU worker(s) to run 70% load
stress-ng: info:  [1234] Successful run completed in 600.00s (10 mins)
stress-ng: info:  [1234] Metrics: bogo-ops: 1000000, real-time: 600.00s, user-time: 420.00s, system-time: 0.05s
stress-ng: info:  [1234] Verification passed: 100.0% correct
```

## 테스트 후 모니터링

- 다음 명령어를 사용해 CPU 사용량을 확인할 수 있다

▼ top 명령어:CPU, 메모리 사용률을 실시간으로 확인

```bash
top
```

▼ htop (더 보기 편리한 대안):CPU 사용량과 프로세스를 시각적으로 확인

```bash
htop
```

## 테스트 종료

- 테스트가 완료되면 자동으로 종료되지만, 수동으로 종료하려면 다음 명령을 사용할 수 있다.

- `pkill stress-ng`: 실행 중인 stress-ng 프로세스를 종료합니다.
 
```bash
pkill stress-ng
```