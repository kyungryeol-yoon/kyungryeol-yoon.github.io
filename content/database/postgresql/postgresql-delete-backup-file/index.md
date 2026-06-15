---
title: "[PostgreSQL] Delete Back up File"
date: 2023-12-02
tags: [database, postgresql, delete, backup, file]
description: "PostgreSQL 백업 파일을 주기적으로 삭제하는 방법. find로 7일·24시간 기준 오래된 덤프 파일을 정리하는 명령어를 정리합니다."
---

## BackUp File 삭제 Command

### 7일 기준

```yaml
command:
- /bin/bash
- -c
- |
  delete_date=$(date -d "7 day ago" +"%Y-%m-%d_%H:%M:%S")
  files=$(find /backups -type f)
  for file in $files; do
    if [[ $file =~ day ]]; then
      created=$(stat -c %y $file)
      echo $created
      if [[ $created < $ delete_date ]]; then
        echo "삭제할 파일: $file"
        rm $file
      fi
    fi
  done
```

### 24시간 기준

```yaml
command:
- /bin/bash
- -c
- |
  delete_date=$(date -d "24 hour ago" +"%Y-%m-%d_%H:%M:%S")
  files=$(find /backups -type f)
  for file in $files; do
    if [[ $file =~ min ]]; then
      created=$(stat -c %y $file)
      echo $created
      if [[ $created < $ delete_date ]]; then
        echo "삭제할 파일: $file"
        rm $file
      fi
    fi
  done
```