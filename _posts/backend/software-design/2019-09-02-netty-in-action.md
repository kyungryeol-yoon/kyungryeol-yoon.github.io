---
title: "[Netty] Netty in Action 요약 및 실무 활용"
date: 2019-09-02
categories: [Backend, Software-Design]
tags: [netty, java, network, nio, asynchronous, reactor, tcp, udp]
---

## ⚡ Netty in Action 요약과 실무 활용

**Netty**는 Java 기반의 **비동기 이벤트 기반 네트워크 애플리케이션 프레임워크**입니다.  
책 *Netty in Action*은 Netty의 핵심 개념과 실무 적용법을 자세히 설명합니다.

이 글에서는 다음 내용을 다룹니다:

- Netty 핵심 개념
- 아키텍처 및 이벤트 처리 모델
- Channel, Pipeline, Handler 이해
- TCP/UDP 서버/클라이언트 실무 활용
- 실무에서 Netty 활용 팁

---

## 1️⃣ Netty 핵심 개념

- **비동기(Asynchronous)**: 모든 I/O 작업이 논블로킹 방식  
- **이벤트 기반(Event-driven)**: 이벤트 발생 시 Handler가 동작  
- **Reactor 패턴**: 이벤트 루프(EventLoop)가 I/O 이벤트를 감지하고 분배

> 🔹 장점: 고성능, 높은 동시성, 낮은 스레드 오버헤드

---

## 2️⃣ 아키텍처 개요

Netty의 아키텍처는 **Channel → Pipeline → Handler** 구조를 중심으로 이해합니다.

```

Client/Server
│
Channel ──> Pipeline ──> Handler

```

- **Channel**: 소켓 연결, 읽기/쓰기 I/O 인터페이스  
- **Pipeline**: Channel 이벤트를 처리할 Handler의 연결 체인  
- **Handler**: 실제 이벤트 처리 로직, 인코딩/디코딩, 비즈니스 로직 담당

---

## 3️⃣ EventLoop와 Thread 모델

- Netty는 **Reactor + EventLoop** 모델 사용  
- EventLoop가 I/O 이벤트를 감지하고 등록된 Handler 호출  
- 하나의 EventLoop는 여러 Channel을 처리 가능 → 스레드 최소화

```

EventLoopGroup
├─ EventLoop 1 → Channel A, B
├─ EventLoop 2 → Channel C, D

```

> 🔹 Thread-per-connection 모델보다 훨씬 효율적

---

## 4️⃣ TCP 서버 예제

```java
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
EventLoopGroup workerGroup = new NioEventLoopGroup();
try {
    ServerBootstrap b = new ServerBootstrap();
    b.group(bossGroup, workerGroup)
     .channel(NioServerSocketChannel.class)
     .childHandler(new ChannelInitializer<SocketChannel>() {
         @Override
         public void initChannel(SocketChannel ch) {
             ch.pipeline().addLast(new MyBusinessHandler());
         }
     });
    ChannelFuture f = b.bind(8080).sync();
    f.channel().closeFuture().sync();
} finally {
    bossGroup.shutdownGracefully();
    workerGroup.shutdownGracefully();
}
```

* **ServerBootstrap**: 서버 설정
* **ChannelInitializer**: Pipeline 설정
* **MyBusinessHandler**: 이벤트 처리

---

## 5️⃣ UDP 서버 예제

```java
Bootstrap b = new Bootstrap();
b.group(new NioEventLoopGroup())
 .channel(NioDatagramChannel.class)
 .handler(new SimpleChannelInboundHandler<DatagramPacket>() {
     @Override
     protected void channelRead0(ChannelHandlerContext ctx, DatagramPacket packet) {
         // 패킷 처리
     }
 });
b.bind(9999).sync().channel().closeFuture().await();
```

* **NioDatagramChannel**: UDP 지원
* Handler에서 패킷 단위로 처리

---

## 6️⃣ 실무 활용 팁

* 📝 **Handler 분리**: 인코딩/디코딩과 비즈니스 로직을 분리
* 📝 **Pipeline 활용**: ChannelPipeline을 통해 이벤트 흐름 제어
* 📝 **Backpressure 관리**: Channel 옵션과 수신 처리 속도 조절
* 📝 **Connection 관리**: IdleStateHandler로 연결 유지/종료 관리
* 📝 **Netty + Spring Boot**: Embedded Netty 서버로 비동기 REST/WebSocket 구현 가능

---

## 7️⃣ 요약

* **Netty** = 비동기 + 이벤트 기반 + Reactor 패턴 기반 네트워크 프레임워크
* **핵심 구조**: Channel → Pipeline → Handler
* TCP/UDP 모두 지원, 고성능 서버 개발에 최적화
* 실무에서는 **Handler 설계, Pipeline 구조, 이벤트 흐름** 이해가 핵심

> 💡 결론: Netty는 단순 I/O 라이브러리가 아니라,
> **고성능 네트워크 애플리케이션을 구조적으로 설계할 수 있는 프레임워크**입니다.
