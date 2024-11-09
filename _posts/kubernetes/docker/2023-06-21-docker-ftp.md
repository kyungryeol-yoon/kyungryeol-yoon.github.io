---
title: "[Docker] FTP 서버"
date: 2023-06-21
categories: [Docker, FTP]
tags: [Docker, FTP]
---

docker ftp

sudo netstat -natp | grep ftp
sudo vsftpd status
sudo vsftpd stop
sudo netstat -natp | grep LISTEN

sudo mkdir /appdata/appuser/ftpdata

sudo docker run --net=host -d -v /appdata/appuser/ftpdata:/home/vstfpd -it --name data-ftp --restart=always docker.io/ubuntu:20.04
sudo docker commit -p data-ftp data-ftp-backup
sudo docker stop data-ftp
sudo docker remove data-ftp
sudo docker run --net=host -d -v /appdata/appuser/ftpdata:/home/vstfpd -it --name data-ftp --restart=always data-ftp-backup

sudo docker ps -a
sudo docker exec -it data-ftp bash

apt install -y vsftpd

vi /etc/vsftpd.conf