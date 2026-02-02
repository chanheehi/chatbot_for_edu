import { ProfanityFilter } from './filter.js';
import { IntentClassifier } from './classifier.js';
import { RAGResponder } from './responder.js';
import type { ChatResponse } from '../types/index.js';

export class MessageProcessor {
  private filter: ProfanityFilter;
  private classifier: IntentClassifier;
  private responder: RAGResponder;
  private isInitialized: boolean = false;

  constructor() {
    this.filter = new ProfanityFilter();
    this.classifier = new IntentClassifier();
    this.responder = new RAGResponder();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.responder.initialize();
    this.isInitialized = true;
  }

  async process(message: string): Promise<ChatResponse> {
    console.log('\n========== 메시지 처리 시작 ==========');
    console.log(`📩 입력 메시지: "${message}"`);

    // 1단계: 불용어/욕설 필터링
    console.log('\n[1단계] 불용어/욕설 필터링...');
    const filterResult = this.filter.isClean(message);
    console.log(`  ✓ 필터 결과: ${filterResult.isClean ? '통과 ✅' : '차단 ❌'}`);
    if (filterResult.matchedWords) {
      console.log(`  ✓ 감지된 단어: ${filterResult.matchedWords.join(', ')}`);
    }

    if (!filterResult.isClean) {
      console.log('========== 처리 완료 (1단계에서 차단) ==========\n');
      return {
        status: 'blocked',
        reason: `부적절한 표현이 포함되어 있습니다.`,
      };
    }

    // 2단계: 의도 분류
    console.log('\n[2단계] 의도 분류 (LLM)...');
    const classification = await this.classifier.classify(message);
    console.log(`  ✓ 분류 결과: ${classification.intent}`);
    console.log(`  ✓ 신뢰도: ${(classification.confidence * 100).toFixed(0)}%`);

    switch (classification.intent) {
      case 'greeting':
        console.log('========== 처리 완료 (인사 응답) ==========\n');
        return {
          status: 'success',
          response:
            '안녕하세요! 학습 도우미 챗봇입니다. 궁금한 점이 있으면 질문해주세요!',
        };

      case 'off_topic':
        console.log('========== 처리 완료 (2단계에서 off_topic 판정) ==========\n');
        return {
          status: 'off_topic',
          reason:
            '죄송합니다. 저는 학습 관련 질문에만 답변할 수 있어요. 공부하다가 궁금한 점이 있으면 질문해주세요!',
        };

      case 'unclear':
        console.log('========== 처리 완료 (2단계에서 unclear 판정) ==========\n');
        return {
          status: 'off_topic',
          reason:
            '질문을 잘 이해하지 못했어요. 좀 더 구체적으로 질문해주시겠어요?',
        };

      case 'learning_related':
      case 'service_related':
        // 3단계: RAG 기반 응답 생성
        console.log(`\n[3단계] RAG 응답 생성 (${classification.intent})...`);
        await this.initialize();
        const response = await this.responder.generate(message);
        console.log(`  ✓ 응답 생성 완료 (${response.length}자)`);
        console.log('========== 처리 완료 (RAG 응답) ==========\n');
        return {
          status: 'success',
          response,
        };

      default:
        console.log('========== 처리 완료 (알 수 없는 의도) ==========\n');
        return {
          status: 'off_topic',
          reason: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
        };
    }
  }
}
