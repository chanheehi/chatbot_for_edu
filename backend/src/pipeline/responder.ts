import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { config } from '../config/index.js';
import { VectorStoreManager } from '../rag/vectorstore.js';

const RAG_PROMPT = `당신은 학습을 도와주는 친절한 AI 튜터입니다.
주어진 컨텍스트를 참고하여 학생의 질문에 정확하고 이해하기 쉽게 답변해주세요.

컨텍스트:
{context}

학생의 질문: {question}

답변 지침:
1. 학생 수준에 맞게 쉽게 설명해주세요
2. 필요하다면 예시를 들어 설명해주세요
3. 컨텍스트에 없는 내용이라도 일반적인 지식으로 답변 가능합니다
4. 모르는 내용은 솔직하게 모른다고 말해주세요

답변:`;

export class RAGResponder {
  private llm: ChatOpenAI;
  private prompt: ChatPromptTemplate;
  private vectorStore: VectorStoreManager;
  private isInitialized: boolean = false;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: config.openai.apiKey,
    });

    this.prompt = ChatPromptTemplate.fromTemplate(RAG_PROMPT);
    this.vectorStore = new VectorStoreManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.vectorStore.initialize();
    this.isInitialized = true;
  }

  async generate(question: string): Promise<string> {
    await this.initialize();

    // 벡터 스토어에서 관련 문서 검색
    const relevantDocs = await this.vectorStore.search(question, 3);
    const context = relevantDocs.map((doc) => doc.pageContent).join('\n\n');

    // RAG 체인 실행
    const chain = RunnableSequence.from([
      {
        context: () => context || '관련 문서가 없습니다.',
        question: new RunnablePassthrough(),
      },
      this.prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke(question);
    return response;
  }

  async generateWithoutRAG(question: string): Promise<string> {
    const simplePrompt = ChatPromptTemplate.fromTemplate(
      `당신은 학습을 도와주는 친절한 AI 튜터입니다.
학생의 질문에 정확하고 이해하기 쉽게 답변해주세요.

학생의 질문: {question}

답변:`
    );

    const chain = simplePrompt
      .pipe(this.llm)
      .pipe(new StringOutputParser());

    return await chain.invoke({ question });
  }
}
