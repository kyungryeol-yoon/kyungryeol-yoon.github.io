---
title: "[Spring] Annotation & Reflection이란?"
date: 2018-01-13
categories: [Framework, Spring]
tags: [spring, java, annotation, reflection]
---

## Annotation이란?
코드 사이에 주석처럼 쓰이며 특별한 의미, 기능을 수행하도록 하는 기술이다.\\
프로그램에게 추가적인 정보를 제공해주는 메타데이터라고 볼 수 있다.\\
**meta data** : 데이터를 위한 데이터

### 다음은 어노테이션의 용도를 나타낸 것이다.

컴파일러에게 코드 작성 문법 에러를 체크하도록 정보를 제공한다.\\
소프트웨어 개발 툴이 빌드나 배치시 코드를 자동으로 생성할 수 있도록 정보를 제공한다.\\
실행시(런타임시)특정 기능을 실행하도록 정보를 제공한다.

`코드가 실행되는 중에 Reflection을 이용하여 추가 정보를 획득하여 기능을 실시한다.`

## Reflection이란?
Heap 영역에 로드된 Class 타입의 객체를 통해, 원하는 클래스의 인스턴스를 생성할 수 있도록 지원하고, 인스턴스의 필드와 메소드를 접근 제어자와 상관 없이 사용할 수 있도록 지원하는 API\\
Java와 같은 객체 지향 프로그래밍 언어에서 Reflection을 사용하면 컴파일 타임에 인터페이스, 필드, 메소드의 이름을 알지 못해도 실행 중에 클래스, 인터페이스, 필드 및 메소드에 접근할 수 있다.

### 방법

- 클래스.class로 가져오기
- 인스턴스.getClass()로 가져오기
- Class.forName("클래스명")으로 가져오기

```java
public class Member {
  private String name;
  protected int age;
  public String nickname;

  public Member() {
  }

  public Member(String name, int age, String nickname) {
    this.name = name;
    this.age = age;
    this.nickname = nickname;
  }

  public void speak(String message) {
    System.out.println(message);
  }

  private void secret() {
    System.out.println("비밀번호 486 입니다.");
  }

  @Override
  public String toString() {
    return "Member{" +
        "name='" + name + '\'' +
        ", age=" + age +
        ", nickname='" + nickname + '\'' +
        '}';
  }
}

public class Main {
  public static void main(String[] args) throws ClassNotFoundException {
    Class<Member> memberClass = Member.class;
    System.out.println(System.identityHashCode(memberClass));

    Member member = new Member("KyungRyeol", 22, "Chris");
    Class<? extends Member> memberClass2 = member.getClass();
    System.out.println(System.identityHashCode(memberClass2));

    Class<?> memberClass3 = Class.forName("{패키지명}.Member");
    System.out.println(System.identityHashCode(memberClass3));
  }
}
```

#### getConstructor()를 통해 생성자를 얻어 오고, newInstance()를 통해 Member 인스턴스를 동적으로 생성해 줄 수 있다.
```java
public class Main {
  public static void main(String[] args) throws Exception {
    // Member의 모든 생성자 출력
    Member member = new Member();
    Class<? extends Member> memberClass = member.getClass();
    Arrays.stream(memberClass.getConstructors()).forEach(System.out::println);

    // Member의 기본 생성자를 통한 인스턴스 생성
    Constructor<? extends Member> constructor = memberClass.getConstructor();
    Member member2 = constructor.newInstance();
    System.out.println("member2 = " + member2);

    // Member의 다른 생성자를 통한 인스턴스 생성
    Constructor<? extends Member> fullConstructor =  memberClass.getConstructor(String.class, int.class, String.class);
    Member member3 = fullConstructor.newInstance("KyungRyeol", 2, "dev doodles");
    System.out.println("member3 = " + member3);
  }
}
```

#### 인스턴스의 필드와 메소드를 접근 제어자와 상관 없이 접근
getDeclaredFileds()를 통해 클래스의 인스턴스 변수를 모두 가져올 수 있고, get()을 통해 필드 값을 반환받을 수 있고, set() 을 통해 필드 값을 수정할 수 있는 것을 알 수 있다.\\
이때 주의할 점은 private 접근 제어자가 있는 필드에 접근할 때는 setAccessible()의 인자를 true로 넘겨주어야 한다.\\
메소드도 getDeclaredMethod()를 통해 메소드를 가져올 수 있다.\\
이때 메소드의 이름과 파라미터의 타입을 같이 인자로 넘겨줘야 한다.\\
마찬가지로 private 접근 제어자가 있는 메소드에 접근할 때는 setAccessible()의 인자를 true로 설정해야 한다.\\
마지막으로 invoke() 메소드를 통해 리플렉션 API로 얻어 온 메소드를 호출할 수 있다.

```java
public class Main {
  public static void main(String[] args) throws Exception {
    Member member = new Member("KyungRyeol", 2, "dev doodles");
    Class<? extends Member> memberClass = member.getClass();

    // 필드 접근
    Field[] fields = memberClass.getDeclaredFields();
    for (Field field : fields) {
        field.setAccessible(true);
        System.out.println(field.get(member));
    }
    fields[0].set(member, "KyungRyeol");
    System.out.println(member);

    // 메소드 접근
    Method speakMethod = memberClass.getDeclaredMethod("speak", String.class);
    speakMethod.invoke(member, "Reflection Test");

    Method secretMethod = memberClass.getDeclaredMethod("secret");
    secretMethod.setAccessible(true);
    secretMethod.invoke(member);
  }
}
```

### 장점
- 런타임 시점에서 클래스의 인스턴스를 생성하고, 접근 제어자와 관계 없이 필드와 메소드에 접근하여 필요한 작업을 수행할 수 있는 유연성을 가지고 있다.

### 단점
- 캡슐화를 저해한다.
- 런타임 시점에서 인스턴스를 생성하므로 컴파일 시점에서 해당 타입을 체크할 수 없다.
- 런타임 시점에서 인스턴스를 생성하므로 구체적인 동작 흐름을 파악하기 어렵다.
- 단순히 필드 및 메소드를 접근할 때보다 Reflection을 사용하여 접근할 때 성능이 느리다. (모든 상황에서 성능이 느리지는 않음)


Reflection API를 통해 런타임 중, 클래스 정보에 접근하여 클래스를 원하는 대로 조작할 수 있다.\\
심지어 private 접근 제어자로 선언한 필드나 메소드까지 조작이 가능하다.\\
프레임워크와 같이 큰 규모의 개발 단계에서는 수많은 객체와 의존 관계를 파악하기 어렵다.\\
이때 Reflection을 사용하면 동적으로 클래스를 만들어서 의존 관계를 맺어줄 수 있다.\\

가령, Spring의 Bean Factory를 보면, @Controller, @Service, @Repository 등의 Annotation만 붙이면 Bean Factory에서 알아서 해당 Annotation이 붙은 클래스를 생성하고 관리해 주는 것을 알 수 있다.\\
개발자는 Bean Factory에 해당 클래스를 알려준 적이 없는데, 이것이 가능한 이유는 바로 Reflection 덕분이다.\\
런타임에 해당 Annotation이 붙은 클래스를 탐색하고 발견한다면, Reflection을 통해 해당 클래스의 인스턴스를 생성하고 필요한 필드를 주입하여 Bean Factory에 저장하는 식으로 사용이 된다.\\
물론, 캡슐화를 저해하므로 꼭 필요한 상황에서만 사용하는 것이 좋다.