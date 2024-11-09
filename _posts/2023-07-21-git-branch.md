---
title: "[Git] Git Branch"
date: 2023-07-21
categories: [Git, Branch]
tags: [Git, Branch]
---

## git pull

- branch를 생성하기 위해 git project의 master가 올린 repo를 pull하여 가져온다.
    ```bash
    git pull "원격 repo 주소"
    ```

- git branch를 입력하여 원격 repo와 연결된 master branch가 생성되어 있는 것을 볼 수 있다.
    ```bash
    git branch
    ```

## git branch "branch 이름"

- 새로운 branch를 생성한다.
    ```bash
    git branch "branch 이름"
    ```

## git checkout "branch 이름"

- git checkout 명령어를 사용하여 branch를 이동할 수 있다.
    ```bash
    git checkout "branch 이름"
    ```

## branch에서 작업 후 add, commit

- 생성한 branch에서 파일을 수정, 삭제, 추가하더라도 병합을 하기 전까지는 master branch에 아무런 영향을 주지 않는다.
- branch에서 작업한 내용을 master에 병합을 하기 위해서는 git에서 add, commit 한 것과 같이 branch의 변경 사항을 업데이트 해 주어야 한다.
    ```bash
    # 파일 상태 체크
    git status

    # 특정 파일만 add 할 때
    git add "파일명"

    # 모든 파일을 add 할 때
    git add -A
    git add .

    # Commit
    git commit -m "commit 메세지"
    ```

## git merge

- 생성한 branch에서의 작업을 모두 commit 했다면 다시 master branch로 돌아와 작업을 진행했던 branch와 병합을 해 주어야 한다.
    ```bash
    # master branch로 돌아가기
    git checkout master

    # 작업을 진행한 branch를 master에 병합하기
    git merge "병합할 branch 이름"

    # 원격 repo에 push
    git push origin "병합한 branch 이름"
    ```

- branch의 변경 사항을 master에서 병합을 했다면 원격 repo에 push, branch의 작업 내용이 반영된 채로 원격 repo에 commit이 된다.

## gitlab Merge Request

- Local에서 생성하고 작업한 branch의 작업 내용만 commit하여 push한 것이기 때문에 프로젝트 master의 branch에는 전혀 영향을 주지 않는다.
- 협업을 진행할 땐 팀원이 진행한 branch의 내용을 master에 병합을 할 필요가 있다.

## 특정 branch만 clone하고 싶을 때
```bash
git clone -b "clone할 branch 이름" --single-branch "repo 주소"
```

## 특정 branch만 pull 할 때
```bash
git pull origin "pull할 branch 이름"
```