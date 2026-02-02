const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ChatResponse {
  status: 'success' | 'blocked' | 'off_topic' | 'error';
  response?: string;
  reason?: string;
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'error',
        reason: errorData.reason || '서버 오류가 발생했습니다.',
      };
    }

    return await response.json();
  } catch (error) {
    return {
      status: 'error',
      reason: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
