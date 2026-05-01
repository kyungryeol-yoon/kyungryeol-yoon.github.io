---
title: "[Docker/Container] 컨테이너 사이즈와 UFS(Union File System) 이해"
date: 2021-10-02
categories: [Platform, Docker]
tags: [docker, container, ufs, union filesystem, image, layer]
---

## 🐳 컨테이너 이미지 사이즈(Container Size)와 UFS 이해

Docker나 OCI 기반 컨테이너를 다루다 보면,  
컨테이너 **이미지 크기**와 **Union File System(UFS)** 개념이 중요하게 등장합니다.

이 글에서는:

- 컨테이너 사이즈 개념
- UFS(Union File System)의 동작 원리
- 실무에서 이미지 최적화 팁

등을 다룹니다.

---

## 1️⃣ 컨테이너 이미지 사이즈란?

컨테이너 이미지는 **애플리케이션 코드 + 런타임 + 라이브러리 + OS 레이어**가 합쳐진 패키지입니다.

```

Container Image = Base OS Layer + App Dependencies + Application Code

```

- 이미지가 클수록:
  - 다운로드/배포 시간이 길어짐
  - 디스크 공간 사용 증가
- 이미지가 작을수록:
  - 배포 속도 빠름
  - CI/CD 효율 증가

> 🔹 Tip: Alpine, Distroless 같은 **경량 베이스 이미지** 활용

---

## 2️⃣ UFS(Union File System)란?

**Union File System**은 컨테이너 이미지의 **계층(Layer) 구조**를 관리하는 파일 시스템입니다.

- 여러 파일 시스템 레이어를 **합쳐서 하나처럼 보여줌**
- 읽기 전용(Read-Only) 레이어 + 쓰기 가능한(Writeable) 레이어 구성

```

[Read-Only Layers]
├─ Base OS
├─ Dependencies
├─ Application Code
[Writable Layer]
└─ Container Runtime Changes
----------------------------

Merged View → Container에서 하나의 파일 시스템처럼 보임

```

---

### 2.1 UFS의 동작 원리

1. **Read-Only 레이어**  
   - 이미지 생성 시마다 쌓이는 레이어
   - 재사용 가능 → 레이어 캐싱

2. **Writable 레이어**  
   - 컨테이너가 실행될 때 생성
   - 컨테이너 내부 변경 사항 반영

3. **파일 읽기/쓰기 흐름**  
   - 파일 읽기 → 가장 위 레이어부터 검색  
   - 파일 쓰기 → Writable 레이어에 기록
   - 파일 삭제 → “whiteout” 파일 생성 → 하위 레이어 숨김 처리

---

## 3️⃣ 레이어와 이미지 최적화

UFS 덕분에 **레이어 단위 캐싱**과 **이미지 재사용**이 가능하지만,  
레이어 구조에 따라 이미지 사이즈가 커질 수 있습니다.

- 레이어 합병이 많으면 관리 복잡도 증가  
- 불필요한 파일 추가 시 이미지 사이즈 증가

### 🔹 실무 팁

- `apt-get clean`, `.dockerignore` 활용 → 불필요 파일 제외
- 자주 변경되는 파일은 **하위 레이어**에 두어 캐시 활용
- **멀티스테이지 빌드(Multi-stage build)** 활용 → 최종 이미지 최소화

---

## 4️⃣ 컨테이너 이미지 사이즈 확인

```bash
# 로컬 이미지 사이즈 확인
docker images

# 컨테이너 실행 후 레이어별 사이즈 확인
docker history <image-name>
```

---

## 5️⃣ 요약

* **컨테이너 이미지 사이즈** = OS + 라이브러리 + 애플리케이션 코드
* **UFS(Union File System)** = 레이어를 합쳐 **읽기 전용 + 쓰기 레이어** 구조 제공
* 이미지 최적화 포인트:

  * 불필요 파일 제거
  * 멀티스테이지 빌드
  * 레이어 캐시 전략

> 💡 결론: 컨테이너 효율과 배포 속도를 높이려면 **이미지 구조와 UFS 동작 원리**를 이해하는 것이 필수입니다.
