import { Router } from 'express';
import { MessageProcessor } from '../pipeline/processor.js';
import type { ChatRequest } from '../types/index.js';

const router = Router();
const processor = new MessageProcessor();

router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        reason: '메시지가 필요합니다.',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        reason: '빈 메시지는 처리할 수 없습니다.',
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        status: 'error',
        reason: '메시지가 너무 깁니다. (최대 2000자)',
      });
    }

    const result = await processor.process(message.trim());
    return res.json(result);
  } catch (error) {
    console.error('Chat processing error:', error);
    return res.status(500).json({
      status: 'error',
      reason: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
});

// 헬스체크 엔드포인트
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
