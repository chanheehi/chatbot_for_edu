'use client';

import type { Message as MessageType } from '@/hooks/useChat';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  const getStatusStyle = () => {
    switch (message.status) {
      case 'blocked':
        return 'bg-red-50 border border-red-200';
      case 'off_topic':
        return 'bg-yellow-50 border border-yellow-200';
      case 'error':
        return 'bg-red-50 border border-red-200';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 아바타 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
          isUser ? 'bg-gray-600' : 'bg-blue-600'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* 메시지 버블 */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : `${getStatusStyle()} text-gray-800 rounded-tl-none`
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
