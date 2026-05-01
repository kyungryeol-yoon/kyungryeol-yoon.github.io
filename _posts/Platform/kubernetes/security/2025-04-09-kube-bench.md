---
title: "[Kubernetes] CIS Benchmark와 kube-bench 소개"
date: 2025-04-09
categories: [Platform, Kubernetes, Security]
tags: [kubernetes, security, cis, kube-bench, audit, devsecops]
---

## 🔒 CIS Kubernetes Benchmark와 kube-bench란?

쿠버네티스 클러스터의 **보안 상태를 점검하고 규정을 준수**하기 위한 도구와 기준입니다.

---

## 1️⃣ CIS란?

- **CIS (Center for Internet Security)**  
  - 전 세계적으로 보안 벤치마크와 가이드를 제공하는 기관  
- 쿠버네티스용 **CIS Kubernetes Benchmark**  
  - 클러스터 설정이 보안 기준을 만족하는지 점검  
  - 점검 항목 예: 인증, RBAC, 네트워크 정책, etcd 암호화 등

---

## 2️⃣ kube-bench란?

- **kube-bench** = CIS Kubernetes Benchmark 체크 자동화 도구  
- 제공: **Aqua Security (aquasec/kube-bench)**  
- 역할:
  - 쿠버네티스 클러스터 검사
  - CIS 기준 준수 여부 확인
  - 마스터/워커 노드, 컨트롤 플레인 구성 체크

---

## 3️⃣ 설치 및 실행 예시

```bash
# Docker로 실행
docker run --rm --net host --pid host --userns host \
  -v /etc:/etc:ro -v /var:/var:ro -v /usr/bin:/usr/local/bin:ro \
  aquasec/kube-bench:latest
```

* 검사 결과: **PASS / WARN / FAIL**

  * `PASS`: 보안 기준 준수
  * `WARN`: 권장하지만 필수 아님
  * `FAIL`: 보안 위험 존재

---

## 4️⃣ 사용 목적

* 쿠버네티스 클러스터 **보안 점검**
* CIS Benchmark 기준 **규정 준수 확인**
* DevSecOps 환경에서 **자동화된 감사**

---

## 5️⃣ 요약

| 항목         | 내용                                          |
| ---------- | ------------------------------------------- |
| CIS        | Center for Internet Security, 보안 벤치마크 제공 기관 |
| kube-bench | CIS Kubernetes Benchmark 자동 검사 도구 (AquaSec) |
| 용도         | 클러스터 보안 점검, 규정 준수 확인, DevSecOps             |
| 출력         | PASS / WARN / FAIL                          |

> 💡 한 줄 요약:
> **kube-bench = 쿠버네티스 클러스터를 CIS 보안 기준으로 “건강검진” 해주는 도구**
