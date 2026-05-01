---
title: "[Linux] 🔐 pam_tally2로 로그인 실패 제한 및 계정 잠금 설정하기"
date: 2023-12-26
categories: [OS, Linux]
tags: [linux, pam, pam_tally2, pam_faillock, security, account-lock, authentication, centos, rhel]
pin: false
---

리눅스 서버에서 비밀번호를 무한 반복 시도하는 브루트포스(Brute-force) 공격은 가장 기초적이면서도 빈번한 위협입니다.
**PAM(Pluggable Authentication Modules)** 의 `pam_tally2` 모듈을 사용하면 로그인 실패 횟수를 추적하고, 임계값 초과 시 계정을 자동으로 잠글 수 있습니다.

> ⚠️ `pam_tally2`는 **Deprecated** 상태입니다. RHEL 8 / CentOS 8 이상 또는 최신 Ubuntu 환경에서는 `pam_faillock`을 사용하는 것이 권장됩니다. 이 포스트는 두 가지 모두 다룹니다.

---

## 🧩 PAM이란?

PAM은 리눅스의 인증 프레임워크로, 애플리케이션이 인증 방식을 직접 구현하지 않아도 되도록 **모듈 방식으로 인증 기능을 제공**합니다.
`/etc/pam.d/` 디렉토리 아래에 서비스별 설정 파일이 위치합니다.

```text
/etc/pam.d/
├── sshd           # SSH 서비스 인증 설정
├── login          # 로컬 콘솔 로그인 인증 설정
├── password-auth  # 패스워드 기반 인증 공통 설정 (RHEL/CentOS)
└── system-auth    # 시스템 인증 공통 설정 (RHEL/CentOS)
```

PAM 설정은 4가지 타입(`auth`, `account`, `password`, `session`)으로 구성되며,
`pam_tally2`는 주로 `auth`와 `account` 타입에 적용됩니다.

---

## 🔒 pam_tally2 설정하기 (RHEL 7 / CentOS 7)

### /etc/pam.d/password-auth 설정

SSH 로그인 실패 제한을 적용하려면 아래와 같이 설정합니다.

```text
# /etc/pam.d/password-auth

auth        required      pam_tally2.so deny=5 unlock_time=1800 no_magic_root reset
auth        required      pam_env.so
auth        sufficient    pam_unix.so nullok try_first_pass
auth        requisite     pam_succeed_if.so uid >= 1000 quiet_success
auth        required      pam_deny.so

account     required      pam_tally2.so no_magic_root
account     required      pam_unix.so
account     sufficient    pam_localuser.so
```

### /etc/pam.d/system-auth 설정

로컬 콘솔 로그인에도 동일하게 적용하려면 `system-auth` 파일에도 추가합니다.

```text
# /etc/pam.d/system-auth

auth        required      pam_tally2.so deny=5 unlock_time=1800 no_magic_root reset
auth        required      pam_env.so
auth        sufficient    pam_unix.so nullok try_first_pass
```

> **Tip**: `password-auth`는 SSH 등 원격 접속, `system-auth`는 로컬 콘솔 접속에 적용됩니다. 두 파일 모두 수정해야 완전한 적용이 됩니다.

---

## ⚙️ 주요 옵션 설명

| 옵션 | 설명 |
|------|------|
| `deny=N` | N회 실패 시 계정 잠금 (예: `deny=5`는 5회 실패 시 잠금) |
| `unlock_time=N` | N초 후 자동 잠금 해제 (예: `unlock_time=1800`은 30분). 생략 시 영구 잠금 |
| `no_magic_root` | root 계정은 잠금 대상에서 제외 |
| `reset` | 로그인 성공 시 실패 횟수를 0으로 초기화 |
| `onerr=fail` | PAM 모듈 오류 발생 시 인증 실패로 처리 |
| `even_deny_root` | root 계정도 잠금 대상에 포함 (보안 강화 시 사용) |

---

## 🛠️ pam_tally2 명령어 사용법

### 실패 횟수 조회

```bash
pam_tally2 -u [계정명]
```

```bash
# 예시
pam_tally2 -u testuser
# Login           Failures Latest failure     From
# testuser            5    04/26/26 10:30:00  192.168.1.100
```

### 계정 잠금 해제 (실패 횟수 초기화)

```bash
pam_tally2 -u [계정명] -r
```

```bash
# 예시
pam_tally2 -u testuser -r
# Login           Failures Latest failure     From
# testuser            0
```

`-r` (`--reset`) 옵션을 사용하면 실패 횟수가 0으로 초기화되어 즉시 잠금이 해제됩니다.

### 전체 계정 실패 현황 조회

```bash
pam_tally2
```

옵션 없이 실행하면 로그인 실패 이력이 있는 모든 계정 목록을 출력합니다.

---

## 🔎 설정 적용 확인

계정이 실제로 잠겼는지 테스트하려면 아래 순서로 확인합니다.

```bash
# 1. 테스트 계정 잠금 유발 (5회 틀린 패스워드 입력 후)
ssh testuser@localhost  # 5회 실패

# 2. 잠금 상태 확인
pam_tally2 -u testuser
# Failures: 5 (이상이면 잠금 상태)

# 3. 관리자가 수동으로 잠금 해제
pam_tally2 -u testuser -r
```

> ⚠️ root 계정으로 `pam_tally2 -r` 명령을 실행해야 합니다. 일반 계정으로 실행 시 권한 오류가 발생합니다.

---

## 🆕 최신 대안: pam_faillock (RHEL 8 / CentOS 8 이상)

`pam_tally2`는 RHEL 8부터 공식 Deprecated 처리되었고, **`pam_faillock`** 이 대체 모듈입니다.
사용법은 유사하지만 설정 방식이 다릅니다.

### /etc/pam.d/sshd 설정

```text
auth    required      pam_faillock.so preauth silent audit deny=5 unlock_time=600
auth    [success=1 default=bad] pam_unix.so nullok
auth    [default=die] pam_faillock.so authfail audit deny=5 unlock_time=600
auth    sufficient    pam_faillock.so authsucc audit deny=5 unlock_time=600
account required      pam_faillock.so
```

### pam_faillock 명령어

```bash
# 실패 횟수 조회
faillock --user [계정명]

# 계정 잠금 해제
faillock --user [계정명] --reset
```

### pam_tally2 vs pam_faillock 비교

| 항목 | pam_tally2 | pam_faillock |
|------|-----------|--------------|
| **지원 OS** | RHEL 6~7, 구버전 | RHEL 8+, 최신 Ubuntu |
| **상태** | Deprecated | 현재 권장 |
| **명령어** | `pam_tally2 -u` | `faillock --user` |
| **잠금 해제** | `pam_tally2 -u USER -r` | `faillock --user USER --reset` |
| **설정 복잡도** | 단순 | 다소 복잡 |

---

## ✅ 요약

1. `pam_tally2`는 `/etc/pam.d/password-auth` 및 `system-auth`에 `auth required`와 `account required` 두 줄씩 추가합니다.
2. `deny=5 unlock_time=1800 no_magic_root reset`이 가장 일반적인 설정입니다.
3. 계정 잠금 해제는 `pam_tally2 -u [계정명] -r`로 수행합니다.
4. RHEL 8 / CentOS 8 이상 환경에서는 `pam_faillock`과 `faillock` 명령어를 사용하세요.