---
title: "[Docker] BackUp 및 Recovery 방법"
date: 2023-12-09
categories: [Docker, Image]
tags: [Docker, Image, BackUp]
---

## docker image backup
```bash
docker save -o test-image.tar harbor.local.com/test-python/test-api:batch_v1.3
scp test-image.tar user@ip주소:/home/user
docker load -i test-image.tar


sudo docker save -o $(pwd)/test-api.tar test-api:latest
sudo docker save -o $(pwd)/mongo.tar mongo:4.2
sudo docker save -o $(pwd)/redis.tar redis:7.0
sudo docker save -o $(pwd)/mysql.tar mysql:8.0

sudo docker load -i test-api.tar && sudo docker load -i mongo.tar && sudo docker load -i redis.tar && sudo docker load -i mysql.tar
```