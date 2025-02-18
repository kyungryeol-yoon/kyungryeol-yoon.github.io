---
title: "[Android] Facebook 로그인 구현하기"
date: 2017-01-25
categories: [Android, Facebook]
tags: [Android, Programming, Java, Facebook, Login]
---

## AndroidManifest.xml

```xml
<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="페이스북APP_ID"/>
<activity android:name="com.facebook.FacebookActivity"
  android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
  android:theme="@android:style/Theme.Translucent.NoTitleBar"
  android:theme="@android:style/Theme.Translucent.NoTitleBar"
  android:label="@string/app_name" />
<provider android:authorities="com.facebook.app.FacebookContentProvider페이스북APP_ID"
  android:name="com.facebook.FacebookContentProvider"
  android:exported="true" />
```

## Login 요청 버튼 구현

> Arrays.asList를 이용하여 권한을 추가로 요청하실 수 있습니다. 일부 권한은 페이스북 앱 리뷰를 통과해야 합니다.
{: .prompt-info }

```java
private void isLoginFacebook() {
  FacebookSdk.sdkInitialize(getApplicationContext());
  callbackManager = CallbackManager.Factory.create();
  LoginManager.getInstance().logInWithReadPermissions(this, Arrays.asList("public_profile", "email"));
  LoginManager.getInstance().registerCallback(callbackManager, new FacebookCallback<LoginResult>() {
    @Override
    public void onSuccess(LoginResult loginResult) {
      Log.d("TAG", "페이스북 토큰 -> " + loginResult.getAccessToken().getToken());
      Log.d("TAG","페이스북 UserID -> " + loginResult.getAccessToken().getUserId());
    }

    @Override
    public void onCancel() {
      Log.d("TAG","취소됨");
    }

    @Override
    public void onError(FacebookException e) {
      e.printStackTrace();
    }
  });
}
```

## 사용자 정보 획득

```java
GraphRequest request = GraphRequest.newMeRequest( 엑세스토큰 ,
  new GraphRequest.GraphJSONObjectCallback() {
    @Override
    public void onCompleted(JSONObject object, GraphResponse response) {
      Log.d("TAG","페이스북 로그인 결과" + response.toString());

      try {
        String email = object.getString("email");       // 이메일
        String name = object.getString("name");         // 이름
        String gender = object.getString("gender");     // 성별

        Log.d("TAG","페이스북 이메일 -> " + email);
        Log.d("TAG","페이스북 이름 -> " + name);
        Log.d("TAG","페이스북 성별 -> " + gender);

      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  });
Bundle parameters = new Bundle();
parameters.putString("fields", "id,name,email,gender");
request.setParameters(parameters);
request.executeAsync();
```

## callbackManager 호출

```java
@Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    // 페이스북 로그인 결과를 콜백매니저에 담는다
    callbackManager.onActivityResult(requestCode, resultCode, data);
  }
```