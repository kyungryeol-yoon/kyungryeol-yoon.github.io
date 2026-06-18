---
title: "[Docker] 컨테이너 이미지 크기와 UFS — 구조부터 최적화까지"
date: 2021-10-05
tags: [docker, container, ufs, union-filesystem, image, layer, optimization, multi-stage-build]
description: "Docker 컨테이너 이미지 크기와 Union File System(UFS) 구조를 이해하고, overlay2 동작 원리·레이어 캐싱·멀티스테이지 빌드 등 실전 이미지 최적화 기법까지 한 번에 정리합니다."
---

Docker·OCI 컨테이너의 이미지 크기는 배포 속도·디스크 사용량·CI/CD 효율을 좌우합니다. 이 글에서는 **이미지 크기의 구성**, **Union File System(UFS)의 동작 원리**, 그리고 **레이어 캐싱·멀티스테이지 빌드 등 실전 최적화 기법**까지 한 흐름으로 정리합니다.

## 🐳 컨테이너 이미지 크기란?

컨테이너 이미지는 **OS 레이어 + 라이브러리/의존성 + 애플리케이션 코드**가 합쳐진 패키지입니다.

```text
Container Image = Base OS Layer + App Dependencies + Application Code
```

| 이미지가 크면 | 이미지가 작으면 |
|---|---|
| 다운로드/배포 시간 증가 | 배포 속도 향상 |
| 디스크 사용량 증가 | CI/CD 효율 상승 |
| 공격 표면(취약점) 증가 | 보안·운영 비용 감소 |

> 💡 가장 쉬운 첫걸음은 **경량 베이스 이미지**(Alpine, Distroless, `-slim`)를 쓰는 것입니다.

---

## 📦 UFS(Union File System)란?

**Union File System**은 여러 파일 시스템 레이어를 **하나처럼 합쳐 보여주는** 파일 시스템으로, 컨테이너 이미지의 계층(Layer) 구조를 관리합니다. 현재 Docker의 기본·권장 드라이버는 **overlay2**입니다.

```text
[Read-Only Layers]          ← 이미지 레이어(재사용·캐시)
├─ Base OS
├─ Dependencies
└─ Application Code
[Writable Layer]            ← 컨테이너 실행 시 생성
└─ Container Runtime Changes
----------------------------
Merged View → 컨테이너에서 하나의 파일 시스템처럼 보임
```

### 동작 원리

1. **Read-Only 레이어** — 이미지 빌드 시마다 쌓이며, 동일하면 **재사용(캐싱)** 됩니다.
2. **Writable 레이어** — 컨테이너 실행 시 생성되어 내부 변경 사항을 담습니다.
3. **읽기/쓰기 흐름**
   - 읽기: 가장 위 레이어부터 아래로 탐색
   - 쓰기: **CoW(Copy-on-Write)** — 하위 레이어의 파일을 수정하면 **그 파일 전체를 writable 레이어로 복사한 뒤** 변경
   - 삭제: `whiteout` 파일을 만들어 하위 레이어의 파일을 숨김 처리

> ⚠️ CoW 때문에 **큰 파일을 자주 수정**하면 복사 비용이 큽니다. 쓰기가 잦거나 영속이 필요한 데이터는 레이어가 아니라 **볼륨(Volume)** 에 두세요.

---

## ⚡ 이미지 최적화 실전

### 1) 불필요 파일 제거 — 한 레이어에서 정리

설치와 캐시 삭제를 **같은 `RUN`** 에서 처리해야 레이어에 캐시가 남지 않습니다.

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

### 2) 멀티스테이지 빌드(Multi-stage Build)

빌드 도구는 빌드 단계에만 두고, 최종 이미지에는 산출물만 복사합니다.

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

> ✅ 결과: 최종 이미지에서 **빌드 도구·캐시가 제거**되어 크기가 크게 줄어듭니다.

### 3) 레이어 순서로 캐시 활용

Docker는 각 레이어를 SHA256 해시로 비교해 **변하지 않은 레이어는 캐시를 재사용**합니다. **자주 바뀌지 않는 것(의존성)을 위에, 자주 바뀌는 것(소스 코드)을 아래**에 두세요. 순서가 잘못되면 코드 한 줄 바꿔도 의존성부터 다시 받습니다.

```dockerfile
# 의존성 먼저(잘 안 바뀜) → 캐시 적중
COPY pom.xml .
RUN mvn dependency:go-offline
# 소스는 나중에(자주 바뀜)
COPY src ./src
```

### 4) `.dockerignore`

`.git`, `node_modules`, 로컬 빌드 산출물 등 빌드 컨텍스트에서 제외해 불필요한 레이어 증가를 막습니다.

---

## 🔍 이미지 크기·레이어 확인

```bash
# 이미지 크기 확인
docker images

# 레이어별 크기·명령 확인
docker history <image-name>
```

> 💡 레이어별로 **어디서 용량이 커지는지** 시각적으로 분석하려면 오픈소스 도구 [`dive`](https://github.com/wagoodman/dive)가 유용합니다. 레이어 선택 시 추가/변경된 파일 트리를 보여줍니다.

---

## 🤔 핵심 요약

- **이미지 크기** = OS + 라이브러리 + 애플리케이션 코드
- **UFS(overlay2)** = 읽기 전용 레이어 + 쓰기 레이어를 합쳐 제공, 쓰기는 CoW
- **최적화 3대 포인트**: ① 불필요 파일 제거(한 레이어 정리) ② 멀티스테이지 빌드 ③ 레이어 순서로 캐시 활용 + 경량 베이스

---

## ❓ 자주 묻는 질문

**Q. 레이어를 줄이려고 `RUN`을 하나로 합치면 무조건 좋나요?**
캐시 측면에선 손해일 수 있습니다. **자주 바뀌는 단계와 안 바뀌는 단계는 분리**해야 캐시가 살아납니다. "불필요 파일 정리"만 같은 RUN에서 처리하세요.

**Q. 이미지를 가장 빠르게 줄이는 한 가지는?**
멀티스테이지 빌드 + 경량 베이스(`-slim`/Distroless) 조합이 효과가 가장 큽니다.

**Q. 쓰기가 많은 데이터는 어디에?**
레이어(CoW)는 큰 파일 수정에 비싸므로 **볼륨**을 사용하세요.

---

## 📚 참고

- [OverlayFS storage driver — Docker Docs](https://docs.docker.com/engine/storage/drivers/overlayfs-driver/)
- [Storage drivers — Docker Docs](https://docs.docker.com/engine/storage/drivers/)
- [dive — 이미지 레이어 분석 도구 (GitHub)](https://github.com/wagoodman/dive)
- [How to Optimize Docker overlay2 Storage Driver Performance — OneUptime](https://oneuptime.com/blog/post/2026-02-08-how-to-optimize-docker-overlay2-storage-driver-performance/view)
