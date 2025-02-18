---
title: "[Flutter] Google Login"
date: 2024-08-29
categories: [Framework, Flutter]
tags: [Flutter, Google, Login]
---

### Flutter 프로젝트 설정

```bash
flutter create my_project
cd my_project
```

### Firebase 설정

1. Firebase Console에 가서 새 프로젝트를 생성한다.
2. 안드로이드 앱을 추가한다.
  1. 패키지 이름을 입력합니다.
    - 예: com.example.my_project
  2. google-services.json 파일을 다운로드한다.
3. 다운로드한 google-services.json 파일을 android/app Directory에 추가한다.

### Dependencies 추가

- pubspec.yaml 파일을 열고 google_sign_in과 firebase_auth 패키지를 추가한다.
  ```yaml
  dependencies:
    flutter:
      sdk: flutter
    google_sign_in: ^6.1.0
    firebase_auth: ^4.5.0
    firebase_core: ^2.16.0
  ```

- 그런 다음, 패키지를 설치한다.
  ```bash
  flutter pub get
  ```

### Android 설정

- `android/build.gradle` 파일을 열고 classpath에 Google 서비스 플러그인을 추가한다.
  ```groovy
  buildscript {
      dependencies {
          ...✂...
          classpath 'com.google.gms:google-services:4.3.15'  // 최신 버전 확인
      }
  }
  ```

- 그 다음 `android/app/build.gradle` 파일을 열고 아래를 추가한다.
  ```groovy
  apply plugin: 'com.google.gms.google-services'

  android {
      ...✂...
      defaultConfig {
          ...✂...
          minSdkVersion 21
      }
  }
  ```

### Firebase 초기화

- `lib/main.dart` 파일을 열고 Firebase를 초기화한다.
  ```dart
  import 'package:flutter/material.dart';
  import 'package:firebase_core/firebase_core.dart';
  import 'package:google_sign_in/google_sign_in.dart';
  import 'package:firebase_auth/firebase_auth.dart';

  void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp();
    runApp(MyApp());
  }

  class MyApp extends StatelessWidget {
    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        home: SignInScreen(),
      );
    }
  }
  ```

### Google 로그인 기능 구현

- SignInScreen 클래스를 추가하여 Google 로그인 기능을 구현한다.
  ```dart
  class SignInScreen extends StatelessWidget {
    final GoogleSignIn googleSignIn = GoogleSignIn();
    final FirebaseAuth firebaseAuth = FirebaseAuth.instance;

    Future<User?> _signInWithGoogle() async {
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      final GoogleSignInAuthentication? googleAuth = await googleUser?.authentication;

      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth?.accessToken,
        idToken: googleAuth?.idToken,
      );

      UserCredential userCredential = await firebaseAuth.signInWithCredential(credential);
      return userCredential.user;
    }

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(title: Text("Google Sign In")),
        body: Center(
          child: ElevatedButton(
            onPressed: () async {
              User? user = await _signInWithGoogle();
              if (user != null) {
                print("로그인 성공: ${user.displayName}");
              }
            },
            child: Text("Google로 로그인"),
          ),
        ),
      );
    }
  }
  ```

### 권한 설정

- AndroidManifest.xml 파일에 인터넷 권한을 추가한다.
  ```xml
  <uses-permission android:name="android.permission.INTERNET"/>
  ```