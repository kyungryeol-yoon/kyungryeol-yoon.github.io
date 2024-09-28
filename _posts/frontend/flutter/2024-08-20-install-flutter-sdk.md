---
title: "[SDK] Flutter SDK"
date: 2024-08-20
categories: [Flutter, SDK]
tags: [Flutter, SDK]
---

**💡Google에서 개발한 오픈 소스 프레임워크로, 모바일 앱뿐만 아니라 웹 및 데스크톱 앱까지 다양한 플랫폼에서 동작하는 크로스 플랫폼 앱을 개발하는 도구입니다.**

[Install | Flutter](https://docs.flutter.dev/get-started/install)

**❓SDK (Software Development Kit)
: 소프트웨어 개발 키트.
특정한 소프트웨어를 개발하기 위해 필요한 도구, 라이브러리, 문서, 샘플 코드 등이 포함된 패키지입니다.**

**Flutter SDK 특징**

1. **Dart 언어:**
- 플러터 앱을 개발하기 위한 주 언어는 Dart입니다. Dart는 간결하고 생산적인 언어로, 플러터 앱의 비즈니스 로직과 UI를 함께 다룰 수 있습니다.
1. **위젯:**
- 플러터는 위젯을 기반으로 하는 UI 개발을 지원합니다. 위젯은 화면에 표시되는 모든 것을 나타내며, 텍스트, 버튼, 이미지 등 다양한 형태의 위젯을 조합하여 UI를 구성할 수 있습니다.
1. **호환성:**
- 플러터는 iOS와 Android뿐만 아니라 웹 및 데스크톱 플랫폼에도 빌드할 수 있는 크로스 플랫폼 개발을 지원합니다. 이는 개발자가 하나의 코드베이스로 여러 플랫폼에서 동일한 앱을 실행할 수 있도록 해줍니다.
1. **빠른 개발:**
- 플러터는 Hot Reload 기능을 제공하여 앱의 변경 사항을 실시간으로 반영하고 테스트할 수 있습니다. 이는 빠른 개발 주기를 지원하여 생산성을 향상시킵니다.
1. **Material Design 및 Cupertino 스타일:**
- 플러터는 Material Design(Android) 및 Cupertino(iOS)와 호환되는 미리 디자인된 스타일과 위젯을 제공하여 각 플랫폼의 네이티브한 룩앤필을 쉽게 구현할 수 있습니다.
1. **다양한 패키지 및 플러그인:**
- 플러터는 다양한 패키지와 플러그인을 제공하여 네트워크 통신, 데이터베이스 연동, 상태 관리 등 다양한 기능을 쉽게 추가할 수 있습니다.

**Flutter SDK 다운로드**

Flutter 공식사이트 다운로드 링크를 클릭합니다. 그리고 운영체제(OS)를 선택합니다.

https://docs.flutter.dev/get-started/install

**flutter 시스템 환경 변수 설정**

1. **시스템 환경 변수 편집**
2. **[환경 변수]**
3. **시스템 변수**
    
    a. **Path**
    
    b. **[편집]**
    
    c. **[새로 만들기]**
    
    **d. ~/설치경로/flutter/bin   (입력)**
    
    e. **[확인]**
    

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F7c62db61-d5ac-4d5c-afc7-d23b108ba66f%2FUntitled.png&blockId=502758d5-eb61-426d-9e64-85b0736c4ce5

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F1e92a165-e65f-46d5-9c9c-1cbd1166351e%2FUntitled.png&blockId=246c0842-f522-4bd9-bd21-679eb1a16b62

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fc3645a6b-bad0-4054-8438-9e536f2a6690%2FUntitled.png&blockId=9d1a357b-c354-47a9-a4f4-643a122c42b1

**flutter doctor 실행하기**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**💡flutter doctor?**
: **개발 환경의 설정 및 필수 구성 요소를 검사하고 문제를 해결하는 데 도움을 주는 명령어**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**📂~/설치경로/flutter/bin**

cd  ~/설치경로/flutter/bin

flutter doctor

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F8a6aec27-74c4-4aa1-afc6-92967280e0d0%2FUntitled.png&blockId=83e5d6e2-f9d5-423b-9117-cdc302aac8a5

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

❌표시로 나오는 부분은 추가로 설치할 항목이 필요하거나 설정이 필요한 내용입니다.

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**❌cmdline-tools component is missing.**

**➡️cmdline-tools 라는 플러그인 설치가 필요합니다.**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**❌Anroid license status unknown.**

**➡️안드로이드 관련 라이센스 동의가 필요합니다.**

(명령어를 입력하여 라이센스 동의를 하라고 알려주고 있는데, 먼저 명령어를 사용하기 위해서는 cmdline-tools 라는 플러그인이 설치되어야 명령어를 사용할 수 있습니다.)

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**❌Visual Studio not installed: this is necessary to develop Windows apps**

**➡️**비주얼 스튜디오 개발 앱이 설치되어 있지 않습니다. (비주얼 스튜디오를 사용하지 않는다면, 무시해도 좋습니다. cf. VS Code 와 다릅니다.)

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**Andriod 라이센스 승인**

flutter doctor --andriod-licenses

**에러 메시지**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

⛔Android **sdkmanager** not found. Update to the latest Android SDK and ensure that the **cmdline-tools** are installed to resolve this.

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F6e85ce14-4fdb-4db1-adf4-53467691ac3b%2FUntitled.png&blockId=e87f6144-ebd0-419e-b309-38dd45fbef8c

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**✅해결방법
: SDK Manager 에서 cmdline-tools 설치**

SDK Manager 설치 참고

[https://www.notion.so/SDK-Manager-10d6e77caa1380a48af8c5c4f670ae8d](https://www.notion.so/SDK-Manager-10d6e77caa1380a48af8c5c4f670ae8d?pvs=21)

**cmdline tools 설치**

1. **Andriod Studio 실행**
2. **More Actions  SDK Manager**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

1. **SDK Tools**
    1. **Android SDK Command-line Tools**

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

[data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

**✅이 도구가 있어야 CLI (명령어)로 설정을 할 수 있습니다.**

ex) flutter doctor --android-licenses

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F270ffd81-346d-44d3-9347-93a9e1c8976c%2FUntitled.png&blockId=7e853a3d-df9a-475c-a3d7-189e2f2e37cf

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fa26191ba-c39e-472a-a698-bdf3f81573d0%2FUntitled.png&blockId=194d1307-e737-420c-8c88-9f54d2c0c560

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F9e64dab4-639a-495d-93d7-a7c5aa05c91c%2FUntitled.png&blockId=85ace8f9-19ab-401e-99c5-3fda657ca5ea

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fb9b988ce-824b-4378-8a26-8725a323bdd1%2FUntitled.png&blockId=95619200-b39b-4279-ac59-2bd25dfdc864

**Andriod 라이센스 승인 이어서 하기**

flutter doctor

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fcddb8440-d759-47fa-9c5e-86591001238f%2FUntitled.png&blockId=57d49b16-1cf9-4d5b-ae4a-fa4b5273786a

flutter doctor --andriod-licenses

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2F6cbef66e-1057-405f-8b4a-1aab240a03aa%2FUntitled.png&blockId=f5af2544-b2fb-4b2f-96cb-d5859fed8a23

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fd6374548-94be-4020-8c23-9364d4a08d9f%2FUntitled.png&blockId=21edcf80-3d9d-415c-b519-682542f94034

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fff9c8bf6-d403-4a4d-ae78-ff00fa4c5591%2FUntitled.png&blockId=6d230071-3bae-42de-a35a-17868a64ff4a

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fd354ba86-8eec-441b-a713-e18e32b22679%2FUntitled.png&blockId=5b4354c1-e071-4e3a-af42-9751d670f322

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fc966a5fb-1193-4c9c-b66e-2ea181d16e03%2FUntitled.png&blockId=7900c2df-a978-43e3-80f5-aae4909d0fc4

flutter doctor

https://oopy.lazyrockets.com/api/v2/notion/image?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc20b1d05-cb56-42ba-8be5-eff501f44933%2Fcac9f141-fa8e-4497-8928-6ae824969d09%2FUntitled.png&blockId=f76a7a96-7256-43f3-89bc-c736eb174d5a