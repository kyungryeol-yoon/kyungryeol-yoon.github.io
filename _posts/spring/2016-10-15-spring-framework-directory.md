---
# layout: post
title: "Spring framework 특징 및 구성, 구조"
date: 2016-10-15
# excerpt: "Spring framework 특징 및 구성, 구조(Directory)"
categories: [Spring, Framework]
tags: [Spring, Framework, Java, Programming]
# comments: true
---

## Spring framework란?
**"자바 엔터프라이즈 개발을 편하게 해주는 오픈소스 경량급 애플리케이션 프레임워크"**

## POJO(Plain Old Java Object) 기반의 구성

### POJO란?
오래된 방식의 간단한 자바 오브젝트라는 말로서 객체지향적인 원리에 충실하면서, 환경과 기술에 종속되지 않고 필요에 따라 재활용될 수 있는 방식으로 설계된 오브젝트를 의마한다.\\
즉, 별도의 API가 필요하지 않은 일반적인 자바 코드를 이용하여 개발이 가능하다.

#### POJO의 조건
* 특정 규챡에 종속되지 않는다.
* 특정 환경에 종속되지 않는다.

## DI(의존성 주입)을 통한 객체간의 관계구성
* 객체 간의 의존성을 개발자가 설정하는 것이 아닌 Spring 컨테이너가 주입시켜주는 기능
* 객체를 쉽게 확장하고 재사용할 수 있음.

## AOP(Aspect Oriented Programming, 관점 지향 프로그래밍) 지원
* 반복적인 코드를 줄이고, 개발자가 비지니스 로직에만 집중할 수 있도록 지원한다.
* 핵심로직이 중요하지, 부수적인 코드가 중요한 것이 아니다.
* Spring은 반드시 처리가 필요한 부분을 '횡단 관심사'라고 하며, 이러한 횡단 관심사를 분리해 제작하는 것이 가능

## 편리한 MVC 구조

## WAS에 종속적이지 않은 개발 환경

## IoC(Inversion of Control, 제어의 역전) = 객체에 대한 제어권
* 기존에는 개발자에게 제어권이 있었다. (new 연산자로 객체생성)
* 객체의 제어권을 스프링에게 넘김(개발자에게 편리함을 제공, 코드의 최소화)
* 인스턴스의 라이프 사이클(생성->소멸)을 개발자가 아닌 Spring 컨테이너가 담당

## 트랜잭션(Transaction)의 지원
복잡한 트랜잭션관리를 애노테이션이나 XML로 설정할 수 있기 때문에 개발자가 매번 상황에 맞는 코드를 작성할 수 없게 설계


# Spring Project Directory 구조

![](/images/spring/directory/src-main-java.png)
: **src/main/java :** 자바 코드 (컨트롤러, 모델)

![](/images/spring/directory/src-main-resources.png)
: **src/main/resources :** 자바 코드에서 사용할 리소스 (mapper, sql)

![](/images/spring/directory/src-test-java.png)
: **src/test/java :** 테스트 코드

![](/images/spring/directory/src-test-resources.png)
: **src/test/resources :** 테스트 코드에서 사용할 리소스

![](/images/spring/directory/maven-dependencies.png)
: **Maven Dependencies :** 라이브러리 관리도구 (Maven에서 다운받은 jar 파일)

![](/images/spring/directory/src-main-webapp.png)
: **src :** web 디렉토리
: **src/main/webapp/resources :** js, css, image 등을 관리
: **src/main/webapp/WEB-INF/classes :** 컴파일된 클래스
: **src/main/webapp/WEB-INF/spirng :** Spring 환경 설정 파일 (root-context.xml, servlet-context.xml)
: **src/main/webapp/WEB-INF/views :** html, jsp 파일<br/>
: **src/main/webapp/ :** 외부 접근 가능
: **src/main/webapp/WEB-INF :** 외부 접근 불가, 컨트롤러를 경유해서 접근 가능

### WEB-INF 폴더
외부에서 직접 접속이 차단되어있다.\\
그 이유는 컴파일된 클래스와 Spring 환경설정파일(DB연결정보)이 존재하기 때문이다.\\
JSP 또한 외부로 접속하여 수정되는 것을 방지하기 위한 보안 때문에 외부접근이 금지되어 있기 때문이다.

### pom.xml : maven에서 참조하는 환경설정파일
maven은 빌드와 관련된 정보를 프로젝트 객체모델(Project Object Model)이라는 이름으로 정의하고 사용하는데 pom이라는 이름으로 된 pom.xml 파일을 사용한다.

### maven의 로컬 저장소
* C:Users\사용자계정\.m2\repository

pom.xml에서 dependency 태그를 추가하고 설정하고 싶은 라이브러리를 추가하면 된다.\\
라이브러리는 maven repository에서 원하는 라이브러리를 검색하여 내용을 복사하여 추가해주면 maven이 알아서 jar파일을 로컬저장소에 다운받아준다.\\
https://mvnrepository.com/

여기서 Spring의 장점 중에 하나를 알 수 있다.\\
기존의 웹프로젝트의 경우에는 프로젝트에 필요한 모든 라이브러리 파일을 직접 다운로드 받아 해당 라이브러리 폴더에 적용시켜줘야했고, 각각의 프로젝트마다 다시 또 적용해야하는 불편함이 있었는데 Spring의 경우에는 denpendency 태그를 적용시켜주면 알아서 다운로드 받고 해당 프로젝트에 적용할 수 있다.\\
또한 다른 프로젝트 생성 시에는 같은 denpendency 태그만 적용시켜주면 별도의 다운로드가 필요없이 로컬저장소에 저장된 라이브러리를 자동으로 적용시켜준다.

### MVN repository에서 msyql 검색 후 dependency 태그 복수 후 pom.xml에 붙여넣기 하면 된다.
![](/images/spring/maven/mvn-repository.png)
