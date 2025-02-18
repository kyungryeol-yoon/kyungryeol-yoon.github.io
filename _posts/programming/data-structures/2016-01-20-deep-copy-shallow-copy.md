---
# layout: post
title: "Deep Copy & Shallow Copy : 깊은 복사 & 얕은 복사"
date: 2016-01-20
# excerpt: "객체가 가진 값 형식(Value Type) 과 참조형식(Reference Type) 의 복제 방식에 따라 얕은복사와 깊은 복사로 개념이 나뉜다."
categories: [Programming, Data Structures]
tags: [Deep Copy, Shallow Copy, Programming]
# comments: true
---

- 얕은 복사(shallow copy)와 깊은 복사(deep copy)는 객체 복사의 방식에 따라 차이가 있다.

## Python에서의 얕은 복사와 깊은 복사

### 얕은 복사 (Shallow Copy)

- Python에서 **얕은 복사**는 객체를 복사할 때, 원본 객체가 참조하는 객체들(즉, 리스트나 딕셔너리와 같은 복합 객체들)은 복사하지 않고 원본 객체의 참조만 복사하는 방식이다.
- 즉, 새로운 객체가 생성되지만, 그 객체가 참조하는 내용은 여전히 원본 객체와 동일하다.
  - `list.copy()` 또는 `copy.copy()`를 사용하여 얕은 복사를 만들 수 있다.
  - 얕은 복사에서 복사된 객체는 독립적인 객체이지만, 그 객체 내부의 참조된 요소들은 여전히 원본 객체의 요소들과 연결되어 있다.


```python
import copy

# 원본 리스트
original = [1, 2, [3, 4]]

# 얕은 복사
shallow_copy = copy.copy(original)

# 복사된 객체 수정
shallow_copy[2][0] = 999

print("원본 리스트:", original)  # 원본 리스트가 수정됨
print("얕은 복사 리스트:", shallow_copy)  # 복사된 리스트도 수정됨
```

```
원본 리스트: [1, 2, [999, 4]]
얕은 복사 리스트: [1, 2, [999, 4]]
```

- 얕은 복사를 사용하면, 내부 리스트 **[3, 4]**는 복사되지 않고, 원본 객체와 복사된 객체 모두 같은 참조를 가진다.


### 깊은 복사 (Deep Copy)

- Python에서 **깊은 복사**는 객체와 그 객체가 참조하는 모든 객체들까지 재귀적으로 복사하여, 완전히 독립적인 객체를 생성하는 방식이다.
- 즉, 원본 객체와 복사된 객체는 완전히 별개이며, 복사된 객체는 원본 객체와의 참조 관계가 없다.
  - `copy.deepcopy()`를 사용하여 깊은 복사를 만들 수 있다.

```python
import copy

# 원본 리스트
original = [1, 2, [3, 4]]

# 깊은 복사
deep_copy = copy.deepcopy(original)

# 복사된 객체 수정
deep_copy[2][0] = 999

print("원본 리스트:", original)  # 원본 리스트는 수정되지 않음
print("깊은 복사 리스트:", deep_copy)  # 복사된 리스트만 수정됨
```

```
원본 리스트: [1, 2, [3, 4]]
깊은 복사 리스트: [1, 2, [999, 4]]
```

- 깊은 복사를 사용하면, 내부 객체도 복사되므로 원본 객체와 복사된 객체는 완전히 독립적이다.


## Java에서의 얕은 복사와 깊은 복사

### 얕은 복사 (Shallow Copy)

- Java에서 **얕은 복사**는 객체를 복사할 때, 객체의 "참조"만 복사하고, 객체 내부의 참조된 객체들은 복사하지 않고 원본 객체의 참조를 그대로 공유하는 방식이다.
  - `Object.clone()` 메서드를 사용하여 얕은 복사를 할 수 있습니다. 단, `clone()` 메서드를 사용하려면 `Cloneable` 인터페이스를 구현해야 한다.


```java
class Person implements Cloneable {
  String name;
  int age;

  Person(String name, int age) {
    this.name = name;
    this.age = age;
  }

  @Override
  public Person clone() throws CloneNotSupportedException {
    return (Person) super.clone(); // 얕은 복사
  }

  @Override
  public String toString() {
    return name + ", " + age;
  }
}

public class Main {
  public static void main(String[] args) throws CloneNotSupportedException {
    Person person1 = new Person("John", 25);
    Person person2 = person1.clone();  // 얕은 복사

    person2.name = "Jane"; // 이름을 변경

    System.out.println("person1: " + person1);
    System.out.println("person2: " + person2);
  }
}
```

```
person1: John, 25
person2: Jane, 25
```

- 이 경우, person1과 person2는 Person 객체가 얕게 복사되었고, `name` 필드는 별도로 수정된다.
- 그러나 만약 Person 객체가 다른 객체를 필드로 가지고 있었다면, 그 필드는 참조만 복사된다.

### 깊은 복사 (Deep Copy)

- Java에서 **깊은 복사**는 객체와 그 객체가 참조하는 모든 객체들을 재귀적으로 복사하여 독립적인 객체를 만드는 방식이다.
- 복사하려는 객체가 참조하는 모든 객체들을 별도로 복사해야 하므로, 수동으로 깊은 복사를 구현해야 한다.

```java
class Person implements Cloneable {
  String name;
  int age;
  Address address;

  Person(String name, int age, Address address) {
    this.name = name;
    this.age = age;
    this.address = address;
  }

  @Override
  public Person clone() throws CloneNotSupportedException {
    // 깊은 복사: Address도 복사
    Person cloned = (Person) super.clone();
    cloned.address = new Address(address.street, address.city); // 새 객체 생성
    return cloned;
  }
}

class Address {
  String street;
  String city;

  Address(String street, String city) {
    this.street = street;
    this.city = city;
  }
}

public class Main {
  public static void main(String[] args) throws CloneNotSupportedException {
    Address address = new Address("123 Main St", "Springfield");
    Person person1 = new Person("John", 25, address);
    Person person2 = person1.clone(); // 깊은 복사

    person2.address.street = "456 Elm St"; // 주소를 변경

    System.out.println("person1 address: " + person1.address.street); // 변경되지 않음
    System.out.println("person2 address: " + person2.address.street); // 변경됨
  }
}
```

```
person1 address: 123 Main St
person2 address: 456 Elm St
```

- 깊은 복사를 위해 Address 객체도 새로 생성하여 복사하였기 때문에, person1과 person2는 독립적인 Address 객체를 가지고 있다.

## C++에서의 얕은 복사와 깊은 복사

### 얕은 복사 (Shallow Copy)

- C++에서 얕은 복사는 객체를 복사할 때, 객체의 멤버 변수나 포인터는 복사하지만, 포인터가 가리키는 데이터는 복사하지 않는 방식이다.
- 기본적으로 얕은 복사는 컴파일러가 제공하는 복사 생성자를 사용하여 수행된다.

```cpp
#include <iostream>
using namespace std;

class Person {
public:
  string name;
  int age;
  Person(string n, int a) : name(n), age(a) {}

  // 복사 생성자 (얕은 복사)
  Person(const Person& p) {
    name = p.name;
    age = p.age;
  }
};

int main() {
  Person person1("John", 25);
  Person person2 = person1;  // 얕은 복사

  cout << "person1: " << person1.name << ", " << person1.age << endl;
  cout << "person2: " << person2.name << ", " << person2.age << endl;

  return 0;
}
```

```
person1: John, 25
person2: John, 25
```

- C++에서 기본적으로 제공하는 얕은 복사는 객체의 값만 복사하며, 포인터나 동적 할당된 메모리와 같은 복잡한 데이터를 처리하지 않는다.

### 깊은 복사 (Deep Copy)

- C++에서 깊은 복사는 객체가 참조하는 동적 메모리나 자원을 새로 할당하고 복사하는 방식이다.
- 깊은 복사를 위해서는 복사 생성자나 복사 대입 연산자를 수동으로 구현해야 한다.

```cpp
#include <iostream>
using namespace std;

class Person {
public:
  string name;
  int age;
  int* data;

  Person(string n, int a) : name(n), age(a) {
    data = new int(100); // 동적 메모리 할당
  }

  // 복사 생성자 (깊은 복사)
  Person(const Person& p)
```

## 프로토 타입 패턴

- 객체 생성 패턴 중 하나로, 객체의 복제를 통해 새로운 객체를 생성하는 방법이다.
- 즉, 객체를 "클론(clone)"해서 새 객체를 만드는 방식으로, 기존 객체를 복제하여 새로운 객체를 만들어낸다.
- 이는 객체 생성 비용을 줄이고, 복잡한 객체를 효율적으로 생성할 수 있는 장점이 있다.

### 프로토타입 패턴의 특징

- **복제(Cloning)**: 객체를 복제하여 새로 만들기 때문에, 복잡한 객체나 자원을 새로 생성하는 비용을 줄일 수 있다.
- 새로운 인스턴스를 생성하는 데 필요한 정보를 프로토타입 객체에서 얻어온다.
    - 즉, 기존 객체를 기반으로 새로운 객체를 만들어내는 방식이다.
- 객체 생성 시점에서 어떤 구체적인 클래스를 사용해야 하는지 모를 때 유용하다.
    - 기존 객체를 복사하여 새로운 객체를 생성할 수 있기 때문에, 특정 클래스에 종속되지 않고도 객체를 동적으로 생성할 수 있다.

### 프로토타입 패턴의 구조

- 프로토타입 패턴은 주로 다음과 같은 구성 요소로 이루어진다:
    - **Prototype (프로토타입)**: 이 인터페이스는 clone() 메서드를 정의합니다. 이 메서드는 객체를 복제할 수 있도록 한다.
    - **ConcretePrototype (구체적인 프로토타입)**: Prototype을 구현한 실제 객체이다. clone() 메서드를 구현하여 객체를 복사하는 방법을 정의한다.
    - **Client (클라이언트)**: 복제된 객체를 필요로 하는 클라이언트로, Prototype 객체를 통해 복제된 객체를 사용한다.

#### Python에서 프로토타입 패턴 구현

- 얕은 복사
  ```python
  import copy

  # Prototype 인터페이스
  class Prototype:
    def clone(self):
      raise NotImplementedError("Subclass must implement abstract method.")

  # ConcretePrototype (구체적인 프로토타입)
  class ConcretePrototype(Prototype):
    def __init__(self, value):
      self.value = value

      def clone(self):
        return copy.copy(self)  # 얕은 복사를 사용하여 복제

      def __str__(self):
        return f"ConcretePrototype with value {self.value}"

  # 클라이언트 코드
  if __name__ == "__main__":
    prototype = ConcretePrototype("Original Object")  # 원본 객체
    clone = prototype.clone()  # 복제된 객체

    print("Original:", prototype)
    print("Clone:", clone)

    # 복제 후 값 변경
    clone.value = "Cloned Object"
    print("After modification - Original:", prototype)
    print("After modification - Clone:", clone)
  ```

  ```
  Original: ConcretePrototype with value Original Object
  Clone: ConcretePrototype with value Original Object
  After modification - Original: ConcretePrototype with value Original Object
  After modification - Clone: ConcretePrototype with value Cloned Object
  ```

  - Prototype 클래스는 `clone()` 메서드를 선언하지만 구현하지 않으며, 실제 복제 작업은 이 클래스를 상속받은 ConcretePrototype 클래스에서 구현한다.
  - ConcretePrototype 클래스에서 `clone()` 메서드는 `copy.copy(self)`를 사용하여 객체를 복제한다. 이는 얕은 복사를 사용한 복제이다.
  - 클라이언트는 ConcretePrototype 객체를 만들고, `clone()` 메서드를 통해 새로운 객체를 생성할 수 있다. 이후 복제된 객체를 변경하더라도 원본 객체는 영향을 받지 않는다.

- 깊은 복사
  ```python
  import copy

  class Prototype:
    def clone(self):
      raise NotImplementedError("Subclass must implement abstract method.")

  class ConcretePrototype(Prototype):
    def __init__(self, value, data):
      self.value = value
      self.data = data

    def clone(self):
      return copy.deepcopy(self)  # 깊은 복사를 사용하여 복제

    def __str__(self):
      return f"ConcretePrototype with value {self.value} and data {self.data}"

  if __name__ == "__main__":
    original = ConcretePrototype("Original", [1, 2, 3])  # 복사될 객체
    clone = original.clone()  # 깊은 복사된 객체

    print("Original:", original)
    print("Clone:", clone)

    # 복제 후 데이터 수정
    clone.data.append(4)
    print("After modification - Original:", original)
    print("After modification - Clone:", clone)
  ```

  ```
  Original: ConcretePrototype with value Original and data [1, 2, 3]
  Clone: ConcretePrototype with value Original and data [1, 2, 3]
  After modification - Original: ConcretePrototype with value Original and data [1, 2, 3]
  After modification - Clone: ConcretePrototype with value Original and data [1, 2, 3, 4]
  ```

  - `copy.deepcopy(self)`를 사용하여 깊은 복사를 구현하였다. 이 방식은 객체 내에 포함된 리스트와 같은 가변 객체까지 복사한다.
  - 복제된 객체의 데이터를 변경하더라도 원본 객체의 데이터는 변경되지 않는다.

#### Java에서 프로토타입 패턴 구현

- Java에서는 Cloneable 인터페이스와 Object.clone() 메서드를 이용하여 프로토타입 패턴을 구현한다.
- clone() 메서드는 객체를 복제하는 데 사용되며, 이를 구현하기 위해서는 클래스가 Cloneable 인터페이스를 구현해야 한다.

```java
// Prototype Interface
interface Prototype extends Cloneable {
  Prototype clone();
}

// ConcretePrototype
class ConcretePrototype implements Prototype {
  private String field;

  public ConcretePrototype(String field) {
    this.field = field;
  }

  public String getField() {
    return field;
  }

  // clone() 메서드 구현
  @Override
  public Prototype clone() {
    try {
      return (Prototype) super.clone();  // 얕은 복사
    } catch (CloneNotSupportedException e) {
      e.printStackTrace();
      return null;
    }
  }
}

// 클라이언트 코드
public class PrototypePatternExample {
  public static void main(String[] args) {
    ConcretePrototype prototype1 = new ConcretePrototype("Original Object");

    // 객체 복제
    ConcretePrototype clone1 = (ConcretePrototype) prototype1.clone();

    System.out.println("Original: " + prototype1.getField());
    System.out.println("Clone: " + clone1.getField());
  }
}
```

```
Original: Original Object
Clone: Original Object
```

#### C++에서 프로토타입 패턴 구현

- C++에서도 clone() 메서드를 사용하여 프로토타입 패턴을 구현할 수 있다.
- C++에서 객체 복사는 기본적으로 얕은 복사만 제공하므로, 깊은 복사를 구현하려면 복사 생성자를 오버라이드해야 할 수 있다.

```cpp
#include <iostream>
using namespace std;

// Prototype Class
class Prototype {
public:
  virtual Prototype* clone() const = 0; // clone 메서드 선언
  virtual void display() const = 0; // 객체를 출력할 display 메서드
  virtual ~Prototype() {} // 가상 소멸자
};

// ConcretePrototype Class
class ConcretePrototype : public Prototype {
private:
  string data;

public:
  ConcretePrototype(string data) : data(data) {}

  // clone 메서드 구현
  Prototype* clone() const override {
    return new ConcretePrototype(*this); // 깊은 복사 (복사 생성자 호출)
  }

  void display() const override {
    cout << "Data: " << data << endl;
  }
};

// 클라이언트 코드
int main() {
  ConcretePrototype prototype1("Prototype Object");

  // 객체 복제
  ConcretePrototype* clone1 = dynamic_cast<ConcretePrototype*>(prototype1.clone());

  cout << "Original: ";
  prototype1.display();
  
  cout << "Clone: ";
  clone1->display();

  delete clone1; // 동적 메모리 해제
  return 0;
}
```

```
Original: Data: Prototype Object
Clone: Data: Prototype Object
```


### 프로토타입 패턴의 장점

- 객체 생성 비용 절감
  - 기존 객체를 복제하여 새로운 객체를 만드는 방식이기 때문에 객체를 새로 생성하는 비용을 절감할 수 있다.
  - 특히, 객체 생성이 비용이 많이 드는 경우 유용하다.

- 복잡한 객체 생성의 단순화
  - 객체를 복제하는 방식으로 복잡한 객체를 쉽게 생성할 수 있다.
  - 예를 들어, 복잡한 초기화 과정이 필요한 객체가 있을 때, 이를 복제하여 새 객체를 빠르게 생성할 수 있다.

- 동적 객체 생성
  - 어떤 클래스를 사용할지 알기 어려운 경우, 기존 객체를 복제하는 방식으로 동적으로 객체를 생성할 수 있다.

- 메모리 관리 용이
  - 복사하는 방식으로 객체를 생성하기 때문에, 객체가 다루는 자원(메모리)을 관리하는 데 있어 효율성을 높일 수 있다.

### 프로토타입 패턴의 단점

- 복잡한 객체의 복사
  - 객체를 복제할 때, 객체가 내부에 다른 객체를 참조하거나 복잡한 상태를 가질 경우 깊은 복사와 같은 추가적인 관리가 필요할 수 있다.
  - 특히, 객체 간의 참조가 중요한 경우, 복사 후에 참조 관계가 잘못 복제될 위험이 있다.

- 성능 이슈
  - 객체 복사가 복잡한 객체일 경우, 복사 과정에서 성능 저하가 발생할 수 있다.
  - 예를 들어, 매우 큰 객체나 복잡한 구조를 갖는 객체를 복제할 때 시간 소모가 클 수 있다.

- 복사본의 일관성 문제
  - 복사본이 원본 객체와 다른 상태를 유지하게 되는 경우, 복사본과 원본 객체 간의 일관성을 관리하는 것이 어려울 수 있다.