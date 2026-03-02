---
title: "[Kubernetes] Velero: 클러스터 백업, 복구, 마이그레이션 도구"
date: 2025-06-02
categories: [Kubernetes, Storage]
tags: [kubernetes, backup, restore, velero, disaster-recovery, migration]
---

# 🛡️ Velero란?

**Velero**는 쿠버네티스 클러스터의 **리소스와 데이터를 백업/복원하고, 클러스터 간 마이그레이션**을 지원하는 도구입니다.  
재해 복구(Disaster Recovery)와 테스트/스테이징 환경 관리에 유용합니다.

---

## 1️⃣ 주요 기능

1. **백업 (Backup)**
   - 전체 클러스터 또는 특정 네임스페이스 단위 백업  
   - 리소스 + Persistent Volume 데이터 포함 가능

2. **복원 (Restore)**
   - 특정 시점으로 클러스터 또는 네임스페이스 복원  
   - 선택적 리소스 복원 가능

3. **마이그레이션 (Migration)**
   - 클러스터 간 애플리케이션 이전  
   - 테스트/스테이징 환경 배포 용이

4. **클라우드 스토리지 연동**
   - AWS S3, GCP GCS, Azure Blob 등 외부 오브젝트 스토리지 활용

---

## 2️⃣ 설치 및 사용 예시

```bash
# Velero CLI 설치 (Mac 예시)
brew install velero

# 클러스터에 Velero 설치
velero install \
    --provider aws \
    --bucket my-backup-bucket \
    --secret-file ./credentials-velero

# 백업 생성
velero backup create my-backup --include-namespaces default

# 백업 목록 확인
velero backup get

# 백업 복원
velero restore create --from-backup my-backup
```

---

## 3️⃣ 사용 목적

* 쿠버네티스 클러스터 **재해 복구 준비**
* 선택적 **Namespace/리소스 백업 및 복원**
* 클러스터 간 **데이터 및 리소스 마이그레이션**
* 테스트 환경/스테이징 환경 구성 자동화

---

## 4️⃣ 요약

| 항목 | 내용                                  |
| -- | ----------------------------------- |
| 이름 | Velero                              |
| 역할 | Kubernetes 리소스 & 데이터 백업, 복구, 마이그레이션 |
| 대상 | Namespace, PV, CRD 등                |
| 장점 | 클라우드 연동, 선택적 백업, 재해 복구/마이그레이션 용이    |

💡 **한 줄 기억:**

> **Velero = 쿠버네티스 클러스터용 “백업 + 복구 + 마이그레이션 매니저”**
