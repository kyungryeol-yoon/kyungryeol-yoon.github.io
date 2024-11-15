---
title: "[Git] .gitignore 파일이 바로 적용이 안될 때 해결방법 : git 캐시 삭제"
date: 2024-08-22
categories: [Git, gitignore]
tags: [Git, gitignore, Error]
---

## 문제점

- .gitignore 파일에 추가를 하고 확인해 보았지만 바로 적용이 되지 않은 문제점을 확인

## 해결방법

- 해당 명령어는 Git에서 Local 저장소에서 파일을 제거하지만 **실제 파일은 유지**되며 Commit을 수행하는 과정을 통해 반영되지 않은 .gitignore를 수행

> 실제 파일은 삭제되지 않는다
{: .prompt-info }

```bash
# 인덱스/스테이징 영역에 있는 영역에서만 Local 파일을 삭제하고 실제 파일은 남겨둔다.
git rm -r --cached .

# Local 저장소의 내용을 스테이징 영역으로 올린다.
git add .

# 변경 사항을 커밋한다.
git commit -m "커밋 내용"

# 변경 사항을 원격 저장소로 올린다.
git push
```

### 해결 방법 : 1단계

- Git 인덱스 또는 스테이징 영역에서 모든 파일과 디렉터리를 삭제하지만 Local 파일 시스템에서는 삭제하지 않고 남겨둘 때 사용된다.
    > 실제 파일은 삭제되지 않는다
    {: .prompt-info }

- **git** : Git의 명령 줄 인터페이스
- **rm** : 파일 또는 디렉토리를 삭제하는 명령
- **-r** : 디렉토리를 재귀적으로 삭제하는 옵션
- **--cached** : 이 옵션은 파일을 인덱스/스테이징 영역에서만 삭제하고 Local 파일 시스템에서는 삭제하지 않도록 Git에 지시
- **.** : 현재 디렉터리를 지정


### 해결방법: 2단계

- Local 저장소의 변경 사항을 스테이징 영역으로 모두 추가
    ```bash
    git add .
    ```

### 해결 방법 : 3단계

- Local 저장소에 있는 내용들을 Commit하고 Push
    ```bash
    git commit -m "Commit 내용"
    ```

    ```bash
    git push
    ```