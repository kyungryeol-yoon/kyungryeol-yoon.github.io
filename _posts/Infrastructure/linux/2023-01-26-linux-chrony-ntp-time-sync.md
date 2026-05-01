---
title: "[Linux] ⏱️ Chrony NTP 시간 동기화 완벽 가이드: 설정부터 iburst 에러 해결까지"
date: 2023-01-26
categories: [Infrastructure, Linux]
tags: [linux, chrony, ntp, chronyd, chrony-conf, iburst, time-sync, centos, ubuntu, rhel]
description: "Linux에서 Chrony로 NTP 시간 동기화를 설정하는 방법을 정리했습니다. chrony.conf iburst 설정, 특정 NTP 서버 교체, chronyc 진단 명령어, 에러 트러블슈팅까지 실무 기준으로 다룹니다."
pin: false
---

**Chrony**는 Linux에서 NTP(Network Time Protocol) 기반 시간 동기화를 담당하는 데몬입니다.
기존 `ntpd`를 대체하는 최신 표준으로, RHEL 7 / CentOS 7 이상과 Ubuntu 18.04 이상에서 기본 탑재되어 있습니다.
이 글에서는 `chrony.conf` 설정 방법, `iburst` 옵션, 특정 NTP 서버로의 교체, `chronyc` 진단 명령어, 그리고 흔히 발생하는 에러 해결 방법을 실무 기준으로 정리합니다.

---

## 🧭 Chrony란?

Chrony는 불안정한 네트워크 환경(재부팅, 슬립 모드, 간헐적 연결)에서도 빠르고 정확하게 시스템 시간을 동기화하는 NTP 구현체입니다.

```text
NTP 서버 (Stratum 1/2)
        ↓ UDP 123
  chronyd 데몬
        ↓
  시스템 클럭 조정
        ↓
  (rtcsync) 하드웨어 클럭(RTC) 반영
```

| 항목 | ntpd | chronyd (Chrony) |
|------|------|-----------------|
| 수렴 속도 | 느림 | 빠름 (iburst) |
| 불안정 네트워크 대응 | 취약 | 강함 |
| 기본 탑재 | RHEL 6 이하 | RHEL 7+ / Ubuntu 18.04+ |
| 설정 파일 | `/etc/ntp.conf` | `/etc/chrony.conf` 또는 `/etc/chrony/chrony.conf` |

---

## 📦 설치

### RHEL / CentOS / Rocky Linux

```bash
sudo dnf install chrony -y       # RHEL 8+
# 또는
sudo yum install chrony -y       # CentOS 7
```

### Ubuntu / Debian

```bash
sudo apt-get update
sudo apt-get install chrony -y
```

### 서비스 시작 및 자동 실행 등록

```bash
sudo systemctl enable --now chronyd
sudo systemctl status chronyd
```

---

## ⚙️ chrony.conf 주요 설정

설정 파일 경로:
- **Ubuntu**: `/etc/chrony/chrony.conf`
- **CentOS / RHEL / Rocky**: `/etc/chrony.conf`

### pool vs server

```bash
# pool: NTP Pool 프로젝트에서 여러 서버를 자동 선택
pool 2.rocky.pool.ntp.org iburst

# server: 특정 서버 한 대를 직접 지정
server time.google.com iburst
```

> **Tip**: `pool`은 여러 서버를 자동으로 활용해 안정성이 높습니다. 사내 전용 NTP 서버가 있다면 `server`로 직접 지정하세요.

### 주요 옵션 설명

| 옵션 | 설명 |
|------|------|
| `iburst` | 초기 동기화 시 패킷을 집중 전송하여 수렴 속도를 높임 |
| `prefer` | 해당 서버를 우선 참조 소스로 지정 |
| `maxsources N` | pool에서 사용할 최대 서버 수 (기본값: 4) |
| `minpoll N` | 최소 폴링 간격 (2^N 초, 기본 6 = 64초) |
| `maxpoll N` | 최대 폴링 간격 (2^N 초, 기본 10 = 1024초) |
| `makestep T S` | T초 이상 오차 발생 시 처음 S번은 즉시 시간 점프 |
| `rtcsync` | 시스템 클럭을 하드웨어 RTC와 주기적으로 동기화 |
| `driftfile` | 클럭 드리프트 값 저장 경로 |
| `logdir` | 로그 저장 디렉토리 |

### 권장 기본 설정 예시

```ini
# /etc/chrony.conf (CentOS/RHEL 기준)

# 기본 pool 대신 특정 서버로 교체 시 아래처럼 pool 줄을 주석 처리
# pool 2.centos.pool.ntp.org iburst

server 0.asia.pool.ntp.org iburst
server 1.asia.pool.ntp.org iburst
server 2.asia.pool.ntp.org iburst
server 3.asia.pool.ntp.org iburst

# 한국 공개 NTP 서버
# server time.bora.net iburst
# server time.kornet.net iburst

# 시간 오차 1.0초 초과 시 처음 3번은 즉시 점프 조정
makestep 1.0 3

# 하드웨어 RTC와 동기화
rtcsync

# 클럭 드리프트 저장
driftfile /var/lib/chrony/drift

# 로그 디렉토리
logdir /var/log/chrony
```

---

## 🔄 특정 NTP 서버로 교체하기

사내 NTP 서버 또는 클라우드 내부 NTP 서버로 교체하는 실무 절차입니다.

### 1단계: 설정 파일 편집

```bash
sudo vi /etc/chrony.conf
# 또는 Ubuntu
sudo vi /etc/chrony/chrony.conf
```

기존 `pool` 또는 `server` 라인을 주석 처리하고 새 서버를 추가합니다.

```ini
# 기존 pool 비활성화
# pool 2.centos.pool.ntp.org iburst

# 사내 NTP 서버로 교체
server 192.168.1.10 iburst
server 192.168.1.11 iburst
```

### 2단계: 서비스 재시작

```bash
sudo systemctl restart chronyd
```

### 3단계: 동기화 상태 확인

```bash
chronyc sources -v
```

출력 예시:

```text
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^* 192.168.1.10                  2   6   377    23   +12us[  +8us] +/- 220us
^+ 192.168.1.11                  2   6   377    24   -15us[ -10us] +/- 180us
```

---

## ☁️ 클라우드 환경별 NTP 설정

클라우드 인스턴스는 해당 클라우드 내부 NTP 서버를 사용하는 것이 정확도·안정성 측면에서 유리합니다.

| 클라우드 | 내부 NTP 서버 |
|----------|-------------|
| **AWS** | `169.254.169.123` |
| **GCP** | `metadata.google.internal` |
| **Azure** | `time.windows.com` |
| **Naver Cloud** | 내부 NTP 서버 (VPC 설정 참고) |

AWS 환경 예시:

```ini
server 169.254.169.123 prefer iburst minpoll 4 maxpoll 4
```

> **Tip**: `prefer` 옵션으로 내부 서버를 우선 참조 소스로 지정하고, `minpoll`/`maxpoll 4`로 폴링 간격을 16초로 고정해 빠른 동기화를 유지할 수 있습니다.

---

## 🛠️ chronyc 진단 명령어

### sources — NTP 소스 상태 확인

```bash
chronyc sources -v
```

| 소스 상태 기호 | 의미 |
|--------------|------|
| `*` | 현재 동기화 중인 기준 서버 |
| `+` | 신뢰할 수 있는 후보 서버 |
| `-` | 알고리즘에 의해 제외된 서버 |
| `?` | 연결 불가 / 응답 없음 |
| `x` | 거짓 서버(falseticker)로 판정됨 |

### tracking — 시스템 시간 동기화 세부 정보

```bash
chronyc tracking
```

```text
Reference ID    : C0A8010A (192.168.1.10)
Stratum         : 3
Ref time (UTC)  : Sat Apr 26 12:00:00 2026
System time     : 0.000012345 seconds fast of NTP time
Last offset     : +0.000012345 seconds
RMS offset      : 0.000015678 seconds
Frequency       : 2.341 ppm fast
Residual freq   : +0.001 ppm
Skew            : 0.012 ppm
Root delay      : 0.002345678 seconds
Root dispersion : 0.001234567 seconds
```

### makestep — 즉시 시간 강제 동기화

시스템 시간이 크게 틀어졌을 때 즉시 보정합니다.

```bash
sudo chronyc makestep
# 또는 -a 옵션으로 인증 우회
sudo chronyc -a makestep
```

### 기타 유용한 명령어

```bash
chronyc sourcestats -v    # 소스별 통계 (오프셋 히스토리, 지터 등)
chronyc activity          # 온라인/오프라인 서버 수 확인
timedatectl status        # 시스템 시간·타임존·NTP 상태 종합 확인
timedatectl set-timezone Asia/Seoul   # 타임존 변경
```

---

## 🌏 타임존 설정

시간 동기화와 함께 타임존도 올바르게 설정해야 합니다.

```bash
# 현재 타임존 확인
timedatectl status

# 한국 표준시로 변경
timedatectl set-timezone Asia/Seoul

# 변경 결과 확인
date
```

---

## 🔒 방화벽 설정 (UDP 123)

NTP는 **UDP 123번 포트**를 사용합니다. 클라이언트가 외부 NTP 서버에 접근하려면 아웃바운드 규칙이 열려 있어야 합니다.

```bash
# firewalld (RHEL/CentOS)
sudo firewall-cmd --add-service=ntp --permanent
sudo firewall-cmd --reload

# UFW (Ubuntu)
sudo ufw allow 123/udp

# iptables 직접 설정
sudo iptables -A OUTPUT -p udp --dport 123 -j ACCEPT
```

클라우드 환경이라면 **보안 그룹(Security Group)** 의 아웃바운드 규칙에서도 UDP 123번을 허용해야 합니다.

---

## ❓ 자주 묻는 질문 및 트러블슈팅

### Q. chronyc sources에서 모든 서버가 `?` 로 표시됩니다

→ NTP 서버에 연결이 안 되는 상태입니다. 다음 순서로 확인합니다.

```bash
# 1. 방화벽 UDP 123 허용 여부 확인
sudo firewall-cmd --list-all

# 2. NTP 서버 IP 도달 가능 여부 확인
ping -c 3 time.google.com

# 3. UDP 123 연결 테스트
sudo nc -uzv time.google.com 123

# 4. 서비스 재시작
sudo systemctl restart chronyd
```

### Q. iburst 옵션을 추가했는데 시간이 빨리 맞지 않습니다

→ `iburst`는 초기 동기화 속도를 높이지만, 시간 오차가 크면 `makestep`으로 즉시 강제 보정해야 합니다.

```bash
sudo chronyc makestep
chronyc tracking    # System time 값이 줄어드는지 확인
```

### Q. `iburst`를 설정 파일에 단독 라인으로 넣으면 에러가 납니다

→ `iburst`는 독립 지시어가 아니라 `server` 또는 `pool` 명령어의 **옵션**입니다. 반드시 서버 주소 뒤에 붙여야 합니다.

```ini
# 잘못된 예
# pool 2.centos.pool.ntp.org
iburst                          # ❌ 단독 라인 — 문법 오류

# 올바른 예
server time.google.com iburst   # ✅ server 뒤에 옵션으로 추가
pool 2.centos.pool.ntp.org iburst  # ✅ pool 뒤에도 동일하게
```

### Q. 시간이 동기화되었는지 한 번에 확인하는 방법은?

```bash
timedatectl status | grep -E "synchronized|NTP"
# System clock synchronized: yes
# NTP service: active
```

---

## ✅ 요약

| 단계 | 명령어 |
|------|--------|
| 설치 | `dnf install chrony` |
| 설정 파일 편집 | `vi /etc/chrony.conf` |
| 기존 pool 주석, 새 server 추가 | `server [IP] iburst` |
| 서비스 재시작 | `systemctl restart chronyd` |
| 동기화 상태 확인 | `chronyc sources -v` |
| 즉시 강제 동기화 | `chronyc makestep` |
| 타임존 설정 | `timedatectl set-timezone Asia/Seoul` |