---
# layout: post
title: "RestController와 Controller (ResponseBody, ResponseEntity)"
date: 2016-10-20
categories: [Java, Spring]
# excerpt: "Restful한 Spring @ResponseBody, @RestController, @Controller VS, ResponseEntity"
tags: [Spring, Framework, Java, Programming, controller, MVC, restcontroller]
# comments: true
---

## REST의 탄생 배경

기존 웹서비스 전달 프로토콜인 SOAP(simple Object Access Protocol)은 HTTP응용 프로토콜로서 SOAP 헤더와 바디로 구성되어 있고, 메시지 송수신 시 헤더와 바디의 인코딩/디코딩 과정이 필수입니다. 따라서 기본 HTTP로 메시지를 전달하던 인터넷 서비스 분야에서는 원하는 기능에 비해 SOAP 프로토콜 처리의 오버헤드가 발생하는 문제가 있습니다.\\
(여기서 오버헤드란, 시스템에서 목적으로 하는 효과를 얻기 위해 본질적인 것은 아니지만 요구되는 작동, 또는 그 때문에 필요한 자원을 말합니다.)\\
이런 SOAP의 단점을 보완하고자 등장한 구현 기술이 바로 RESTful 웹서비스입니다. RESTful 웹서비스는 REST 기반의 웹서비스를 의미하고, HTTP의 기본 기능만으로 원격 정보에 접근하는 웹 응용 기술입니다.\\
RESTsms 웹의 창시자 중 한 사람인 Roy Fielding이 그의 박사 학위 논문에서, 현재의 웹 아키텍처가 웹의 본래 설계의 우수성을 활용하지 못하므로 웹의 장점을 최대한 활용할 수 있는 네트워크 기반의 아키텍처를 제안했는데 이것이 REST입니다.\\
REST는 REpresentational State Transfer의 약어로서 부수적인 레이어나 세션 관리를 추가하지 않고도 HTTP프로토콜로 데이터를 전달하는 프레임워크입니다. 또한 클라이언트/서버 간의 구성요소를 엄격히 분리하여 구현은 단순화시키고 확장성과 성능은 높일 수 있는 아키텍처입니다.

**REST는 SOAP와 같은 프로토콜이 아닙니다. REST는 architecture입니다. Resource를 기반으로 하는 architecture이기 때문에 시스템 설계도 Rest에 맞는 설계가 필요한 것입니다.**

### <code>@Controller VS</code>, <code>@RestController</code> (Controller와 RestController의 차이점)

전통적인 Spring MVC Controller와 Restful 웹서비스 Controller의 주요 차이점은 HTTP Response Body가 생성되는 방식이다. 기존의 MVC Controlloer는 view 기술을 사용하지만 Restful 웹서비스 Controller는 객체를 반환하기만 하면 객체 데이터는 Json/XML 형식의 HTTP 응답을 직접 작성하게 된다.\\
정리하자면, <code>@Controller</code>의 주 용도는 view(화면)을 return하는 것이고, <code>@RestController</code>는 데이터를 return하는 것이 주 용도라고 할 수 있다. 물론, <code>@Controller</code>의 경우 Method에 <code>@ResponseBody</code>를 사용하여 객체를 return 할 수도 있다.

### Spring MVC의 전통적인 Work Flow

![](/images/spring/traditional-mvc-work-flow.png)

1. Client는 URI 형식으로 웹서비스에 요청을 보낸다.
2. 요청은 Handler Mapping과 그 타입을 찾는 DispatcherServlet에 의해 인터셉트
3. 요청은 Controller에 의해 처리되고 응답은 DispatcherServlet으로 return된 후 DispatcherServlet은 View로 디스패치

위의 그림을 보면 전통적인 Spring MVC Work Flow는 ModelAndView 객체가 Controller에서 Client로 전달되는 것을 알 수 있다. <code>@ResponseBody</code> annotation을 사용하면 View를 return하지 않고 Controller에서 직접 데이터를 return 할 수 있다. Spring 4.0부터는 <code>@RestController</code> annotation을 통해 더 단순화 되었다.

Client -> Request -> DispatcherServlet -> HandlerMapping -> Controller -> View -> DispatcherServlet -> Response -> Client

#### Controller(BasicController)

```java
package com.chris.springmvcproj.controller.test;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/basic/*")
public class BasicController {
  @RequestMapping("/hello")
  public String helloWorld(){
    return "hello";
  }
}
```

#### View(hello.jsp)

```html
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title></title>
  </head>
  <body>
    Hello World
  </body>
</html>
```

### <code>@ResponseBody</code>

### Spring 3.x MVC Restful Web Service Work Flow

![](/images/spring/3x-mvc-restful-web-services-work-flow.png)

Client -> Request -> DispatcherServlet -> HandlerMapping -> Controller(ResponseBody) -> Response -> Client

#### Controller(BasicController2)

```java
@RequestMapping("/basic/*")
public class BasicController2 {
  @RequestMapping("/sendVO")
  //@ResponseBody <- Method 상단 또는 return 타입 앞에 annotation 추가
  public @ResponseBody BoardVO helloworld(){
    BoardVO vo = new BoardVO();
    vo.setBno(1);
    vo.setWriter("Chris");
    vo.setContent("게시글 내용입니다.");
    vo.setRecnt(1);
    vo.setTitle("게시글 1");
    vo.setUserName("Chris");

    return vo;
  }
}
```

<code>@ResponseBody</code>을 사용하면, Spring은 HTTP 응답에 return 값을 자동으로 변환해준다. Controller Class의 각 Method에 <code>@ResponseBody</code> annotation을 작성해줘야 한다.

### <code>@RestController</code>

### Spring 4.x MVC Restful Web Service Work Flow

![](/images/spring/4x-mvc-restful-web-services-work-flow.png)

Client -> HTTP Request -> DispatcherServlet -> HandlerMapping -> RestController(자동 ResponseBody 추가) -> HTTP Response -> Client

#### RestController(RestController)

```java
package com.chris.springmvcproj.controller.test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chris.springmvcproj.model.board.dto.BoardVO;

@RestController
@RequestMapping("/basic/*")
public class ControllerRest {
  // json객체 리턴
    @RequestMapping("/sendVO2")
    public BoardVO sendVO2(){
        BoardVO vo = new BoardVO();
        vo.setBno(1);
        vo.setWriter("Chris");
        vo.setContent("게시글 내용입니다");
        vo.setRecnt(1);
        vo.setTitle("게시글 1");
        vo.setUserName("Chris");
        return vo;
    }

    // json 객체 배열 리턴
    @RequestMapping("/sendList")
    public List<BoardVO> sendList(){
        // ArrayList 객체 생성
        List<BoardVO> items = new ArrayList<>();
        for(int i=1; i <=10; i++){
            BoardVO vo = new BoardVO(); //vo 객체 생성
            vo.setBno(i);
            vo.setWriter("Chris"+i);
            vo.setContent("게시글 내용입니다"+i);
            vo.setRecnt(i);
            vo.setTitle("게시글"+i);
            vo.setUserName("Chris"+i);
            items.add(vo); // 리스트에 vo추가
        }
        return items; // 리스트를 리턴함
    }

    // json객체를 map에 저장하여
    @RequestMapping("/sendMap")
    public Map<Integer, BoardVO> sendMap(){
        // Map<Key자료형, Value자료형>
        Map<Integer, BoardVO> map = new HashMap<Integer, BoardVO>();
        for(int i=1; i <=10; i++){
            BoardVO vo = new BoardVO(); //vo 객체 생성
            vo.setBno(i);
            vo.setWriter("Chris"+i);
            vo.setContent("게시글 내용입니다"+i);
            vo.setRecnt(i);
            vo.setTitle("게시글"+i);
            vo.setUserName("Chris"+i);
            map.put(i, vo); // 맵에 vo추가
        }
        return map;
    }
}
```

**Spring 4.0에서는 <code>@RestController</code> annotation이 추가 되었는데 Controller Class의 각 Method마다 <code>@ResponseBody</code>을 추가할 필요가 없어졌고, 모든 Method는 <code>@ResponseBody</code> annotation이 기본으로 작동이 된다.**

### ResponseEntity

- RestController는 별도의 View를 제공하지 않는 형태로 서비스를 실행하기 때문에, 때로는 결과데이터가 예외적인 상황에서 문제가 발생할 수 있다.
- ResponseEntity는 개발자가 직접 결과 데이터와 HTTP 상태 코드를 직접 제어할 수 있는 클래스로 개발자는 404나 500 같은 HTTP 상태 코드를 전송하고 싶은 데이터와 함께 전송할 수 있기 때문에 좀 더 세밀한 제어가 필요한 경우 사용할 수 있다.

```java
// ResponseEntity : 데이터 + http status code
@RequestMapping("/sendMap2")
public ResponseEntity<Map<Integer, BoardVO>> sendMap2(){
  // Map<Key 자료형, Value 자료형>
  // Map<Integer, BoardVO> map = new HashMap<Integer, BoardVO>();
  Map<Integer, BoardVO> map = new HashMap<Integer, BoardVO>();
  for(int i = 1; i <= 10; i++){
    BoardVO vo = new BoardVO(); //vo 객체 생성
    vo.setBno(i);
    vo.setWriter("Cris" + i);
    vo.setContent("게시글 내용입니다." + i);
    vo.setRecnt(i);
    vo.setTitle("게시글" + i);
    vo.setUserName("Chris" + i);
    map.put(i, vo); // map에 vo 추가
  }
  // return시 map과 상태 메시지를 함께 전송
  return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
}

@RequestMapping("/sendErrorAuth")
public ResponseEntity<Void> sendListAuth(){
  return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
}
```

### <code>@RestController</code> : View가 필요 없는 API만 지원하는 서비스에서 사용, <code>@ResponseBody</code>를 포함하고 있음. (View가 필요한 곳에서 <code>@RestController</code>를 사용해서 Class를 매핑해버리면, View로 접근을 못하는 문제가 있음)

### <code>@Controller</code> : API와 View를 동시에 사용, 대신 API 서비스는 <code>@ResponseBody</code>를 붙여줘야 함.