---
title: "[PostgreSQL] VACUUM"
date: 2022-12-02
tags: [database, postgresql, vacuum, disk, usage]
description: "PostgreSQL VACUUM으로 죽은 튜플을 정리해 성능을 유지하는 방법. 전체·테이블별 실행과 운영 중 FULL 옵션 사용 시 락 주의점을 정리합니다."
---

{{< alert "warning" >}}
full 옵션으로 실행 시 데이터베이스가 잠김(Lock)처리가 되므로 운영중인 데이터베이스에서는 해당 옵션으로 사용하지 마세요.
{{< /alert >}}

## DB 전체 풀 실행

```bash
vacuum full analyze;
```

## DB 전체 간단하게 실행

```bash
vacuum verbose analyze;
```

## 해당 테이블만 간단하게 실행

```bash
vacuum analyse [테이블 명];
```

## 특정 테이블만 풀 실행

```bash
vacuum full [테이블명];
```