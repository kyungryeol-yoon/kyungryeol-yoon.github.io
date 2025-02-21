---
title: "[Gitlab] Back up & Restore"
date: 2025-02-19
categories: [DevOps, Gitlab]
tags: [gitlab, backup, restore, docker]
---

## Back up

```bash
gitlab-backup create
```

- 위 명령어를 실행하면 .tar 백업파일이 생성된다.
- 생성된 백업파일은
  - `/var/opt/gitlab/backups` 경로에 저장된다.

### 만약 백업파일의 경로를 변경하려면

```bash
vi /etc/gitlab/gitlab.rb
```

### 아래내용 수정

```
gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"
```

## Restore

- 만약 다른 서버에 gitlab을 설치하고 복원하기를 원한다면 위에서 백업한 gitlab과 동일한 버전으로 설치하여야 한다.
- 백업파일을 새로 gitlab을 설치한 서버의 동일한 경로에 옮긴다.

### 백업파일의 소유자 변경

```bash
cd /var/opt/gitlab/backups/
chown git:git 1707880170_2024_02_14_16.8.1_gitlab_backup.tar
```

### gitlab 서비스 중단

```bash
sudo gitlab-ctl stop puma
sudo gitlab-ctl stop sidekiq
# Verify
sudo gitlab-ctl status
```

### 복원

```bash
sudo gitlab-backup restore BACKUP=11493107454_2018_04_25_10.6.4-ce
```

### 재시작

```bash
sudo gitlab-ctl restart
sudo gitlab-rake gitlab:check SANITIZE=true
```

## 자동 백업구성

- 시간대 확인
  - 현재 서버의 시간대를 확인해서 원하는 시간에 실행되도록 한다.

  ```bash
  # Asia/Seoul 시간대로 설정
  timedatectl set-timezone Asia/Seoul
  ```

- reboot

  ```bash
  reboot
  ```

- crontab 설정

  ```bash
  crontab -e
  ```

  ```
  # 아래 내용 추가
  # 매주 수요일 00시 30분에 백업실행
  30 0 * * 3 sh /opt/gitlab/bin/gitlab-backup create
  ```

## Gitlab Container Back up & Restore

### Back up

```bash
docker exec -t <container name> gitlab-backup create
```

#### Backup options

- 대부분의 경우에는 정상적으로 작동하지만, 데이터가 빠르게 변경될 때 문제가 발생할 수 있다.
- tar이 데이터를 읽는 도중 데이터가 변경되면 오류 file changed as we read it가 발생하여 백업 프로세스가 실패할 수 있다.
  - 이 경우, copy라는 백업 전략을 사용할 수 있다. 이 전략은 tar와 gzip를 호출하기 전에 데이터 파일을 임시 위치로 복사하여 오류를 피한다.
    - 기본 스트리밍 전략 대신 copy 전략을 사용하려면 Rake 작업 명령에 `STRATEGY=copy`를 지정하면 된다.

      ```bash
      docker exec -t <container name> gitlab-backup create STRATEGY=copy
      ```

#### Back up 파일 확인

- `/var/opt/gitlab/backups` 경로
  - `[Timestamp of backup creation]_[Date (YYYY_MM_DD)]_[GitLab version]_[GitLab edition]_gitlab_backup.tar`와 같은 형태로 백업파일이 생성

> 참고
- gitlab 공식 문서 : <https://docs.gitlab.com/administration/backup_restore/backup_archive_process>
{: .prompt-info }

### Resotre

- 데이터베이스에 연결된 프로세스를 중지 및 확인

  ```bash
  # Stop the processes that are connected to the database
  docker exec -it <name of container> gitlab-ctl stop puma
  docker exec -it <name of container> gitlab-ctl stop sidekiq

  # Verify that the processes are all down before continuing
  docker exec -it <name of container> gitlab-ctl status
  ```

- BACKUP 변수에 복원 대상이 되는 파일명을 기준
  - 예를들어 `1493107454_2018_04_25_10.6.4-ce_gitlab_backup.tar` 이 파일 이름이라면 `_gitlab_backup.tar` 의 앞부분까지의 문자열인 `1493107454_2018_04_25_10.6.4-ce` 까지를 입력해주면 된다.

    ```bash
    # Run the restore. NOTE: "_gitlab_backup.tar" is omitted from the name
    docker exec -it <name of container> gitlab-backup restore BACKUP=11493107454_2018_04_25_10.6.4-ce
    ```

- 작업이 완료된 이후 Container를 재시작

#### Restart

```bash
# Restart the GitLab container
docker restart <name of container>
```

```bash
# Check GitLab
docker exec -it <name of container> gitlab-rake gitlab:check SANITIZE=true
```

> 참고
- Gitlab Back up : <https://docs.gitlab.com/administration/backup_restore>
- Gitlab Archive Process : <https://docs.gitlab.com/administration/backup_restore/backup_archive_process>
- Gitlab Restore : <https://docs.gitlab.com/administration/backup_restore/restore_gitlab>
{: .prompt-info }