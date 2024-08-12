---
title: "[PostgreSQL] VACUUM"
date: 2022-12-01
categories: [Database, PostgreSQL]
tags: [Database, PostgreSQL, VACUUM, disk, usage]
---

> full 옵션으로 실행 시 데이터베이스가 잠김(Lock)처리가 되므로 운영중인 데이터베이스에서는 해당 옵션으로 사용하지 마세요.
{: .prompt-warning }

## DB 전체 풀 실행
```terminal
vacuum full analyze;
```

## DB 전체 간단하게 실행
```terminal
vacuum verbose analyze;
```

## 해당 테이블만 간단하게 실행
```terminal
vacuum analyse [테이블 명];
```

## 특정 테이블만 풀 실행
```terminal
vacuum full [테이블명];
```