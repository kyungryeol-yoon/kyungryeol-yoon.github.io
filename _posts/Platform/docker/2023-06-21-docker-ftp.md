---
title: "[Docker] FTP 서버"
date: 2023-06-21
categories: [Docker, FTP]
tags: [docker, ftp]
---

## docker ftp

- 공유할 폴더 생성
    ```bash
    sudo mkdir /appdata/appuser/ftpdata
    ```

- container 생성 및 백업
    ```bash
    sudo docker run --net=host -d -v /appdata/appuser/ftpdata:/home/vstfpd -it --name data-ftp --restart=always docker.io/ubuntu:20.04
    sudo docker commit -p data-ftp data-ftp-backup
    sudo docker stop data-ftp
    sudo docker remove data-ftp
    sudo docker run --net=host -d -v /appdata/appuser/ftpdata:/home/vstfpd -it --name data-ftp --restart=always data-ftp-backup
    ```

- docker 목록 조회
    ```bash
    sudo docker ps -a
    ```

## vsftpd 설치

- container 접속
    ```bash
    sudo docker exec -it data-ftp bash
    ```

- vsftpd 설치
    ```bash
    apt-get update
    apt-get install -y vsftpd
    apt-get install -y vim
    ```

## vsftpd 설정 파일 수정

- `vi /etc/vsftpd.conf`
    ```conf
    # 패시브 모드 활성화
    pasv_enable=YES

    # Data 포트 범위설정
    pasv_min_port=30001
    pasv_max_port=30001

    # 패시브모드로 연결될 ip(포트제외 서버ip만 적어주세요)
    pasv_address=serverIp
    ```

- vsftpd 재시작
    ```bash
    service vsftpd restart
    ```

- vsftpd 확인
    ```bash
    sudo netstat -natp | grep ftp
    sudo vsftpd status

    sudo netstat -natp | grep LISTEN

    # vsftpd 멈춘다면
    sudo vsftpd stop
    ```

- user 추가
    ```bash
    adduser testuser
    ```

## FTP 접속

- ftp 프로그램 또는 command로 접속

## 파일 업로드 또는 수정이 안된다면?

- 3가지 설정을 주석처리 해서 권한수정
    ```conf
    #chroot_local_user=YES
    #chroot_list_enable=YES
    #chroot_list_file=/etc/vsftpd.chroot_list
    ```