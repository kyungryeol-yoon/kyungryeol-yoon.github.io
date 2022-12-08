---
layout: post
title: "[C++] Rvalue Reference - Move Semantics"
date: 2016-03-21
excerpt: "Move Semantics란 객체의 리소스(동적으로 할당된 메모리와 같은)를 또 다른 객체로 전송(이동)하는 것을 의미"
tags: [Move Semantics, rvalue, Reference, c++, programming]
comments: true
---

# 업데이트 예정

# Move Semantics

**Move Semantics란 객체의 리소스(동적으로 할당된 메모리와 같은)를 또 다른 객체로 전송(이동)하는 것을 의미합니다.** Rvalue 참조자는 Move Semantics의 구현을 가능하게 하고 이로 인해 상당한 성능을 향상시킬 수 있습니다. Rvalue는 프로그램 어디에서도 참조될 수 없는 임시 객체이지만 Rvalue 참조자를 이용하여 임시 객체의 리소스를 이동시킴으로서 쓸데없는 메모리 할당과 복사 작업을 생략하여 성능이 향상되는 것입니다.

## 메모리 버퍼를 관리하는 MemoryBlock이라는 class를 작성하고 이 class 객체를 vector에 삽입하는 code를 아래와 같이 작성해보았습니다.

{% highlight cpp %}
// MemoryBlock.h
#pragma once
#include <iostream>
#include <algorithm>

class MemoryBlock
{
public:

    // 버퍼 크기를 넘겨받는 생성자
    explicit MemoryBlock(size_t length)
        : _length(length)
        , _data(new int[length])
    {
        std::cout << "In MemoryBlock(size_t). length = "
            << _length << "." << std::endl;
    }

    // 소멸자
    ~MemoryBlock()
    {
        std::cout << "In ~MemoryBlock(). length = "
            << _length << ".";

        if (_data != NULL)
        {
            std::cout << " Deleting resource.";
            // 리소스 삭제
            delete[] _data;
        }

        std::cout << std::endl;
    }

    // 복사 생성자
    MemoryBlock(const MemoryBlock& other)
        : _length(other._length)
        , _data(new int[other._length])
    {
        std::cout << "In MemoryBlock(const MemoryBlock&). length = "
            << other._length << ". Copying resource." << std::endl;

        std::copy(other._data, other._data + _length, _data);
    }

    // 대입 연산자
    MemoryBlock& operator=(const MemoryBlock& other)
    {
        std::cout << "In operator=(const MemoryBlock&). length = "
            << other._length << ". Copying resource." << std::endl;

        if (this != &other)
        {
            // 기존 리소스 삭제
            delete[] _data;

            _length = other._length;
            _data = new int[_length];
            std::copy(other._data, other._data + _length, _data);
        }
        return *this;
    }

    // 리소스의 길이를 반환
    size_t Length() const
    {
        return _length;
    }

private:
    size_t _length;  // 리소스 길이
    int* _data;        // 리소스
};

#include "MemoryBlock.h"
#include <vector>

using namespace std;

int main()
{
    // MemoryBlock에 대한 vector를 생성하여 두 개의 원소를 추가
    vector<MemoryBlock> v;
    v.push_back(MemoryBlock(25));
    v.push_back(MemoryBlock(75));

    // 첫 번째 원소를 다른 MemoryBlock 으로 변경
    v[0] = MemoryBlock(50);
}
{% endhighlight %}
복사 생성자와 대입 연산자를 구현하여 다른 객체로부터의 객체 생성과 복사가 가능합니다. main 함수에서 임시 객체를 이용하여 vector에 원소를 삽입할 때 복사 생성자가 이용되고 삽입된 원소를 또 다른 임시 객체로 변경할 때 대입 연산자가 이용됩니다.
v[0] = MemoryBlock(50); 코드가 어떻게 동작되는지 아래의 그림을 살펴보도록 합시다.
