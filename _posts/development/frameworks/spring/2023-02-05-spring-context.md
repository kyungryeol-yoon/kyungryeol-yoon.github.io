---
title: "[Spring] Spring Context란?"
date: 2023-02-05
categories: [Framework, Spring]
tags: [Spring, Context]
---

## **Spring Context 란?**
- Bean의 확장 버전으로 Spring이 Bean을 다루기 좀 더 쉽도록 기능들이 추가된 공간이다.
- 단순히 Bean을 다루는 것 이외에도 추가적인 기능을 수행한다.

### **ROOT-CONTEXT (공통 부분)**

- 모든 서블릿이 공유할 수 있는 Bean들이 모인 공간.
- DB와 관련된 Repository, Service 등이 있음

### **SERLVET-CONTEXT (개별 부분)**

- 서블릿 각자의 Bean들이 모인 공간.
- 웹, 앱 마다 한 개씩 존재하므로 웹 앱 그자체를 의미하기도 함
- 이 Context 내에서의 Bean들은 서로 공유될 수 없음
- MVC의 Controller가 이에 해당된다.

## **Context의 구조**

### **1. Application Context**

- Spring Context 기능의 중심인 최상위 인터페이스
- 거의 Spring Context는 얘를 구현하며, 기능에 따라 앞에 "~~ApplicationContext"라고 붙음

### **2. AbstractApplication ContextApplication Context가 기능의 중심적인 역할을 수행한다면 이 Context는 Application Context를 구현한 추상 클래스로, 내부에 정의된 특수한 Bean들을 등록할 수 있음.**

### **3. GenericApplication Context**

- 이름부터 제너릭이듯, Context로서의 기능을 거의 다 갖고있다.
- 주로 수동으로 직접 Bean을 등록할 때 사용한다.
- XmlBeanDefinitionReader를 사용하여 xml 파일을 읽어와야 한다.
- 등록 과정이 좀 번거로움

### **4. GenericXmlApplicationContext**

- Bean을 배울 때 보통 가장 먼저 사용하는 인터페이스.
- AbstractApplication Context 을 확장한 인터페이스로 Context등록 과정이 간편화되어 있음
- 1번과 달리 xml 파일을 읽어오는 과정이 내부에 있으며, 다양한 루트로 설정 파일을 불러올 수 있다.

### **5. ClassPathXmlApplicationContext**

- GenericXmlApplicationContext과 비슷하지만, 클래스 경로로 Context를 불러오는 데 특화되어 있음

### **6. FileSystemXmlApplicationContext**

- 말 그대로 클래스 경로가 아닌 실제 파일 경로로 불러온다.
- 쓸데없이 길기도 하고 그냥 classPath를 사용하는 것을 권장 (정신건강에 좋음)

## **Web Application용 Context 종류**

### **1. SerlvetContext**

- Java 자체의 Context를 말함
- Spring도 Java로 만들어졌으므로, 모든 Spring Context는 ServletContext라고 할 수 있음

### **2. WebApplicationContext**

- 웹 애플리케이션에 특화된 Context
- 앞서 설명한 ROOT, Serlvet Context로 사용됨

### **3. ConfigurationWebApplicationContext**

- WebApplicationContext를 설정하는 데 쓰이는 Context
- WebContext를 설정해야할 때엔 Configurable 클래스로 바꿔서 설정함