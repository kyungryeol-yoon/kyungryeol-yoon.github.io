---
title: "[Flutter] TabBarView"
date: 2024-09-12
categories: [Flutter, Tab]
tags: [Flutter, TabBarView]
---

**RootTab**
- 정의: 일반적으로 "RootTab"은 여러 개의 탭을 상단에 배치하여 사용자가 여러 화면을 쉽게 전환할 수 있게 하는 UI 구성 요소를 의미한다.
- 구성: 각 탭은 사용자가 선택할 수 있는 특정 항목을 나타낸다. 이 탭은 일반적으로 TabBar 위젯을 통해 생성된다.

> [설명 참고](https://kyungryeol-yoon.github.io/posts/root-tab)
{: .prompt-info }

**TabBarView**
- 정의: TabBarView는 TabBar와 함께 사용되는 위젯으로, 각 탭에 해당하는 내용을 표시한다.
- 구성: TabBarView는 여러 개의 자식 위젯을 받아서 각 탭이 선택될 때 보여줄 내용을 정의한다. 각 탭에 대해 해당하는 콘텐츠를 작성할 수 있다.

### TabBarView 정의
TabBarView는 여러 개의 자식 위젯을 받아서 각 탭이 선택될 때 보여줄 내용을 정의한다. 이 위젯은 TabBar와 함께 사용되어 탭 인터페이스를 구성한다.

### 기본 구조
TabBarView의 기본적인 구조는 다음과 같다.

```dart
TabBarView(
  children: [
    // 각 탭에 해당하는 위젯
    Center(child: Text('Content for Tab 1')),
    Center(child: Text('Content for Tab 2')),
    Center(child: Text('Content for Tab 3')),
  ],
)
```

### 주요 속성
children: TabBarView에서 표시할 위젯들의 리스트입니다. 각 탭에 해당하는 콘텐츠를 포함한다.

### 사용 예시
아래는 TabBar와 TabBarView를 함께 사용한 기본적인 예시이다.

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TabBarView Example',
      home: DefaultTabController(
        length: 3, // 탭의 개수
        child: Scaffold(
          appBar: AppBar(
            title: Text('TabBarView Example'),
            bottom: TabBar(
              tabs: [
                Tab(text: 'Tab 1'),
                Tab(text: 'Tab 2'),
                Tab(text: 'Tab 3'),
              ],
            ),
          ),
          body: TabBarView(
            children: [
              Center(child: Text('Content for Tab 1')),
              Center(child: Text('Content for Tab 2')),
              Center(child: Text('Content for Tab 3')),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 코드 설명
- DefaultTabController: TabBar와 TabBarView의 상태를 관리한다. length 속성은 탭의 개수를 설정한다.

- TabBar: 상단에 표시되는 탭으로, 사용자가 선택할 수 있는 각 항목을 나타낸다.

- TabBarView: children 리스트에 포함된 각 위젯이 탭 선택에 따라 표시된다. 각 탭에 대한 콘텐츠를 정의할 수 있다.

### 탭 전환 애니메이션
TabBarView는 기본적으로 탭 간 전환 애니메이션을 제공한다. 사용자가 탭을 클릭할 때마다 애니메이션 효과가 자동으로 적용되어 부드러운 전환을 경험할 수 있다.

### 상태 관리
탭 간의 상태를 유지하고 싶다면, 각 탭에서 상태를 관리하는 방식(예: StatefulWidget, Provider, Riverpod 등)을 사용할 수 있다. 예를 들어, 각 탭에 대한 상태를 관리하는 별도의 StatefulWidget을 만들 수도 있다.

### 스크롤 가능한 TabBarView
대량의 콘텐츠를 다룰 경우 TabBarView를 스크롤 가능하도록 설정할 수 있다. 예를 들어, SingleChildScrollView와 함께 사용할 수 있다.