'use client';

import { useState, useCallback } from 'react';
import { sendMessage, ChatResponse } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'success' | 'blocked' | 'off_topic' | 'error';
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! 학습 도우미 챗봇입니다. 공부하다가 궁금한 점이 있으면 질문해주세요!',
      status: 'success',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendMessage(content.trim());

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response || response.reason || '응답을 받지 못했습니다.',
        status: response.status,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '오류가 발생했습니다. 다시 시도해주세요.',
        status: 'error',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! 학습 도우미 챗봇입니다. 공부하다가 궁금한 점이 있으면 질문해주세요!',
        status: 'success',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    send,
    clearMessages,
  };
}
