# 참고 자료

## 주제
프롬프트 (Prompt): AI에게 내리는 '지시문'이나 '질문'. AI의 답변 수준을 결정하는 가장 중요한 요소입니다.
제로샷 (Zero-shot): AI에게 사전 예시(Sample) 없이 단도직입적으로 명령을 내려 답을 얻는 방식. (예: "번역해 줘")
퓨샷 (Few-shot): AI에게 예시(맥락과 답)를 몇 가지 보여준 뒤 질문하여, 원하는 형식이나 톤앤매너를 유도하는 방식.

1. 프롬프트 작성 꿀팁 (프롬프트 엔지니어링)
명확한 역할 부여: "너는 지금부터 최고의 마케터야"처럼 페르소나 지정.
구체적인 조건 제시: 출력 형식(표, 불릿릿), 길이, 어조(전문적인, 친근한) 명시.
단계별 지시 (Chain-of-Thought): 복잡한 문제는 "생각을 먼저 하고 순서대로 답해줘"라고 요청.

2. 제로샷 프롬프트 (Zero-Shot)
장점: 빠르고 간편함. 직관적인 질문에 적합.
단점: AI가 의도를 오해할 확률이 높고, 원하는 형식의 답변을 얻기 어려움.
예시: "이메일 초안 작성해 줘."

3. 퓨샷 프롬프트 (Few-Shot)
장점: 제로샷보다 훨씬 정확하고 일관된 결과 도출.
단점: 예시를 작성하느라 프롬프트가 길어지고 시간이 듦.
예시: [질문: 사과 -> 대답: 빨갛고 맛있는 과일] 패턴을 2~3개 준 뒤, [질문: 바나나 -> 대답: ?]을 유도.

## 참고 블로그 URL
- https://finns-know-how.tistory.com/entry/2-CoT-with-ZeroOneFew-Shot
- https://analytics4everything.tistory.com/280
- https://blogger9403.tistory.com/49
- https://levilabs.gitbook.io/openai/5.1
- https://younhaxyz.tistory.com/33
- https://drfirst.tistory.com/entry/few-show%EA%B3%BC-zero-shot-%EA%B7%B8%EB%A6%AC%EA%B3%A0-CoT-feat-%EC%84%B1%ED%82%B4%EB%8B%98-%EA%B0%95%EC%9D%98
- https://rimiyeyo.tistory.com/entry/%EB%8B%A4%EC%96%91%ED%95%9C-%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EC%97%94%EC%A7%80%EB%8B%88%EC%96%B4%EB%A7%81Prompt-Engineering%EC%97%90-%EB%8C%80%ED%95%B4-%EC%82%B4%ED%8E%B4%EB%B3%B4%EC%9E%901-Zero-shot-One-shot-Few-shot-CoT
- https://rimiyeyo.tistory.com/entry/LLM%EC%9D%98-%ED%95%9C%EA%B3%84%EC%9D%B8-Clarity%EB%AA%85%ED%99%95%EC%84%B1%EA%B3%BC-Consistency%EC%9D%BC%EA%B4%80%EC%84%B1%EC%9D%84-%EC%A4%84%EC%97%AC%EB%B3%B4%EB%8A%94-prompt-engineering%EA%B8%B0%EB%B2%95
- https://wikidocs.net/338399
- https://blog.kakaocloud.com/213
- https://wikidocs.net/325360
- https://cartinoe5930.tistory.com/entry/Zero-shot-One-shot-Few-shot-Learning%EC%9D%B4-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C
- https://velog.io/@nomaday/n-shot-learning
- https://feccle.tistory.com/492
- https://www.ultralytics.com/ko/blog/understanding-few-shot-zero-shot-and-transfer-learning
- https://blog.kakaocloud.com/86