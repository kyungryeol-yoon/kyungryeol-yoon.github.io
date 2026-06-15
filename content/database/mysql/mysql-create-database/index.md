---
title: "[MySQL] MySQL 접속 및 데이터베이스 추가"
date: 2016-11-07
tags: [database, mysql, create]
description: "MySQL 접속과 데이터베이스 생성 방법. DB 접속·목록 조회, create database/schema로 데이터베이스를 만드는 과정을 정리합니다."
---

## DB 접속

```bash
mysql -u root -p
```

## DB 목록 확인

```sql
mysql> show databases;     
```

## mysql database 선택 및 테이블 살펴보기

```sql
mysql> use mysql;
mysql> select host, user, password from user;
```

## 데이터베이스 생성

```sql
mysql> create database db_name;    
```

## 둘중에 하나를 입력하면 DB 생성됨

{{< alert "info" >}}
MySQL에서는 schema와 database가 같은 뜻이라고 한다.
{{< /alert >}}

{{< alert "danger" >}}
default character set을 지정하지 않으면 한글이 깨져서 나오므로 주의해야 한다.
{{< /alert >}}

```sql
msyql> create schema db_name default character set utf8;
```

```sql
mysql> create database db_name default character set utf8;
mysql> create database db_name default character set utf8 COLLATE utf8_general_ci;
```

## default character set 변경

```sql
msyql> ALTER DATABASE web DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

## 데이터베이스 삭제

```sql
msyql> drop database db_name;
```