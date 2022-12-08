---
layout: post
title: "[Data Structures] Linked List & Array"
date: 2016-01-22
excerpt: "링크드리스트와 배열의 차이점과 각각의 장단점"
tags: [data structures, c++, linked list, array, programming]
comments: true
---

# Linked List & Array : 링크드 리스트 & 배열 (C++)

## 배열(Array)

<figure>
    <img src="/images/data_structures/array.jpg">
</figure>

데이터를 물리적 주소에 순차적으로 저장하며 인덱스를 가지고 있어 바로 접근할 수 있기 때문에 접근 속도가 매우 빠르다.\\
그러나, 배열은 크가가 고정되어 있기 때문에 처음 지정된 사이즈보다 더 많은 데이터를 넣으려면 배열의 크기를 늘리는 연산을 해야하고 데이터 삽입/삭제시 해당 위치 다음칸에 있는 데이터를 모두 한칸씩 뒤로 밀거나 앞으로 당겨오는 연산을 해야하기 때문에 데이터 삽입/삭제에는 약한 모습을 보인다.

## 연결리스트(LinkedList)

<figure>
    <img src="/images/data_structures/linkedlist.jpg">
</figure>

데이터를 저장할 때 데이터만 저장하는 것이 아니라 다음 데이터의 물리적 주소까지 같이 저장한다.\\
(단순 연결리스트는 다음 데이터의 주소를, 이중 연결리스트는 이전 주소와 다음 주소를 모두 저장) 특정 데이터에 접근할 때 인덱스로 바로 접근할 수 있었던 배열과 달리 첫 노드부터 원하는 노드까지 링크를 따라가야 접근이 가능하기 때문에 배열에 비해 접근 속도는 떨어진다.\\
하지만 반대로, 데이터를 삽입/삭제 할 때에는 물리적 주소에 구애받지 않고 앞/뒤 노드의 주소만 끼워넣을 노드의 주소로 바꿔주면 되기 때문에 삽입/삭제는 배열보다 빠르다.

### C++로 구현한 양방향 연결 리스트(Double Linked List)
{% highlight cpp %}
/**
 * 연결리스트(LinkedList)에 사용할 노드 클래스
 */
class Node
{
private:
	Node *Llink;
	Node *Rlink;

	int IDNode;
	int Data;
public:
	Node();
	~Node();


	Node *getLlink() { return Llink; }
	Node *getRlink() { return Rlink; }

	void setLlink(Node *llink) { Llink = llink; }
	void setRlink(Node *rlink) { Rlink = rlink; }

	int getData() { return Data; }
	void setData(int _Data) { Data = _Data; }

	int GetID() { return IDNode; }
	void SetID(int idnum) { IDNode = idnum; }
};

/**
 * Double Linked List 클래스
 */
class DoubleList
{
private:
	Node *Head;
	Node *Tail;
	int IDCount;
public:
	DoubleList();
	~DoubleList();

	Node *getHead() { return Head; }
	Node *getTail() { return Tail; }

	Node *ArrangeNode(int pos);

	void insertNode(int _data, int _location); //삽입 추가 (위치 입력 가능)
	void delNode(int _location); //삭제 (위치 입력 가능)
	void displayNode(); //출력
	void AllDel(); //모두 삭제
	int CountNode(); //현재 노드 갯수
	int Find(int _location); //위치를 찾아 노드 데이터 찾기
	void Reverse(); //뒤집기
};

/**
 * Double Linked List 메뉴
 */
void Manager::Doublerun() {
	int _menu = 0;
	int find = 0;
	int Num = 0;
	int _position = 0;

	while (true) {
		cout << "1.추가 2.삭제 3.출력 4.전체삭제 5.노드 총 갯수\n6.찾기 7.링크드 뒤집기\n입력 : ";
		cin >> _menu;

		switch (_menu)
		{
		case INSERT:
			cout << "추가할 정수 : ";
			cin >> Num;
			cout << "위치 입력 : ";
			cin >> _position;
			doublelist->insertNode(Num, _position);
			break;
		case DEL:
			if (doublelist->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				int _location = 0;
				cout << "데이터 삭제할 위치 : ";
				cin >> _location;
				doublelist->delNode(_location);
			}
			break;
		case COUT:
			if (doublelist->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				doublelist->displayNode();
			}
			break;
		case ALLDEL:
			if (doublelist->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				doublelist->AllDel();
			}
			break;
		case COUNTNODE:
			cout << "총 갯수 : " << doublelist->CountNode() << endl;
			break;
		case SEARCH:
			if (doublelist->getHead() == NULL) {
				cout << "데이터가 없습니다." << endl << endl;
			}
			else {
				cout << "몇 번째 데이터 : ";
				cin >> find;
				cout << "당신이 찾는 데이터 : " << doublelist->Find(find) << endl << endl;
			}
			break;
		case REVERSE:
			cout << "뒤집기 전 출력 : " << endl;
			doublelist->displayNode();
			doublelist->Reverse();
			cout << "뒤집기 후 출력 : " << endl;
			doublelist->displayNode();
			break;
		default:
			cout << "다시 입력해주세요" << endl;
			break;
		}
	}
}

/**
 * Node 추가
 */
void DoubleList::insertNode(int _data, int _position) {
	++IDCount;
	Node *newNode = new Node;
	newNode->setData(_data);
	newNode->SetID(IDCount);

	if (Head == NULL) {
		Head = newNode;
		Tail = Head;
	}
	else {
		if (_position == 0) {
			newNode->setRlink(Head);
			Head->setLlink(newNode);
			Head = newNode;
		}
		else if (_position == -1) {
			newNode->setLlink(Tail);
			Tail->setRlink(newNode);
			Tail = newNode;
		}
		else {
			Node *before = Head;
			while ((--_position) > 0)
			{
				before = before->getRlink();
			}
			if (before->getRlink() != NULL) {
				before->getRlink()->setLlink(newNode);
			}
			newNode->setLlink(before);
			newNode->setRlink(before->getRlink());
			before->setRlink(newNode);
		}
	}
}

/**
 * Node 삭제
 */
void DoubleList::delNode(int _location) {
	if (_location == 0) {
		Head = Head->getRlink();
		if (Head != NULL) {
			Head->setLlink(NULL);
		}
	}
	else {
		Node *before = Head;
		while ((--_location) > 0)
		{
			before = before->getRlink();
		}
		Node *after = before->getRlink()->getRlink();
		if (after != NULL) {
			before->setRlink(after);
			after->setLlink(before);
		}
		else {
			before->setRlink(NULL);
		}
	}
}

/**
 * Node 출력
 */
void DoubleList::displayNode() {
	Node *Temp = Head;
	while (true)
	{
		if (Temp == NULL) {
			break;
		}
		else {
			cout << "ID:" << Temp->GetID() << " Data:" << Temp->getData() << endl;
			Temp = Temp->getRlink();
		}
	}
}

/**
 * Node 모두 삭제
 */
void DoubleList::AllDel() {
	while (true)
	{
		if (Head == NULL) {
			break;
		}
		else {
			delNode(0);
		}
	}
}

/**
 * 현재 Node 갯수
 */
int DoubleList::CountNode() {
	int count = 0;

	Node *now = new Node;
	for (now = Head; now; now = now->getRlink()) {
		count++;
	}
	return count;
}

/**
 * Node 찾기
 */
int DoubleList::Find(int _location) {
	Node *current = Head;
	while ((--_location) >= 1) {
		current = current->getRlink();
	}
	return current->getData();
}

/**
 * Node 뒤집기
 */
void DoubleList::Reverse()
{
	Node *current = Head;
	while (current != NULL)
	{
		Node *next = current->getRlink();
		current->setRlink(current->getLlink());
		current->setLlink(next);
		if (next == NULL) {
			Tail = Head;
			Head = current;
			break;
		}
		current = next;
	}
}
{% endhighlight %}
