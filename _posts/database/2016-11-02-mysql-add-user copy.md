---
title: "MySQL 사용자 추가(권한추가)"
date: 2016-11-02
categories: [Database, MySQL]
tags: [Database, MySQL, Create, User]
---

- 사용자 추가
```sql
mysql> create user 사용자ID;
```

```sql
mysql> create user userid@localhost identified by '비밀번호';
```

- 사용자(user)를 추가하면서 패스워드까지 설정
> 기존에 사용하던 계정에 외부 접근 권한을 부여하려면, Host를 '%' 로 하여 똑같은 계정을 추가한다
{: .prompt-info }
```sql
mysql> create user 'userid'@'%' identified by '비밀번호';  // '%' 의 의미는 외부에서의 접근을 허용
```


- 다른 방법으로는
```sql
mysql> USE mysql;     // mysql database 선택
mysql> INSERT INTO user (Host, User, Password) VALUES ('localhost', '계정아이디', password('비밀번호'));
mysql> INSERT INTO user (Host, User, Password) VALUES ('%', '계정아이디', password('비밀번호'));
mysql> FLUSH privileges;
```

```sql
mysql> drop user '사용자ID'@localhost;    // 사용자 삭제
```

- 등록된 모든 사용자 ID 조회
```sql
mysql> select * from user;
```


- 사용자 삭제
```sql
mysql> delete from user where user = '사용자ID';
```