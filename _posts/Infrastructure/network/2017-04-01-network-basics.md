---
title: "[Network] 네트워크 기초 개념"
date: 2017-04-01
categories: [Network, Networking]
tags: [network, tcp, udp, protocol, devops]
---

## 🌐 네트워크 기초 개념

개발자라면 네트워크 기본 구조를 이해해야 애플리케이션 통신, 컨테이너 연결, 클라우드 인프라 문제를 해결하기 쉽습니다.

---

## 1️⃣ 네트워크란?

- 장치 간 데이터를 주고받는 구조
- **패킷(Packet)**: 네트워크 전송 최소 단위
- **프로토콜(Protocol)**: 통신 규약, 예: TCP, UDP, HTTP, HTTPS

---

## 2️⃣ 주요 장치

- **라우터(Router)**: 다른 네트워크 연결
- **스위치(Switch)**: 같은 네트워크 내 연결
- **방화벽(Firewall)**: 트래픽 허용/차단
- **게이트웨이(Gateway)**: 내부 → 외부 네트워크 연결 통로

---

## 3️⃣ 개발자 관점

- API 호출 실패, 컨테이너 통신 문제 시 **패킷 흐름 추적** 가능
- TCP/UDP 차이 이해 → 네트워크 지연/데이터 손실 디버깅
- 포트, 서브넷, 라우팅 경로 기본 이해 필요

---

## 4️⃣ 실무 팁

- `ping`, `traceroute`, `netstat`, `ss` 활용
- 클라우드: VPC, Security Group, Network ACL 이해
- 컨테이너: Pod-to-Pod 통신 구조 파악

💡 한 줄 기억:  
> **네트워크 이해 = 애플리케이션 연결 문제 해결 능력 향상**
