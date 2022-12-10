---
title: "MySQL 사용자에게 데이터베이스 사용권한 부여"
date: 2016-11-05
categories: [Database, MySQL]
tags: [Database, MySQL, Privileges]
---

MySQL은 사용자 이름, 비밀번호, 접속 호스트로 인증한다.\\
MySQL은 로그인을 시도하는 위치가 어디인가 하는 것도 인증의 일부로 간주한다.\\
MySQL에서 사용자 계정을 추가하고 권한을 추가하거나 제거하는데 GRANT와 REVOKE 명령을 사용하기를 권장한다.\\
사용자에게 허가된 것을 확인하려면 SHOW GRANTS 를 사용한다.

> `IDENTIFIED BY 'PASSWORD';` 는 권한부여를 하면서 비밀번호까지 변경하고자 하는 경우이므로 비밀번호는 변경하지 않으려면 이 부분을 빼면 된다.
{: .prompt-info }

### 사용권한 부여
```sql
mysql > GRANT ALL PRIVILEGES ON DB_NAME.TABLE_NAME TO USER_ID@host IDENTIFIED BY 'PASSWORD';
```

### 계정이 이미 존재 하는데 'identified by '비밀번호' 부분을 추가하면 비밀번호가 변경된다
```sql
mysql> GRANT ALL privileges ON DB_NAME.* TO USER_ID@locahost IDENTIFIED BY 'PASSWORD';
```

### 모든 원격지에서 접속 권한 추가
```sql
mysql> GRANT ALL privileges ON DB_NAME.* TO USER_ID@'%' IDENTIFIED BY 'PASSWORD';
```
> host에 '200.100.%' 로 하면 IP주소가 200.100.X.X 로 시작되는 모든 IP에서 원격 접속을 허용한다는 의미
{: .prompt-tip }
> host에 '200.100.100.50' 으로 하면 IP주소가 200.100.100.50 인 곳에서만 원격 접속을 허용한다는 의미
{: .prompt-tip }

### user에게 test 데이터베이스 모든 테이블에 대한 권한 부여
```sql
mysql> grant all privileges on test.* to userid@localhost identified by 'password';
```

### user에게 test 데이터베이스 모든 테이블에 select, insert, update 권한 부여
```sql
mysql> grant select, insert, update on test.* to user@localhost identified by 'password';
```

### user에게 test 데이터베이스 모든 테이블에 select, insert, update 권한 부여
```sql
mysql> grant select, insert, update on test.* to user@localhost;    -- 패스워드는 변경없이 권한만 부여하는 경우
```

### user에게 모든 데이터베이스 모든 테이블에 권한 부여
> 전역 권한은 모두 광범위한 보안문제가 수반되므로 권한을 허용하는 경우 신중해야 함
{: .prompt-warning }
```sql
mysql> grant all privileges on *.* to user@localhost identified by 'password' with grant option;
```

#### 변경된 내용을 반영(권한 적용)
```sql
mysql> flush privileges;
```

### 사용자에게 부여된 권한 확인
```sql
mysql> SHOW GRANTS FOR test@localhost;  -- userid 와 host명까지 붙여서 검색해야 함
mysql> SHOW GRANTS FOR test@'%';
mysql> SHOW GRANTS FOR test@'200.100.100.50';
```

### 사용자에게 데이터베이스 사용권한 제거
```sql
revoke all on DB_NAME.TABLE_NAME from USER_ID;  //모든 권한을 삭제
```

### 사용자 계정 삭제
```sql
mysql> drop user userid@'%';
mysql> drop user userid@localhost;
```