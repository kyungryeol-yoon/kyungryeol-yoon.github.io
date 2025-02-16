---
title: "[Blog] Jekyll Liquid Tag Template"
date: 2024-12-29
categories: [Blog, Jekyll]
tags: [Blog, Jekyll, Liquid, Tag, Template]
render_with_liquid: false
---


- jekyll를 이용해서 만든 github blog에 Markdown 문법을 이용해서 글을 쓴다.
- 글을 쓰다 보면 예시를 작성하기 위해 `{{ }}` 과 `{% %}`를 사용하는 일이 생긴다.
- 하지만 그대로 작성하면 문제가 생긴다. 그럴 경우에는 다음과 같이 liquid 문법의 raw tag를 사용한다.

## 작성 방법

- raw tag를 이용해서 앞뒤로 감싸주면 다음과 같이 Markdown 문법에서 `{{ }}`, `{% %}`이 예외 처리가 되어 실행되지 않는다.

  ```
  {% raw %} {{ example }} {% endraw %}
  {% raw %} {% example %} {% endraw %}
  ```

## 결과

  ```
  {{ example }}
  {% example %}
  ```

## 다른 방법

- Jekyll은 코드 블록 안에서도 Liquid 필터를 처리한다.
- 코드 앞 뒤를 `{% raw %}` 와 `{% endraw %}` Tag로 감싸야 할 것입니다.
- Jekyll 4.0 부터, 머리말에 `render_with_liquid: false` 를 추가해 문서 전체의 Liquid 를 비활성화할 수 있다.

  ```md
  ---
  title: "[Blog] Jekyll Liquid Tag Template"
  date: 2024-12-29
  categories: [Blog, Jekyll]
  tags: [Blog, Jekyll, Liquid, Tag, Template]
  render_with_liquid: false
  ---
  ```

> Jekyll Liquid 참고
- <https://jekyllrb-ko.github.io/docs/liquid/tags/>
{: .prompt-info }