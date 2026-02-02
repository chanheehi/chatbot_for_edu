export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  status: 'success' | 'blocked' | 'off_topic';
  response?: string;
  reason?: string;
}

export type IntentType =
  | 'learning_related'
  | 'service_related'
  | 'greeting'
  | 'off_topic'
  | 'unclear';

export interface FilterResult {
  isClean: boolean;
  matchedWords?: string[];
}

export interface ClassificationResult {
  intent: IntentType;
  confidence: number;
}
