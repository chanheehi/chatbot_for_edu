# RAG 문서 폴더

이 폴더에 학습 자료 및 해커스 서비스 관련 문서를 추가하세요.

## 문서 형식

텍스트 파일(.txt) 또는 마크다운(.md) 형식으로 작성합니다.

## 예시 파일 구조

```
documents/
├── learning/           # 학습 관련 문서
│   ├── math.txt
│   ├── english.txt
│   └── science.txt
│
└── service/            # 해커스 서비스 관련 문서
    ├── company_intro.txt    # 회사 소개
    ├── courses.txt          # 강좌 안내
    ├── pricing.txt          # 가격 정보
    ├── refund_policy.txt    # 환불 정책
    └── faq.txt              # 자주 묻는 질문
```

## 주의사항

- 정확한 정보만 입력하세요 (설립년도, 가격 등)
- 문서가 추가/수정되면 서버를 재시작해야 반영됩니다
- 현재는 vectorstore.ts에 하드코딩된 샘플 데이터를 사용 중입니다
