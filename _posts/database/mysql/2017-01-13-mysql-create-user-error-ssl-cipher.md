---
# layout: post
title: "[MySQL] MySQL user 생성시 ERROR 1364 (HY000)"
date: 2017-01-13
categories: [Database, MySQL]
tags: [Database, MySQL, Error]
# comments: true
---

## ERROR 1364 (HY000): Field 'ssl_cipher' doesn't have a default value
* Mysql 버전이 높아지면서 보안 관련 오류
* User 생성시 Host, User ,Password, ssl_cipher, x509_issuer, x509_subject를 입력해야함
* ssl_cipher, x509_issuer, x509_subject 값은 '' 빈값을 입력
```sql
mysql> insert into user (Host, User, Password, ssl_cipher, x509_issuer, x509_subject) 
values('localhost','사용자명',password('비밀번호'),'','','');
```

## ERROR 1364 (HY000): Field 'authentication_string' doesn't have a default value
* mysql 5.5 에서 user 생성시 authentication_string 필드 추가. '' 값으로 입력
```sql
mysql> insert into user (Host, User, Password, ssl_cipher, x509_issuer, x509_subject, authentication_string) 
values('localhost','사용자명', password('비밀번호'),'','','','');
```