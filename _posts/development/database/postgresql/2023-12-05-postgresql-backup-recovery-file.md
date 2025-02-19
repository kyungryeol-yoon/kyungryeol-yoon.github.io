---
title: "[PostgreSQL] BackUp 및 Recovery 방법"
date: 2023-12-05
categories: [Database, PostgreSQL]
tags: [database, postgresql, backup, recovery]
---

## BackUp 및 Recovery 방법

- `pg_dumpall -U admin > /var/lib/postgresql/dump/backup_20231205.sql`
- `psql -U admin > -f /var/lib/postgresql/dump/backup_20231205.sql testdb`

  ```yaml
  command:
  - /bin/bash
  - -c
  - |
    ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
    su
    cd
    echo "test-svc.test-ns.svc.cluster.local:5432:postgres:admin:admin1!" > .pgpass
    echo "Save pgpass"
    chmod 600 ~/.pgpass
    BACKUP_DIR="/var/lib/postgresql/dump"
    BACKUP_FILE="(date +"%Y-%m-%d_%H-%M-%S")_day
    echo $BACKUP_FILE
    echo "Start BackUp"
    pg_dump -U admin -w -h test-svc.test-ns.svc.cluster.local -p 5432 -T tb_test -F c postgres > ${BACKUP_DIR}/${BACKUP_FILE}.sql
    echo "Finish BackUp"
    echo "Start Compress"
    cd ..
    tar -zcvf /var/lib/postgresql/$BACKUP_FILE.tar.gz /var/lib/postgresql/$BACKUP_FILE.sql
    echo "Finish Compress"
    rm -rf /var/lib/postgresql/$BACKUP_FILE.sql
    echo "Deleted SQL File"
  ```

- `pg_restore -U admin -C -Fc -d postgres 20231205010801.sql`

  ```yaml
  command:
  - /bin/bash
  - -c
  - |
    ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
    su
    cd
    echo "test-svc.test-ns.svc.cluster.local:5432:postgres:admin:admin1!" > .pgpass
    echo "Save pgpass"
    chmod 600 ~/.pgpass
    BACKUP_DIR="/backups"
    BACKUP_FILE="(date +"%Y-%m-%d_%H-%M-%S")_day
    echo $BACKUP_FILE
    echo "Start BackUp"
    pg_dump -U admin -w -h test-svc.test-ns.svc.cluster.local -p 5432 -T tb_test -F c postgres > ${BACKUP_DIR}/${BACKUP_FILE}.sql
    echo "Finish BackUp"
    echo "Start Compress"
    cd ..
    tar -zcvf /backups/$BACKUP_FILE.tar.gz /backups/$BACKUP_FILE.sql
    echo "Finish Compress"
    rm -rf /backups/$BACKUP_FILE.sql
    echo "Deleted SQL File"
  ```