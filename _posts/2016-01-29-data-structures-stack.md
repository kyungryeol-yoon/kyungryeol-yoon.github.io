---
layout: post
title: "[Data Structures] Stack"
date: 2016-01-29
excerpt: 한 쪽 끝에서만 자료를 넣고 뺄 수 있는 LIFO(Last In First Out) 형식의 자료 구조
tags: [data structures, c++, stack, programming]
comments: true
---

# Stack : 스택 (C++)

## 스택(Stack)

- 스택은 마지막에 저장한 데이터를 가장 먼저 꺼내는 후입선출(LIFO:Last In First Out) 구조로 되어 있다.
- 입출력이 모두 한 방향에서 이루어지는 데이터 구조이다.
- 입출력이 가능한 쪽을 TOP, 바닥을 BOTTOM이라고 한다.
- TOP은 출력 우선순위가 가장 높은 요소를 가리키고 있다.
- 입출력을 할 위치를 표시하기 위해서 TOP(포인터 사용)이 필요하다.
- TOP을 통해서 데이터를 넣는 것을 PUSH라고 하고, 꺼내는 것을 POP이라고 한다.
- 스택을 구현하는 방법은 배열과 연결 리스트가 있다.
- 배열의 큰 단점은 처음 생성한 크기를 바꿀 수 없다는 점이다. 그래서 순차적으로 데이터를 추가하고 삭제하는 스택은 배열리스트(Array List)와 같은 배열기반의 컬렉션 클래스가 적합하다.
- overflow : 스택의 모든 기억장소가 꽉 채워져 있어서 더 이상 데이터를 삽입(PUSH할 때)할 수 없다.
- underflow : 자료가 없다면(TOP포인터가 주소 0을 가지고 있다면) 스택에는 삭제(POP할 때)할 자료가 없다.

### 스택(Stack)의 연산
스택(Stack)는 **LIFO(Last In First Out)** 를 따른다. 즉, 가장 최근에 스택에 추가한 항목이 가장 먼저 제거될 항목이다.
* pop() : 스택에서 가장 위에 있는 항목을 제거한다.
* push(item) : item 하나를 스택의 가장 윗 부분에 추가한다.
* peek() : 스택의 가장 위에 있는 항목을 반환한다.
* isEmpty() : 스택이 비어 있을 때에 true를 반환한다.

### 스택의 단점

- 먼저 들어온 것이 나중에 출력되는 후입선출의 구조로 우선순위에 관련된 문제가 생길 수 있다.
- 새로운 입력이 들어오면 바닥에 있는 데이터가 오랫동안 잔류하게 되는 경우가 생긴다.

### 스택의 용도

재귀 알고리즘을 사용하는 경우 스택이 유용하다.
* 재귀 알고리즘
  * 재귀적으로 함수를 호출해야 하는 경우에 임시 데이터를 스택에 넣어준다.
  * 재귀함수를 빠져 나와 퇴각 검색(backtrack)을 할 때는 스택에 넣어 두었던 임시 데이터를 빼 줘야 한다.
  * 스택은 이런 일련의 행위를 직관적으로 가능하게 해 준다.
  * 또한 스택은 재귀 알고리즘을 반복적 형태(iterative)를 통해서 구현할 수 있게 해준다.
* 웹 브라우저 방문기록 (뒤로가기)
* 실행 취소 (undo)
* 역순 문자열 만들기
* 수식의 괄호 검사 (연산자 우선순위 표현을 위한 괄호 검사)
  * Ex) 올바른 괄호 문자열(VPS, Valid Parenthesis String) 판단하기
* 후위 표기법 계산
* 지역변수 저장
* 함수의 콜스택
* 문자열을 역순으로 출력할 때, 연산자 후위표기법 등
* 임시데이터 백업
* 함수 호출의 순서 제어
* 인터럽트 처리
* 수식계산

### C++로 구현한 스택 (Stack)
[이전에 작성한 양방향 링크드 리스트의 코드를 재활용](https://kyungryeol1101.github.io/data-structures-linked-list-array/)

{% highlight cpp %}
class Stack
{
private:
	DoubleList *doublelist;
public:
	Stack();
	~Stack();

	DoubleList *getdouble() { return doublelist; }

	void Push(int data, int position);
	void Pop(int position);
	void display();
};

#include "Stack.h"

Stack::Stack()
{
	doublelist = new DoubleList;
}

Stack::~Stack()
{
}

void Stack::Push(int data, int position) {
	doublelist->insertNode(data, position);
}

void Stack::Pop(int position) {
	doublelist->delNode(position);
}

void Stack::display() {
	doublelist->displayNode();
}

//Manager.cpp
void Manager::StackRun() {
	int menu = 0;
	int _data = 0;

	while (true)
	{
		cout << "1.삽입\n2.반환\n3.출력\n입력 : ";
		cin >> menu;

		switch (menu)
		{
		case INSERT:
			cout << "추가 할 데이터 : ";
			cin >> _data;
			stack->Push(_data, 0);
			stack->display();
			break;
		case DEL:
			stack->Pop(0);
			stack->display();
			break;
		case COUT:
			if (stack->getdouble()->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				stack->display();
			}
			break;
		default:
			break;
		}
	}
}
{% endhighlight %}
