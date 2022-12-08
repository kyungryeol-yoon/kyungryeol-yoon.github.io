---
layout: post
title: "[C++] Lvalue와 Rvalue"
date: 2016-03-20
excerpt: "C++에서 모든 표현식은 Lvalue와 Rvalue입니다."
tags: [lvalue, rvalue, c++, programming]
comments: true
---

# C++ Lvalue와 Rvalue

Lvalue와 Rvalue는 보통 Left-value(왼쪽 값)과 Right-value(오른쪽 값)로 풀어서 씁니다. 이 때문에 대입 연산자(=)를 기준으로 왼쪽에 위치하는 값이 Lvalue이고 오른쪽에 위치하는 값이 Rvalue라고 이해하기 쉽습니다. 이것은 C 표준에 입각하여 살펴보면 완전히 틀린 얘기는 아니지만(C 표준에서는 대입연산자(=)를 기준으로 왼쪽과 오른쪽에 모두 사용될 수 있는 값은 Lvalue이고 오른쪽에만 사용될 수 있는 값이 Rvalue라고 정의하고 있습니다.) 잘못된 이해이며, C++ 관점에서는 전혀 다른 관점에서 해석할 필요가 있습니다. **C++ 표준에서는 더이상 단순하게 L과 R은 Left와 Right를 의미하지 않습니다.** 이제부터는 위에서 언급한 Left, Right의 개념은 잊어버리고 Lvalue와 Rvalue를 단순히 고유명사로만 기억합시다.

## Lvalue와 Rvalue의 구분

C++에서 모든 표현식은 Lvalue와 Rvalue입니다. **Lvalue은 단일 표현식 이후에도 없어지지 않고 지속되는 객체입니다.** 쉽게 생각해서 이름을 가지는 객체는 Lvalue라고 생각하시면 됩니다. 그러므로 const 타입을 포함한 모든 변수는 Lvalue입니다. **반면에 Rvalue는 표현식이 종료된 이후에는 더 이상 존재하지 않는 임시적인 값입니다.** 상수 또는 임시 객체는 Rvalue라고 생각하시면 됩니다.

## Example Source Code

{% highlight cpp %}
#include <iostream>
#include <string>
using namespace std;
int main() {
	int x = 3;
	const int y = x;
	int z = x + y;
	int* p = &x;
	cout << string("one");
	
	++x;
	x++;
}
{% endhighlight %}

x, y, z, p 등의 이름을 가지는 변수는 모두 Lvalue이지만 상수값 3, 임시객체 string("one")은 표현식이 종료되면 더 이상 참조할 수 없는 값이기 떄문에 Rvalue입니다. x + y, &x와 같은 표현식도 마찬가지로 Rvalue입니다. 또 한가지 흥미로운 점은 ++x는 Lvalue이지만 x++은 Rvalue라는 점입니다. 둘 다 증가된 값을 리턴하지만 ++x는 증가된 x 자신을 리턴하기 때문에 Lvalue인 반면에 x++은 증가되기 전의 복사본을 리턴하기 때문에 Rvalue입니다.
**아직도 Lvalue와 Rvalue가 잘 이해가 되지 않으신다면 조금 더 확실하게 구분하는 방법이 있습니다. 바로 표현식에 주소 연산자 &를 붙여보는 겁니다. &연산자는 Lvalue를 요구하기 때문에 표현식이 Rvalue라면 compile error가 나타날겁니다.**

{% highlight cpp %}
&(++x);
&(x++); // error C2102: '&' requires l-value
{% endhighlight %}

## Rvalue 참조자 &&

C++에서 int& a = b; 형탤 사용하였던 참조자(Reference)는 Lvalue 참조자입니다. C++ 11 표준에서부터 Lvalue 참조자 이외에도 Rvalue를 참조할 수 있는 Rvalue 참조자가 추가되었습니다. Lvalue 참조자는 Lvalue만 참조할 수 있고 Rvalue 참조자는 Rvalue만 참조할 수 있습니다.
(Rvalue 참조자는 Visual Studio 2010 이상 버전의 compiler에서 사용 가능합니다.)

{% highlight cpp %}
int rvalue() {
	return 10;
}

int main() {
	int lvalue = 10;
	
	int& a = lvalue;
	int& b = rvalue(); // error C2440: 'initializing' : cannot convert from 'int' to 'int &'
	
	int&& c = lvalue; // error C2440: 'initializing' : cannot convert from 'int' to 'int &&'
	int&& d = rvalue();
}
{% endhighlight %}

Lvalue 참조 타입에 Rvalue를 대입하려고 하거나 Rvalue 참조 타입에 Lvalue를 대입하려고 하면 compile error가 나는 것을 볼 수 있습니다.
여기서 왜 Rvalue 참조자가 필요한 것일까요?
표현식이 종료되면 더 이상 존재하지 않는 임시적인 값을 참조해서 무엇을 하려는지에 대해서 **[Move Semantics](https://kyungryeol1101.github.io/cpp-rvalue-reference/)**의 post를 참고해주시기 바랍니다.

### Reference

- [MSDN - Lvalues and Rvalues](https://msdn.microsoft.com/en-us/library/f90831hc.aspx)
- [MSDN - Rvalue Reference Declarator: &&](https://msdn.microsoft.com/en-us/library/dd293668.aspx)
- [Rvalue Reference: C++0x Features in VC10, Part 2](https://blogs.msdn.microsoft.com/vcblog/2009/02/03/rvalue-references-c0x-features-in-vc10-part-2/)