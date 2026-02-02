import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import type { IntentType, ClassificationResult } from '../types/index.js';
import { config } from '../config/index.js';

const CLASSIFICATION_PROMPT = `당신은 사용자 메시지의 의도를 분류하는 분류기입니다.
사용자의 메시지가 "해커스 학습 도우미 챗봇"의 목적에 맞는지 판단해주세요.

분류 기준:
- learning_related: 학습, 공부, 교육, 과목, 문제 풀이, 개념 설명 등 학습과 관련된 질문
- service_related: 해커스, 회사, 서비스, 강좌, 강사, 수강신청, 가격, 환불 등 해커스 서비스 관련 질문
- greeting: 인사말 (안녕, 반가워, 고마워 등)
- off_topic: 학습 및 서비스와 무관한 주제 (일상 대화, 날씨, 연예인 등)
- unclear: 의도를 파악하기 어려운 경우

반드시 다음 중 하나만 응답하세요: learning_related, service_related, greeting, off_topic, unclear

사용자 메시지: {message}

분류 결과:`;

export class IntentClassifier {
  private llm: ChatOpenAI;
  private prompt: ChatPromptTemplate;
  private parser: StringOutputParser;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
      openAIApiKey: config.openai.apiKey,
    });

    this.prompt = ChatPromptTemplate.fromTemplate(CLASSIFICATION_PROMPT);
    this.parser = new StringOutputParser();
  }

  async classify(message: string): Promise<ClassificationResult> {
    const chain = this.prompt.pipe(this.llm).pipe(this.parser);

    const result = await chain.invoke({ message });
    const intent = result.trim().toLowerCase() as IntentType;

    const validIntents: IntentType[] = [
      'learning_related',
      'service_related',
      'greeting',
      'off_topic',
      'unclear',
    ];

    if (!validIntents.includes(intent)) {
      return { intent: 'unclear', confidence: 0.5 };
    }

    return {
      intent,
      confidence: 0.9,
    };
  }
}
