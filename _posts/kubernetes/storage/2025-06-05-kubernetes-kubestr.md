---
title: "[Kubernetes] Kubestr: 스토리지 성능과 상태 점검 도구"
date: 2025-06-05
categories: [Kubernetes, Storage]
tags: [kubernetes, storage, performance, benchmark, kubestr, pvc, pv]
---

## 📦 Kubestr란?

**Kubestr**는 쿠버네티스 클러스터에서 **스토리지(Storage) 리소스의 성능과 상태를 점검**하는 도구입니다.  
Persistent Volume, StorageClass, PVC 등을 대상으로 **벤치마크와 분석**을 수행할 수 있습니다.

---

## 1️⃣ 주요 기능

1. **스토리지 클래스 분석**
   - StorageClass, PVC, PV 구조 및 매칭 상태 확인
   - 권장 구성 준수 여부 점검

2. **성능 벤치마크**
   - IOPS, Throughput, Latency 측정
   - 다양한 볼륨 타입(NFS, CSI, Local PV 등) 비교

3. **보고서 제공**
   - CLI, YAML, JSON 형식 제공
   - 성능 병목이나 문제점을 쉽게 확인 가능

4. **쿠버네티스 친화적**
   - Helm chart 또는 kubectl로 배포 가능
   - Pod 기반 벤치마크 → 클러스터 안전하게 실행

---

## 2️⃣ 설치 및 실행 예시

```bash
# Helm으로 설치
helm repo add kubestr https://kubestr.io/helm-charts
helm install kubestr kubestr/kubestr

# 스토리지 성능 벤치마크
kubestr storageclass ls      # 클러스터의 StorageClass 목록 확인
kubestr benchmark sc my-sc   # 특정 StorageClass 벤치마크
```

---

## 3️⃣ 사용 목적

* 스토리지 성능 비교 및 최적화
* 클러스터 스토리지 상태 점검
* Persistent Volume 병목 또는 구성 문제 사전 탐지
* DevOps/Platform 팀에서 클러스터 안정성 확보

---

## 4️⃣ 요약

| 항목 | 내용                                           |
| -- | -------------------------------------------- |
| 이름 | Kubestr                                      |
| 역할 | 쿠버네티스 클러스터 스토리지 점검 & 성능 벤치마크                 |
| 대상 | StorageClass, PersistentVolume, PVC 등        |
| 장점 | 클러스터 친화적, IOPS/Throughput/Latency 측정, 보고서 제공 |

💡 **한 줄 기억:**

> **Kubestr = 쿠버네티스 스토리지의 건강검진 + 성능 테스트 도구**
