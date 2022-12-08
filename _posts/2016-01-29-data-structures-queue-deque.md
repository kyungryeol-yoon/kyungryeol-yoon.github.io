---
layout: post
title: "[Data Structures] Queue & Deque"
date: 2016-01-29
excerpt: "먼저 집어 넣은 데이터가 먼저 나오는 FIFO(First In First Out)구조로 저장하는 형식"
tags: [data structures, c++, queue, deque, programming]
comments: true
---

# Queue & Deque : 큐 & 덱 (C++)

## 큐(Queue)

- 큐는 처음에 저장한 데이터를 가장 먼저 꺼내는 선입선출(FIFO:First In First Out) 구조로 되어 있다.
- 입출력이 양방향에서 이루어지는 데이터 구조이다.
- FRONT)는 가장 먼저 삽입된 자료의 기억공간을 가리키는 포인터이고 , REAR는 가장 마지막에 삽입된 자료가 위치한 기억장소를 가리키는 포인터이다.
- 데이터 입력은 FRONT 포인터를 통해서 하고, 데이터 삭제는 REAR 포인터를 통해서 한다.
- 삽입연산을 Enqueue 또는 Put, 삭제연산을 Dequeue 또는 Get라고 한다.
- 큐에서는 FRONT와 REAR가 같을 때 비어있는 공백큐 임을 알수 있다.
- overflow : 큐의 모든 기억장소가 꽉 채워져 있어서 더 이상 데이터를 삽입(Enqueue할 때)할 수 없다.
- underflow : 자료가 없다면 스택에는 삭제(Dequeue할 때)할 자료가 없다.

### 큐(Queue)의 연산
큐(Queue)는 **FIFO(First-In-First-Out)** 를 따른다.
* add(item) : item을 리스트의 끝부분에 추가한다.
* remove() : 리스트의 첫 번째 항목을 제거한다.
* peek() : 큐에서 가장 위에 있는 항목을 반환한다.
* isEmpty() : 큐가 비어 있을 때에 true를 반환한다.

* <mark>주의!</mark>
  * 큐(Queue)에서 처음과 마지막 노드를 갱신할 때 실수가 나오기 쉽다.

### 큐의 단점

- 데이터 삽입 후 계속 항목을 삭제하면 REAR와 FRONT가 만나게 되어 공백큐가 됨에도 불구하고 오버 플로우 현상이 발생한다. 즉, 메모리 낭비가 생기게 된다.

### 개선된 원형 큐가 나옴.

- 원형 큐의 단점 : 메모리 공간은 잘 활용하나 배열로 구현되어 있기 때문에 큐의 크기가 제한되는 단점이 존재한다.

### 링크드 리스트로 큐가 나옴.

- 링크드 리스트로 구현한 큐는 큐의 크기가 제한이 없고, 삽입, 삭제가 효과적이다.

### 큐의 용도

데이터가 입력된 시간 순서대로 처리해야 할 필요가 있는 상황에 이용한다.
* 너비 우선 탐색(BFS, Breadth-First Search) 구현
  * 처리해야 할 노드의 리스트를 저장하는 용도로 큐(Queue)를 사용한다.
  * 노드를 하나 처리할 때마다 해당 노드와 인접한 노드들을 큐에 다시 저장한다.
  * 노드를 접근한 순서대로 처리할 수 있다.
* 캐시(Cache) 구현
* 우선순위가 같은 작업 예약 (인쇄 대기열)
* 선입선출이 필요한 대기열 (티켓 카운터)
* 콜센터 고객 대기시간
* 프린터의 출력 처리
* 윈도 시스템의 메시지 처리기
* 프로세스 관리
* 운영체제 작업 스케쥴링
* 컴퓨터 버퍼에서 주로 사용, 마구 입력이 되었으나 처리를 하지 못할 때, 버퍼(큐)를 만들어 대기 시킨다.
* 대기행렬 처리
* 인쇄작업 대기목록

- 큐는 데이터를 꺼낼 때 항상 첫 번째 저장된 데이터를 삭제하므로 배열리스트와 같은 배열 기반의 컬렉션 클래스를 사용한다면 데이터를 꺼낼 때마다 빈 공간을 채우기 위해서 데이터의 복사가 발생하므로 비효율적이다. 따라서 큐를 사용할때는 연결 리스트(Linked List)로 구현하는 것이 적합하다.


## 데큐(Double-Ended Queue)

- 큐와 스택의 장점을 합쳐놓은 개념이다.
- 양쪽 끝에서 삽입과 삭제가 모두 가능한 자료구조이다.
- 두 개의 포인터를 사용하여, 양쪽에서 삽입과 삭제를 발생시킬 수 있다.
- 입력이 한쪽 끝으로만 가능하도록 설정한 데크인 입력제한데크(Scroll), 출력이 한쪽 끝으로만 가능하도록 설정한 데크인 출력제한데크(Shelf)가 있다.

### C++로 구현한 큐 & 덱 (Queue & Deque)
[이전에 작성한 양방향 링크드 리스트의 코드를 재활용](https://kyungryeol1101.github.io/data-structures-linked-list-array/)

{% highlight cpp %}
class Queue
{
private:
	DoubleList *doublelist;
public:
	Queue();
	~Queue();

	DoubleList *getdouble() { return doublelist; }

	void enqueue(int data, int position);
	void dequeue(int position);
	void display();
};

#include "Queue.h"

Queue::Queue()
{
	doublelist = new DoubleList;
}

Queue::~Queue()
{
}

void Queue::enqueue(int data, int _position) {
	doublelist->insertNode(data, _position);
}

void Queue::dequeue(int position) {
	doublelist->delNode(position);
}

void Queue::display() {
	doublelist->displayNode();
}

//Manager.cpp
void Manager::QueueRun() {
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
			queue->enqueue(_data, -1);
			queue->display();
			break;
		case DEL:
			queue->dequeue(0);
			queue->display();
			break;
		case COUT:
			if (queue->getdouble()->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				queue->display();
			}
			break;
		default:
			break;
		}
	}
}
{% endhighlight %}
