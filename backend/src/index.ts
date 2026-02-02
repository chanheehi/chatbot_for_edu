import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import chatRouter from './routes/chat.js';

// 환경변수 검증
validateConfig();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/chat', chatRouter);

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    name: '학습 도우미 챗봇 API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/chat/health',
    },
  });
});

// 서버 시작
app.listen(config.server.port, () => {
  console.log(`🚀 서버가 포트 ${config.server.port}에서 실행 중입니다.`);
  console.log(`📍 http://localhost:${config.server.port}`);
});
