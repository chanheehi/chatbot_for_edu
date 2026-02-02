import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { config } from '../config/index.js';

// 간단한 인메모리 벡터 스토어 구현
// 추후 ChromaDB나 Pinecone으로 교체 가능
export class VectorStoreManager {
  private embeddings: OpenAIEmbeddings;
  private documents: Document[] = [];
  private vectors: number[][] = [];

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: config.openai.apiKey,
    });
  }

  async initialize(): Promise<void> {
    // 학습 관련 샘플 문서 (추후 실제 학습 자료로 교체)
    const learningDocs = [
      new Document({
        pageContent:
          '피타고라스 정리는 직각삼각형에서 빗변의 제곱은 다른 두 변의 제곱의 합과 같다는 정리입니다. a² + b² = c²',
        metadata: { type: 'learning', subject: 'math', topic: '기하학' },
      }),
      new Document({
        pageContent:
          '광합성은 식물이 빛 에너지를 이용하여 이산화탄소와 물로부터 포도당을 합성하는 과정입니다. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        metadata: { type: 'learning', subject: 'science', topic: '생물' },
      }),
      new Document({
        pageContent:
          '조선은 1392년 이성계가 건국한 한국의 왕조입니다. 약 500년간 지속되었으며, 한글 창제, 유교 문화 발전 등의 업적이 있습니다.',
        metadata: { type: 'learning', subject: 'history', topic: '한국사' },
      }),
    ];

    // 해커스 서비스 관련 문서 (추후 실제 정보로 교체 필요)
    const serviceDocs = [
      new Document({
        pageContent:
          '해커스는 2010년에 설립된 대한민국의 어학 전문 교육 기업입니다. 토익, 토플, 텝스, 아이엘츠 등 다양한 어학 시험 대비 강좌를 제공합니다. 본사는 서울에 위치해 있습니다.',
        metadata: { type: 'service', topic: '회사소개' },
      }),
      new Document({
        pageContent:
          '해커스 토익 강좌는 왕초보부터 고득점까지 다양한 레벨의 학습자를 위한 커리큘럼을 제공합니다. 인강(인터넷 강의)과 학원 수업 모두 제공됩니다. 토익 목표 점수에 따라 맞춤형 강좌를 선택할 수 있습니다.',
        metadata: { type: 'service', topic: '강좌안내' },
      }),
      new Document({
        pageContent:
          '해커스 수강신청은 해커스 공식 홈페이지에서 할 수 있습니다. 회원가입 후 원하는 강좌를 선택하여 결제하면 됩니다. 수강료는 강좌별로 다르며, 패키지 할인 등 다양한 프로모션이 있습니다.',
        metadata: { type: 'service', topic: '수강신청' },
      }),
      new Document({
        pageContent:
          '해커스 환불 정책: 수강 시작 전 전액 환불 가능합니다. 수강 시작 후에는 이용 기간에 따라 차등 환불됩니다. 환불 신청은 고객센터 또는 마이페이지에서 가능합니다.',
        metadata: { type: 'service', topic: '환불정책' },
      }),
      new Document({
        pageContent:
          '해커스 고객센터 연락처: 전화 1588-0000, 이메일 help@hackers.com, 운영시간 평일 09:00-18:00 (주말/공휴일 휴무). 문의사항이 있으시면 언제든지 연락주세요.',
        metadata: { type: 'service', topic: '고객센터' },
      }),
    ];

    await this.addDocuments([...learningDocs, ...serviceDocs]);
    console.log(`📚 벡터스토어 초기화 완료: 학습 문서 ${learningDocs.length}개, 서비스 문서 ${serviceDocs.length}개`);
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map((doc) => doc.pageContent);
    const newVectors = await this.embeddings.embedDocuments(texts);

    this.documents.push(...documents);
    this.vectors.push(...newVectors);
  }

  async search(query: string, k: number = 3): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    const queryVector = await this.embeddings.embedQuery(query);

    // 코사인 유사도 계산
    const similarities = this.vectors.map((vec, idx) => ({
      index: idx,
      similarity: this.cosineSimilarity(queryVector, vec),
    }));

    // 유사도 순으로 정렬하고 상위 k개 반환
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topK = similarities.slice(0, k);

    return topK.map((item) => this.documents[item.index]);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
