---
# layout: post
title: "[Java] Synchronized"
date: 2017-05-13
categories: [Programming, Java]
tags: [Java, Synchronized]
# comments: true
---

- Java에서 프로그래밍을 한다면 Multi-Thread로 인하여 동기화를 제어해야하는 경우가 생긴다.
- 그 때 Java에서 제공하는 키워드인 synchronized 키워드를 사용하게 되는데, Multi-Thread 상태에서 동일한 자원을 동시에 접근하게 되었을 때 동시 접근을 막게 된다.
- 즉 공유 데이터에 lock을 걸어서 먼저 작업 중이던 쓰레드가 작업을 완전히 끝낼 때까지는 다른 쓰레드에게 제어권이 넘어가더라도 데이터가 변경되지 않도록 보호함으로써 쓰레드의 동기화를 가능하게 한다.
- synchronized 외에 volatile을 사용할 수 있고, Atomic 클래스를 사용할 수도 있다.

1. Method에 synchronized 하기
2. 블록에 synchronized 하기

## **먼저 Multi-Thread 환경에서 synchronized를 사용하지 않을 경우**

1. 계좌에는 1000원이 있다.
2. 100 ~ 300 으로 랜덤하게 계좌에서 출금을 할 수 있다.
3. 계좌에서 출금을 하는데 잔액이 출금하는 돈보다 크다면 출금이 가능하다.
4. Multi-Thread 방식으로 2명이 출금을 한다.

```java
class Account {
  int balance = 1000;
  
  public void withDraw(int money) {
    if(balance >= money) {
      try {
        Thread thread = Thread.currentThread();
        System.out.println(thread.getName() + " money : " + money);
        Thread.sleep(1000);
        balance -= money;
        System.out.println(thread.getName() + " balance : " + balance);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }
  }

class Task implements Runnable {
  Account acc = new Account();

  @Override
  public void run() {
    while(acc.balance > 0) {
      int money = (int)((Math.random() * 3) + 1) * 100;
      acc.withDraw(money);
    }
  }
}

public class ThreadSynchronizedTest {
  public static void main(String[] args) {
    Task task = new Task();
    Thread thread1 = new Thread(task);
    thread1.setName("No.1");
    Thread thread2 = new Thread(task);
    thread2.setName("No.2");
    thread1.start();
    thread2.start();
  }
}
```

```
No.2 money : 200
No.1 money : 100
No.1 balance : 700
No.1 money : 300
No.2 balance : 700
No.2 money : 200
No.1 balance : 200
No.1 money : 100
No.2 balance : 200
No.2 money : 200
No.1 balance : 100
No.2 balance : -100
```

- 잔액이 -100이 되 버렸다.
- 한 쓰레드가 if문의 조건식을 통과하고 출금하기 바로 직전에 다른 쓰레드가 끼어들어서 출금을 먼저 했기 때문이다.
- 위의 예제에서는 상황 설명을 위해 if문을 실행하고 다른 스레드에게 제어권을 넘겨주기 위해 Thread.sleep(1000)을 주었다.
- 하지만 Thread.sleep을 사용하지 않더라도 위와 같은 상황은 충분히 발생할 수 있다.

- 이렇게 동기화를 하지 않으면 의도치 않은 일이 발생할 지도 모른다.
- 사용자가 의도한 대로 정상적인 결과를 얻으려면 객체, 함수, 또는 변수에 synchronized를 사용해야 한다.


## **Method에 synchronized**

- Instance Method의 동기화는 이 Method를 가진 Instance를 기준으로 이루어진다.
- 그러므로 한 클래스에 synchronized를 사용한 Method를 가진다면, 여기서 동기화는 Instance를 기준으로 이루어진다.
- 그리고 오직 하나의 Thread 만이 동기화된 Instance Method를 실행할 수 있다.
- 결론은 synchronized를 사용한 Method가 존재한다면 Instance당 한 개의 Thread만이 접근할 수 있다.
- 쉽게 생각하면 Method에 synchronized를 사용하면 그 함수가 포함된 객체(this)가 lock이 걸린 것이다. 

```java
public synchronized void synchronizedTest () {

}
```

- 위의 예제에서 Method에 synchronized를 사용하려면 아래와 같이 사용하면 된다.

```java
public synchronized void withDraw(int money) {
  if(balance >= money) {
    try {
      Thread thread = Thread.currentThread();
      System.out.println(thread.getName() + " money : " + money);
      Thread.sleep(1000);
      balance -= money;
      System.out.println(thread.getName() + " balance : " + balance);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}
```

## **블록에 synchronized**

- 아래 synchronized 키워드 괄호 사이에 락(Lock)이라 부르는 객체를 볼 수 있다.
- 위에서 설명했듯이 동기화과 공유 자원에 대한 접근을 허락한다고 정의한 바 있다.
- 즉 synchronized 키워드는 공유 자원에 대한 범위를 지정하는 기능을 하며 synchronized() 괄호 안에 있는락 객체는 다른 스레드의 접근을 차단하거나 접근을 허용하는 일종의 자물쇠 역할을 한다.

```java
synchronized([락(Lock) 객체]) {

}
```

```java
public void withDraw(int money) {
  synchronized(this) {
    if(balance >= money) {
      try {
        Thread thread = Thread.currentThread();
        System.out.println(thread.getName() + " money : " + money);
        Thread.sleep(1000);
        balance -= money;
        System.out.println(thread.getName() + " balance : " + balance);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }
}
```

- 락 객체는 문지기 역할을 해서 오직 하나의 스레드만이 동기화 블록에 접근할 수 있다.

- 동기화는 락을 필요로 하며 락은 모든 객체마다 존재한다.
- Method 제어자 뒤에 synchronized 키워드가 위치한 동기화 Method는 락 객체를 지정하는 부분이 없다.
- 동기화 Method는 내부적으로 자신의 객체를 락으로 사용한다.
- 즉, 객체 스스로 Method 전체를 감시하는 역할을 한다.
- 이에 반해서 동기화 블록은 Method 안의 특정 부분을 동기화할 수 있다.
- 이런 경우에 락 객체는 자기 자신 객체를 의미하는 this 키워드를 사용할 수도 있지만 다른 객체를 락으로 사용할 수 있다.
- 단, 락 객체가 여러 개라면 우리가 원하는 동기화 작업을 제대로 실행할 수 없다.
- 그래서 보통은 락 객체를 하나만 사용하는 경우가 많다.
- 동기화 블록을 사용하는 경우, 해당 Method는 여러 스레드가 동시에 점유할 수 있다.
- 하지만 동기화된 블록에 이르면 락 객체에 의해서 모든 스레드들은 실행을 중단하고 자신의 차례가 될 때까지 대기한다.
