'use client';

import { useChat } from '@/hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  const { messages, isLoading, send, clearMessages } = useChat();

  return (
    <div className="w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">학습 도우미 챗봇</h1>
          <p className="text-blue-100 text-sm">공부하다 궁금한 점을 물어보세요</p>
        </div>
        <button
          onClick={clearMessages}
          className="text-blue-100 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
        >
          대화 초기화
        </button>
      </div>

      {/* 메시지 영역 */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* 입력 영역 */}
      <MessageInput onSend={send} isLoading={isLoading} />
    </div>
  );
}
