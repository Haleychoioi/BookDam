// routes/book.routes.ts
import express from 'express';
import { bookController } from '../controllers/book.controller';
// import { authenticate } from '../middlewares/authenticate'; // 실제 경로에 맞게 수정
const authenticate = (req: any, res: any, next: any) => next(); // 임시 미들웨어

const router = express.Router();

// ===== 공개 API (인증 불필요) =====

// 테스트용
router.get('/test', (req, res) => {
  res.json({ message: 'Book 라우트' });
});


// 도서 검색
router.get('/search', bookController.searchBooks);



export default router;