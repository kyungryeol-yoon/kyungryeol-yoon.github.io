---
title: "[Docker] 컨테이너 이미지 최적화와 UFS 심화 이해"
date: 2021-10-05
categories: [Platform, Docker]
tags: [docker, container, ufs, union filesystem, image, layer, optimization, multi-stage build]
---

## 🐳 컨테이너 이미지 최적화와 UFS(Union File System) 심화

Docker 컨테이너를 다루다 보면 **이미지 사이즈**와 **Union File System(UFS)**를 이해하는 것이 필수입니다.  
이번 글에서는 **이미지 구조 분석, UFS 동작 원리, 최적화 실전 예제**까지 다룹니다.

---

## 1️⃣ 컨테이너 이미지 사이즈(Container Size) 이해

컨테이너 이미지는 **애플리케이션 코드 + 런타임 + 라이브러리 + OS 레이어**가 합쳐진 패키지입니다.

```

Container Image = Base OS Layer + App Dependencies + Application Code

```

- 이미지가 크면: 다운로드/배포 시간이 길어지고 디스크 사용량 증가  
- 이미지가 작으면: 배포 속도 빠르고 CI/CD 효율 상승  

> 🔹 Tip: Alpine, Distroless 같은 **경량 베이스 이미지** 활용

---

## 2️⃣ UFS(Union File System) 이해

**Union File System**은 컨테이너 이미지의 **레이어 구조**를 합쳐서 관리하는 파일 시스템입니다.

- 여러 파일 시스템 레이어를 **합쳐 하나의 파일 시스템처럼 표시**  
- 읽기 전용(Read-Only) 레이어 + 쓰기 가능한(Writeable) 레이어 구성

```

[Read-Only Layers]
├─ Base OS
├─ Dependencies
├─ Application Code
[Writable Layer]
└─ Container Runtime Changes
----------------------------

Merged View → 컨테이너에서 하나의 파일 시스템처럼 보임

```

---

### 2.1 UFS 동작 원리

1. **Read-Only 레이어**  
   - 이미지 빌드 시 생성  
   - 재사용 가능 → 레이어 캐싱 효과  

2. **Writable 레이어**  
   - 컨테이너 실행 시 생성  
   - 컨테이너 내부 변경 사항 반영  

3. **파일 읽기/쓰기 흐름**  
   - 파일 읽기 → 가장 위 레이어부터 검색  
   - 파일 쓰기 → Writable 레이어에 기록  
   - 파일 삭제 → “whiteout” 파일 생성 → 하위 레이어 숨김 처리

---

## 3️⃣ 이미지 최적화 실전 예제

### 3.1 불필요 파일 제거

```dockerfile
# 불필요 캐시 제거
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

### 3.2 멀티스테이지 빌드(Multi-stage Build)

```dockerfile
# Build stage
FROM maven:3.9-jdk17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/myapp.jar .
ENTRYPOINT ["java", "-jar", "myapp.jar"]
```

> ✅ 결과: 최종 이미지에는 **빌드 도구와 캐시가 제거**되어 사이즈 최소화

---

## 4️⃣ 이미지 레이어 확인

```bash
# 로컬 이미지 사이즈 확인
docker images

# 레이어별 사이즈 확인
docker history <image-name>
```

* 레이어 구조를 분석하면 **어디서 이미지가 커지는지** 쉽게 파악 가능

---

## 5️⃣ 실무 팁

* 📝 `.dockerignore` 활용 → 불필요 파일 제외
* 📝 자주 변경되는 파일은 하위 레이어에 두어 **캐시 활용**
* 📝 베이스 이미지는 **경량 이미지** 권장
* 📝 이미지 빌드 단계 분리 → 멀티스테이지 활용

---

## 6️⃣ 요약

* **컨테이너 이미지 사이즈** = OS + 라이브러리 + 애플리케이션 코드
* **UFS(Union File System)** = 레이어를 합쳐 **읽기 전용 + 쓰기 레이어** 구조 제공
* 이미지 최적화 포인트:

  * 불필요 파일 제거
  * 멀티스테이지 빌드
  * 레이어 캐시 전략

> 💡 결론: 컨테이너 효율과 배포 속도를 높이려면
> **이미지 구조와 UFS 동작 원리, 멀티스테이지 최적화 전략**을 이해하는 것이 필수입니다.
