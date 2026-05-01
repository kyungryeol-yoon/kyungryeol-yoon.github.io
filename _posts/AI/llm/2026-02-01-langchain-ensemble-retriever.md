---
title: "[LangChain] 🔀 Ensemble Retriever로 RAG 검색 정확도 높이기: BM25 + Vector 하이브리드 검색"
date: 2026-02-01
categories: [AI, LLM]
tags: [langchain, rag, ensemble-retriever, bm25, faiss, hybrid-search, rrf, vector-search, llm, retrieval]
description: "LangChain Ensemble Retriever로 BM25 키워드 검색과 Vector 의미 검색을 결합하는 하이브리드 RAG 구축 방법을 정리했습니다. RRF 알고리즘, weights 설정, 실무 코드 예시까지 다룹니다."
pin: false
---

LangChain Ensemble Retriever는 BM25 키워드 검색과 Vector 의미 검색을 결합하여 단일 검색기보다 높은 정확도를 제공하는 하이브리드 검색 방식입니다. 두 검색기의 결과를 RRF(Reciprocal Rank Fusion) 알고리즘으로 재순위화하여 최적의 문서를 반환합니다. 이 글에서는 Ensemble Retriever의 동작 원리부터 BM25 + FAISS 조합 코드, weights 튜닝, 실무 적용 팁까지 정리합니다.

---

## 🤔 왜 단일 검색기로는 부족한가?

RAG(Retrieval-Augmented Generation) 시스템에서 검색 품질은 LLM 답변의 품질을 직접 결정합니다. 그런데 현재 가장 많이 쓰이는 두 가지 검색 방식은 각각 뚜렷한 한계가 있습니다.

### Dense Retrieval (의미 기반 — Vector Search)

임베딩 벡터의 코사인 유사도로 의미적으로 유사한 문서를 찾습니다. 단어가 달라도 의미가 같으면 검색되는 것이 강점이지만, **정확한 용어·고유명사·코드 식별자** 검색에는 취약합니다.

### Sparse Retrieval (키워드 기반 — BM25)

단어 빈도(TF-IDF 기반 BM25)로 문서를 검색합니다. "쿠버네티스", "CVE-2024-1234" 같은 정확한 키워드 일치에 강하지만, **동의어·문맥 기반 질문**에는 약합니다.

| 방식 | 강점 | 약점 |
|------|------|------|
| **Vector (Dense)** | 의미 유사성, 동의어, 맥락 이해 | 정확한 용어·고유명사·코드 검색 |
| **BM25 (Sparse)** | 키워드 정확 일치, 도메인 전문용어 | 오타, 동의어, 문맥 파악 |
| **Hybrid (Ensemble)** | 두 방식의 장점 결합 | 설정 복잡도 증가 |

> **Tip**: 실무에서는 두 방식을 결합한 하이브리드 검색이 단일 방식보다 일관되게 더 나은 성능을 보입니다.

---

## 🔀 Ensemble Retriever란?

Ensemble Retriever는 여러 검색기의 결과를 **RRF(Reciprocal Rank Fusion)** 알고리즘으로 병합하는 LangChain 컴포넌트입니다.

```
쿼리
 ├─ BM25Retriever  → [문서A(1위), 문서C(2위), 문서E(3위), ...]
 └─ FAISSRetriever → [문서B(1위), 문서A(2위), 문서D(3위), ...]
         ↓
   RRF 재순위화 (weights 적용)
         ↓
   최종 결과: [문서A, 문서B, 문서C, ...]
```

### RRF 알고리즘

RRF(Reciprocal Rank Fusion)는 각 검색기에서 반환된 문서의 **순위**를 기반으로 최종 점수를 계산합니다.

```
RRF 점수 = Σ (weight_i / (rank_i + c))
```

- `rank_i` — 각 검색기에서의 순위 (1부터 시작)
- `weight_i` — 해당 검색기의 가중치
- `c` — 상수 (기본값 60, 높을수록 순위 차이 완화)

순위만 사용하기 때문에 서로 다른 점수 스케일을 가진 검색기를 직접 결합할 수 있다는 것이 핵심 장점입니다.

---

## 🚀 설치

```bash
pip install langchain langchain-community langchain-openai faiss-cpu rank_bm25
```

| 패키지 | 용도 |
|--------|------|
| `langchain` | 코어 프레임워크 |
| `langchain-community` | BM25Retriever, FAISS 등 커뮤니티 컴포넌트 |
| `langchain-openai` | OpenAI 임베딩 |
| `faiss-cpu` | Facebook AI 유사도 검색 (GPU 버전: `faiss-gpu`) |
| `rank_bm25` | BM25 알고리즘 구현체 |

---

## 1️⃣ 기본 예제: BM25 + FAISS 결합

가장 일반적인 조합인 BM25와 FAISS를 사용한 Ensemble Retriever 구성입니다.

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# 샘플 문서
docs = [
    Document(page_content="쿠버네티스(Kubernetes)는 컨테이너 오케스트레이션 플랫폼입니다."),
    Document(page_content="Docker는 컨테이너 기반 가상화 기술로 애플리케이션을 패키징합니다."),
    Document(page_content="Helm은 쿠버네티스 패키지 매니저로 차트를 통해 배포를 관리합니다."),
    Document(page_content="Prometheus는 시계열 데이터베이스 기반의 모니터링 솔루션입니다."),
    Document(page_content="Istio는 서비스 메시로 마이크로서비스 간 통신을 관리합니다."),
]

# BM25 리트리버 (키워드 기반)
bm25_retriever = BM25Retriever.from_documents(docs)
bm25_retriever.k = 3  # 반환할 문서 수

# FAISS 리트리버 (의미 기반)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.from_documents(docs, embeddings)
faiss_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# Ensemble Retriever 구성
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever],
    weights=[0.4, 0.6],  # BM25 40%, FAISS 60%
)

# 검색 실행
results = ensemble_retriever.invoke("쿠버네티스 패키지 관리 도구는?")
for doc in results:
    print(doc.page_content)
```

---

## 2️⃣ 실전 예제: RAG 파이프라인에 통합

문서 로딩부터 LLM 답변 생성까지 전체 RAG 파이프라인에 Ensemble Retriever를 통합합니다.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

# 1. 문서 로딩 및 분할
loader = TextLoader("knowledge_base.txt", encoding="utf-8")
raw_docs = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)
docs = splitter.split_documents(raw_docs)

# 2. BM25 리트리버
bm25_retriever = BM25Retriever.from_documents(docs)
bm25_retriever.k = 5

# 3. FAISS 벡터스토어
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.from_documents(docs, embeddings)
faiss_retriever = vectorstore.as_retriever(
    search_type="mmr",           # 다양성 확보 (Maximum Marginal Relevance)
    search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.7}
)

# 4. Ensemble Retriever
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever],
    weights=[0.3, 0.7],
)

# 5. RAG 체인 구성
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=ensemble_retriever,
    return_source_documents=True,
)

# 6. 질의
response = qa_chain.invoke({"query": "서비스 메시의 역할은 무엇인가요?"})
print(response["result"])
print("\n--- 참조 문서 ---")
for doc in response["source_documents"]:
    print(f"- {doc.page_content[:100]}...")
```

---

## 3️⃣ ChromaDB + BM25 조합

FAISS 대신 ChromaDB를 사용하는 경우입니다. 영구 저장이 필요한 프로덕션 환경에 적합합니다.

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# ChromaDB 벡터스토어 생성
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    docs,
    embeddings,
    collection_name="my_collection",
    persist_directory="./chroma_db",  # 디스크 저장
)
chroma_retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Ensemble 구성
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, chroma_retriever],
    weights=[0.5, 0.5],
)
```

---

## ⚖️ weights 설정 가이드

`weights`는 각 검색기가 최종 순위에 미치는 영향력을 조절합니다. 합계가 반드시 1.0일 필요는 없지만, 상대적 비율로 이해하면 됩니다.

| 상황 | 권장 weights (BM25 : Vector) |
|------|-------------------------------|
| 일반 QA (균형) | `[0.5, 0.5]` |
| 기술 문서, 코드, 전문용어 | `[0.6, 0.4]` — BM25 강화 |
| 고객 상담, 자연어 질문 | `[0.3, 0.7]` — Vector 강화 |
| 뉴스·블로그 등 일반 문서 | `[0.4, 0.6]` — Vector 약간 우세 |
| 법률·의료 전문 도메인 | `[0.7, 0.3]` — 정확한 용어 우선 |

```python
# 세 개의 검색기를 결합할 수도 있습니다
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever, chroma_retriever],
    weights=[0.3, 0.4, 0.3],
)
```

> **Tip**: weights는 도메인과 질의 패턴에 따라 다르므로, 평가 데이터셋으로 실험하여 최적값을 찾는 것이 좋습니다.

---

## 🔄 다른 다중 검색기 전략과 비교

Ensemble Retriever 외에도 LangChain이 제공하는 다중 검색기 전략들이 있습니다.

| 전략 | 설명 | 적합한 경우 |
|------|------|------------|
| **EnsembleRetriever** | 여러 검색기 결과를 RRF로 병합 | 하이브리드 검색의 기본 |
| **MultiQueryRetriever** | 질문을 여러 변형으로 재생성 후 검색 | 모호한 질문, 다각도 검색 |
| **ContextualCompression** | 검색 결과를 LLM으로 압축·필터링 | 불필요한 정보 제거 |
| **ParentDocumentRetriever** | 작은 청크로 검색 후 원본 상위 문서 반환 | 문맥 손실 방지 |
| **SelfQueryRetriever** | LLM이 메타데이터 필터를 자동 생성 | 구조화된 필터 조건 처리 |

### MultiQueryRetriever와 Ensemble 조합

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

# MultiQuery로 질문을 다각도로 확장
multi_query_retriever = MultiQueryRetriever.from_llm(
    retriever=faiss_retriever,
    llm=ChatOpenAI(temperature=0),
)

# MultiQuery + BM25를 Ensemble로 결합
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, multi_query_retriever],
    weights=[0.4, 0.6],
)
```

---

## 🏗️ 프로덕션 고려사항

### 성능 최적화

```python
# FAISS 검색 타입별 특성
faiss_retriever = vectorstore.as_retriever(
    search_type="mmr",           # 다양성 + 관련성 균형
    # search_type="similarity",  # 순수 유사도 (기본값)
    # search_type="similarity_score_threshold",  # 최소 점수 필터
    search_kwargs={
        "k": 5,
        "fetch_k": 20,           # mmr에서 후보 풀 크기
        "lambda_mult": 0.5,      # 0=다양성 최대, 1=유사도 최대
    }
)
```

### 대용량 문서 처리

```python
# BM25 리트리버를 파일에서 직접 로딩 (메모리 효율)
from langchain_community.retrievers import BM25Retriever

# 청크 크기를 고려한 k 설정
bm25_retriever = BM25Retriever.from_documents(
    docs,
    bm25_params={"k1": 1.5, "b": 0.75}  # BM25 하이퍼파라미터 조정
)
bm25_retriever.k = 10
```

### 검색 결과 평가

```python
# 검색 결과 품질 간단 확인
def evaluate_retrieval(retriever, test_queries):
    for query, expected_keyword in test_queries:
        results = retriever.invoke(query)
        hit = any(expected_keyword in doc.page_content for doc in results)
        print(f"{'✅' if hit else '❌'} [{query}] → {len(results)}개 반환")

test_cases = [
    ("쿠버네티스 설치 방법", "Kubernetes"),
    ("컨테이너 패키징", "Docker"),
]
evaluate_retrieval(ensemble_retriever, test_cases)
```

---

## 💡 실무 적용 팁

**BM25 토크나이저 커스터마이징** — 한국어 문서는 기본 토크나이저가 형태소를 고려하지 않아 성능이 떨어질 수 있습니다. `konlpy` 등의 한국어 형태소 분석기를 전처리 단계에 추가하는 것을 권장합니다.

**청크 크기와 k의 균형** — 청크가 작을수록 더 많은 k가 필요합니다. 일반적으로 500~1000자 청크에 k=4~8이 적절합니다.

**중복 문서 처리** — 두 검색기가 같은 문서를 반환하면 EnsembleRetriever가 자동으로 중복을 제거하고 점수를 합산합니다.

**점진적 도입** — 기존 Vector 검색만 사용하던 시스템이라면, `weights=[0.2, 0.8]`처럼 BM25 비중을 낮게 시작하여 점진적으로 조정하세요.

---

## ❓ 자주 묻는 질문

### Q. BM25Retriever와 EnsembleRetriever 중 무엇이 더 나은가요?
단독으로는 우열을 가릴 수 없습니다. BM25는 키워드 일치에 강하고, Vector는 의미 이해에 강합니다. 대부분의 실무 RAG에서는 두 방식을 결합한 Ensemble이 단일 방식보다 일관되게 좋은 성능을 보입니다.

### Q. weights 합이 반드시 1.0이어야 하나요?
아닙니다. `[0.4, 0.6]`이든 `[2, 3]`이든 상대적 비율만 중요합니다. 내부적으로 정규화됩니다.

### Q. `rank_bm25` 패키지 없이 BM25Retriever를 쓸 수 있나요?
없습니다. `BM25Retriever`는 내부적으로 `rank_bm25`를 의존합니다. `pip install rank_bm25`가 필수입니다.

### Q. RRF의 `c` 파라미터는 어떻게 조정하나요?
현재 LangChain의 `EnsembleRetriever`는 `c` 파라미터를 직접 노출하지 않습니다. 기본값 60이 대부분의 경우 적합하며, 커스터마이징이 필요하다면 소스를 상속하여 오버라이드할 수 있습니다.

### Q. 한국어 문서에서 BM25 성능이 낮습니다.
한국어는 형태소 분석 없이 어절 단위로 분리되면 검색 정확도가 낮습니다. `konlpy`의 `Okt`나 `Mecab`으로 형태소 분석 후 토큰을 직접 BM25에 전달하면 성능이 향상됩니다.

---

## 📚 참고

- [LangChain 공식 문서 - Ensemble Retriever](https://python.langchain.com/docs/how_to/ensemble_retriever/)