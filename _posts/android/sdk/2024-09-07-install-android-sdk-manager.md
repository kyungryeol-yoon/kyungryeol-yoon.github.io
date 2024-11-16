---
title: "[Android] SDK Manager"
date: 2024-09-07
categories: [Android, SDK]
tags: [Android, SDK]
---

## SDK Manager

- Android 개발에 필요한 소프트웨어 개발 키트(Software Development Kit) 및 관련 도구, 플랫폼 및 시스템 이미지를 설치하고 관리하는 도구

### 주요 기능

1. **SDK 및 도구 설치**
    - Android SDK Manager를 통해 Android 버전에 맞는 SDK 플랫폼, 빌드 도구, 플랫폼 도구, 시스템 이미지 등을 다운로드하고 설치할 수 있다.
2. **라이브러리 및 추가 컴포넌트 관리**
    - 필요한 라이브러리, 추가 도구, 시스템 이미지 등을 SDK Manager를 통해 쉽게 관리할 수 있다.
3. **SDK 버전 및 플랫폼 업데이트**
    - 새로운 Android 버전이나 플랫폼 도구가 출시되면 SDK Manager를 통해 업데이트를 받고 새로운 기능 및 개선 사항을 활용할 수 있다.
4. **가상 디바이스 생성 및 관리**
    - SDK Manager를 사용하여 가상 디바이스에 사용할 수 있는 다양한 시스템 이미지를 설치하고 관리할 수 있다.
5. **라이선스 관리**
    - Android SDK Manager를 통해 필요한 라이선스를 수락하고 관리할 수 있다. 명령행 도구로도 사용 가능하며, 명령행에서는 **sdkmanager**를 사용한다.
6. **안드로이드 스튜디오와의 통합**
    - Android SDK Manager는 주로 안드로이드 스튜디오(Android Studio)와 함께 사용되며, 스튜디오에서도 SDK 관리 기능이 일부 내장되어 있다.

## Android SDK 설치

1. **Andriod Studio 실행**
2. **More Actions ➡️ SDK Manager**
3. **Edit**
4. **SDK Components Setup**
    1. Andriod SDK
    2. Android SDK Platform
    3. Android API 34(Version)

## cmdline tools 설치

1. **Andriod Studio 실행**
2. **More Actions ➡️ SDK Manager**
3. **SDK Tools**
    1. **Android SDK Command-line Tools**

> 이 도구가 있어야 CLI (명령어)로 설정을 할 수 있다.
{: .prompt-warning }

```bash
flutter doctor --android-licenses
```