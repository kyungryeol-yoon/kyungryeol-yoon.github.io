---
title: "[Flutter] SDK"
date: 2024-08-24
categories: [Frontend, Flutter]
tags: [flutter, sdk]
---

**Google에서 개발한 오픈 소스 프레임워크로, 모바일 앱뿐만 아니라 웹 및 데스크톱 앱까지 다양한 플랫폼에서 동작하는 크로스 플랫폼 앱을 개발하는 도구**

## SDK (Software Development Kit) : 소프트웨어 개발 키트

- 특정한 소프트웨어를 개발하기 위해 필요한 도구, 라이브러리, 문서, 샘플 코드 등이 포함된 패키지이다.

## Flutter SDK 특징

1. **Dart 언어:**
- 플러터 앱을 개발하기 위한 주 언어는 Dart. Dart는 간결하고 생산적인 언어로, 플러터 앱의 비즈니스 로직과 UI를 함께 다룰 수 있다.
2. **위젯:**
- 플러터는 위젯을 기반으로 하는 UI 개발을 지원한다. 위젯은 화면에 표시되는 모든 것을 나타내며, 텍스트, 버튼, 이미지 등 다양한 형태의 위젯을 조합하여 UI를 구성할 수 있다.
3. **호환성:**
- 플러터는 iOS와 Android뿐만 아니라 웹 및 데스크톱 플랫폼에도 빌드할 수 있는 크로스 플랫폼 개발을 지원한다. 이는 개발자가 하나의 코드베이스로 여러 플랫폼에서 동일한 앱을 실행할 수 있도록 해준다.
4. **빠른 개발:**
- 플러터는 Hot Reload 기능을 제공하여 앱의 변경 사항을 실시간으로 반영하고 테스트할 수 있다. 이는 빠른 개발 주기를 지원하여 생산성을 향상시킨다.
5. **Material Design 및 Cupertino 스타일:**
- 플러터는 Material Design(Android) 및 Cupertino(iOS)와 호환되는 미리 디자인된 스타일과 위젯을 제공하여 각 플랫폼의 네이티브한 룩앤필을 쉽게 구현할 수 있다.
6. **다양한 패키지 및 플러그인:**
- 플러터는 다양한 패키지와 플러그인을 제공하여 네트워크 통신, 데이터베이스 연동, 상태 관리 등 다양한 기능을 쉽게 추가할 수 있다.

> Install Flutter
- <https://docs.flutter.dev/get-started/install>
{: .prompt-info }

## **flutter 시스템 환경 변수 설정**

1. **시스템 환경 변수 편집**
2. **[환경 변수]**
3. **시스템 변수**
  1. **Path**
  2. **[편집]**
  3. **[새로 만들기]**
  4. **~/설치경로/flutter/bin (입력)**
  5. **[확인]**

## flutter doctor 실행하기

### **flutter doctor?**

- 개발 환경의 설정 및 필수 구성 요소를 검사하고 문제를 해결하는 데 도움을 주는 명령어

### **📂~/설치경로/flutter/bin**

- cd  ~/설치경로/flutter/bin

  ```bash
  flutter doctor
  ```

  ```bash
  Doctor summary (to see all details, run flutter doctor -v):
  [√] Flutter (Channel stable, 3.24.0, on Microsoft Windows [Version 10.0.22631.4169], locale ko-KR)
  [√] Windows Version (Installed version of Windows is version 10 or higher)
  [!] Android toolchain - develop for Android devices (Android SDK version 35.0.0)
      ! Some Android licenses not accepted. To resolve this, run: flutter doctor --android-licenses
  [√] Chrome - develop for the web
  [X] Visual Studio - develop Windows apps
      X Visual Studio not installed; this is necessary to develop Windows apps.
      Download at https://visualstudio.microsoft.com/downloads/.
      Please install the "Desktop development with C++" workload, including all of its default components
  [!] Android Studio (version 2022.2)
      X Unable to find bundled Java version.
  [√] Android Studio (version 2024.1)
  [√] VS Code (version 1.92.2)
  [√] Connected device (3 available)
  [√] Network resources

  ! Doctor found issues in 3 categories.
  ```

## **❌ 표시로 나오는 부분은 추가로 설치할 항목이 필요하거나 설정이 필요한 내용**

- **❌ cmdline-tools component is missing.**
  - **➡️cmdline-tools 라는 플러그인 설치가 필요합니다.**
- **❌ Anroid license status unknown.**
  - **➡️안드로이드 관련 라이센스 동의가 필요합니다.**
    > 명령어를 입력하여 라이센스 동의를 하라고 알려주고 있는데, 먼저 명령어를 사용하기 위해서는 cmdline-tools 라는 플러그인이 설치되어야 명령어를 사용할 수 있다.
    {: .prompt-info }

- **❌ Visual Studio not installed: this is necessary to develop Windows apps**
  - **➡️**Visual Studio 개발 앱이 설치되어 있지 않다. (Visual Studio를 사용하지 않는다면, 무시해도 좋다. cf. VS Code 와 다르다.)


### **Andriod 라이센스 승인**

```bash
flutter doctor --andriod-licenses
```

> Android **sdkmanager** not found. Update to the latest Android SDK and ensure that the **cmdline-tools** are installed to resolve this.
{: .prompt-danger }

#### **해결방법: SDK Manager 에서 cmdline-tools 설치**

> [SDK Manager 설치 참고](https://kyungryeol-yoon.github.io/posts/install-android-sdk-manager/)
{: .prompt-info }

1. **Andriod Studio 실행**
2. **More Actions  SDK Manager**
3. **SDK Tools**
  1. **Android SDK Command-line Tools**

**이 도구가 있어야 CLI (명령어)로 설정을 할 수 있다.**

```bash
flutter doctor --android-licenses
```