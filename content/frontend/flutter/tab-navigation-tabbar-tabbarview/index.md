---
title: "[Flutter] 탭 네비게이션 — TabBar와 TabBarView"
date: 2024-09-15
tags: [flutter, tabbar, tabbarview, tabcontroller, navigation]
description: "Flutter에서 상단 탭 UI를 만드는 TabBar·TabBarView·TabController 구조와 기본 예제, 스크롤 가능한 탭(isScrollable)과 탭 상태 유지(AutomaticKeepAliveClientMixin)까지 한 번에 정리합니다."
---

Flutter에서 여러 화면을 탭으로 전환하는 UI는 **TabBar(상단 탭) + TabBarView(탭별 내용) + TabController(둘을 연결)** 조합으로 만듭니다. 이 글에서는 기본 구조와 동작 예제, 그리고 스크롤 가능한 탭·상태 유지 같은 실전 옵션까지 정리합니다.

## 🧩 핵심 위젯 3가지

- **TabBar** — 상단에 탭 목록을 배치하는 위젯. 사용자가 선택할 항목(`Tab`)들을 나열합니다. ("RootTab"이라고 부르는 상단 탭 구성이 이것입니다.)
- **TabBarView** — 각 탭에 대응하는 **내용 화면**을 표시하는 위젯. 자식 위젯 리스트를 받아 선택된 탭의 콘텐츠를 보여줍니다.
- **TabController** — TabBar와 TabBarView의 선택 상태를 **동기화**하는 컨트롤러.

---

## 1️⃣ 기본 예제 — DefaultTabController

가장 간단한 방법은 `DefaultTabController`로 컨트롤러를 자동 제공하는 것입니다. 별도 패키지 없이 `material.dart`만으로 충분합니다.

```bash
flutter create my_app
cd my_app
```

`lib/main.dart`:

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Tab Example',
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3, // 탭의 개수
      child: Scaffold(
        appBar: AppBar(
          title: Text('Tab Example'),
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
    );
  }
}
```

```bash
flutter run
```

### 코드 설명

- **DefaultTabController**: 하위 트리에 TabController를 제공하며, `length`로 탭 개수를 지정합니다.
- **Scaffold / AppBar**: 기본 레이아웃과 상단 영역을 구성합니다.
- **TabBar**: `tabs`에 `Tab` 위젯 리스트를 넣어 상단 탭을 만듭니다.
- **TabBarView**: `children`의 각 위젯이 탭 선택에 따라 표시됩니다. 탭 전환 애니메이션은 기본 제공됩니다.

---

## 2️⃣ TabController 직접 제어

탭 인덱스 감지·프로그래밍적 전환이 필요하면 `TabController`를 직접 만듭니다. `SingleTickerProviderStateMixin`을 함께 사용합니다.

```dart
class HomeScreen extends StatefulWidget {
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        bottom: TabBar(controller: _tab, tabs: const [
          Tab(icon: Icon(Icons.home), text: 'Home'),
          Tab(icon: Icon(Icons.search), text: 'Search'),
          Tab(icon: Icon(Icons.person), text: 'Profile'),
        ]),
      ),
      body: TabBarView(controller: _tab, children: const [
        Center(child: Text('Home')),
        Center(child: Text('Search')),
        Center(child: Text('Profile')),
      ]),
    );
  }
}
```

> 💡 `Tab(icon: ..., text: ...)`처럼 아이콘과 텍스트를 함께 줄 수 있습니다.

---

## 3️⃣ 실전 옵션

### 스크롤 가능한 탭 — `isScrollable`

탭이 많아 가로 폭을 넘으면 `isScrollable: true`로 스크롤되게 합니다(기본값 false).

```dart
TabBar(
  isScrollable: true,
  tabs: [ /* 많은 Tab들 */ ],
)
```

### 탭 상태 유지 — `AutomaticKeepAliveClientMixin`

기본적으로 탭을 전환하면 각 탭의 상태가 **초기화**됩니다. 스크롤 위치·입력값 등을 유지하려면 탭 콘텐츠 위젯에 `AutomaticKeepAliveClientMixin`을 적용하고 `wantKeepAlive`를 true로 둡니다.

```dart
class KeepAlivePage extends StatefulWidget {
  @override
  State<KeepAlivePage> createState() => _KeepAlivePageState();
}

class _KeepAlivePageState extends State<KeepAlivePage>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true; // 상태 유지

  @override
  Widget build(BuildContext context) {
    super.build(context); // 필수 호출
    return const Center(child: Text('상태가 유지되는 탭'));
  }
}
```

> ⚠️ TabBarView에 내장 keep-alive 옵션은 (2025년 기준) 아직 없습니다. 위 mixin 방식이 현재 표준 해법입니다.

### 긴 콘텐츠

탭 내용이 길면 각 탭 위젯을 `SingleChildScrollView`/`ListView`로 감싸 세로 스크롤되게 합니다.

---

## ❓ 자주 묻는 질문

**Q. DefaultTabController와 TabController 직접 생성, 무엇을 쓰나요?**
단순 탭 UI는 `DefaultTabController`로 충분합니다. 현재 탭 인덱스 감지나 코드로 탭 이동이 필요하면 `TabController`를 직접 만드세요.

**Q. 탭을 바꾸면 입력값이 사라져요.**
`AutomaticKeepAliveClientMixin` + `wantKeepAlive = true`로 해당 탭의 상태를 유지하세요.

**Q. 탭이 화면 폭을 넘어가요.**
`TabBar(isScrollable: true)`로 가로 스크롤을 켜면 됩니다.

---

## 📚 참고

- [TabController class — Flutter API](https://api.flutter.dev/flutter/material/TabController-class.html)
- [TabBar class — Flutter API](https://api.flutter.dev/flutter/material/TabBar-class.html)
- [Flutter TabBar: A complete tutorial with examples — LogRocket](https://blog.logrocket.com/flutter-tabbar-a-complete-tutorial-with-examples/)
