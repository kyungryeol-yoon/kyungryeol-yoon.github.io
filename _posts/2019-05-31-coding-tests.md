---
layout: post
title: "코딩 테스트 정리"
date: 2019-06-01
excerpt: "코딩 테스트 관련하여 정리"
tags: [c++, programming, coding, test]
comments: true
---

## 모든 코딩 테스트는 C++로 작성하였습니다. (실제로 온라인, 오프라인 코딩 테스트 전부 C++로 치루었습니다. C++이 익숙해서...잘 못하지만...ㅎㅎ)

1. 글자 뒤집기. 글자안에 특수문자 잇으면 그건 그대로 들고오기
{% highlight cpp %}
bool Reverse::isSpecial(char c) {
	if ((c >= 'a') && (c <= 'z')) return false;
	if ((c >= 'A') && (c <= 'Z')) return false;
	return true;
}

void Reverse::rev(char *array, int N) {
	int i = 0;  // i points to the first index of the array
	int j = N - 1; // j points to the last index of the array

	while (i < j)
	{
		if (isSpecial(array[i]))
		{
			i++;
		}
		else if (isSpecial(array[j]))
		{
			j--;
		}
		else
		{
			char tmp = array[i];
			array[i] = array[j];
			array[j] = tmp;
			i++;
			j--;
		}
	}
}

void Reverse::ReverseMain() {
	char str[] = "kr.yoon1101@gamil.com";
	int stringSize = sizeof(str);
	rev(str, stringSize);
	cout << str << endl;
}
{% endhighlight %}

2. 링크드리스트 두개 합치기 그리고 정렬. 중복은 한개만
{% highlight cpp %}

{% endhighlight %}

3. 바이너리 서치(Binary Search, 이진 검색)를 이용해서 배열안에 원하는 숫자 찾기
{% highlight cpp %}
//반복문을 이용한 이진 탐색
int BinarySearch::binarySearch(int array[], int _find, int size) {
	int s = 0;
	int e = size - 1;
	int m = 0;

	while (s <= e) {
		m = (s + e) / 2;
		if (array[m] == _find) return m;
		else if (array[m] > _find) e = m - 1;
		else s = m + 1;
	}
	return -1;
}

//재귀를 이용한 이진 탐색
int BinarySearch::binarySearch2(int array[], int _find, int size) {
	int s = 0;
	int e = size - 1;
	int m = 0;

	if (s > e) return -1;
	m = (s + e) / 2;
	if (array[m] == _find) return m;

	return -1;
}

void BinarySearch::binaryRun() {
	int find = 0;
	cout << "찾고 싶은 값은 : " << endl;
	cin >> find;
	int data[] = { 1,3,6,8,11,23,111,114,213 };
	int dataSize = sizeof(data) / sizeof(int);
	int ans = binarySearch(data, find, dataSize);
	cout << ans;
}

int BinarySearch::STLbinary_search() {
	int arr[100];

	for (int i = 0; i < 100; i++) {
		arr[i] = i;
	}
	cout << "exist : " << binary_search(arr, arr + 100, 70) << endl;

	return 0;
}
{% endhighlight %}

4. 사전 검색 프로그램 (띄어쓰기)

5. 회전수 구하기

6. 비트 1의 갯수

7. LRU

8. 셀프 넘버 구하기

9. 사다리 타기 프로그램

10. 삼각별 만들기

11. 스도쿠 만들기

12. 지뢰게임
