---
title: "[Linux] Stress"
date: 2025-05-17
categories: [OS, Linux]
tags: [linux, stress]
---

## 개요
- linux에서 부하 테스트를 하기 위해서 대부분 stress라는 tool은 사용한다.

## stress 옵션

```bash
Usage: stress [OPTION [ARG]] ...
 -?, --help         show this help statement
     --version      show version statement
 -v, --verbose      be verbose
 -q, --quiet        be quiet
 -n, --dry-run      show what would have been done
 -t, --timeout N    timeout after N seconds
     --backoff N    wait factor of N microseconds before work starts
 -c, --cpu N        spawn N workers spinning on sqrt()
 -i, --io N         spawn N workers spinning on sync()
 -m, --vm N         spawn N workers spinning on malloc()/free()
     --vm-bytes B   malloc B bytes per vm worker (default is 256MB)
     --vm-stride B  touch a byte every B bytes (default is 4096)
     --vm-hang N    sleep N secs before free (default none, 0 is inf)
     --vm-keep      redirty memory instead of freeing and reallocating
 -d, --hdd N        spawn N workers spinning on write()/unlink()
     --hdd-bytes B  write B bytes per hdd worker (default is 1GB)
```

## Example

```bash
stress --cpu 8 --io 4 --vm 2 --vm-bytes 128M --timeout 10s
```

## CPU 부하

```bash
stress -c <Core 수>
```

## Memory 부하

- 사용할 크기의 단위 : b(byte) ,k(killo byte) , m(mega byte) , g(giga byte)

```bash
stress –vm <프로세스 수> –vm-bytes <사용할 크기>
ex)stress -vm 2 –vm-bytes 2048m
```

## HDD write 부하

```bash
stress –hdd <write에 사용할 worker 수> –hdd-bytes <사용할 크기>
ex) stress –hdd 3 -hdd-bytes 1024m
```

## I/O  부하

```bash
stress -i <sync를 사용하여 i/o 부하를 발생 시킬 worker의수>
```