// routes/book.routes.ts
import express from 'express';
import { bookController } from '../controllers/book.controller';
// import { authenticate } from '../middlewares/authenticate'; 
//const authenticate = (req: any, res: any, next: any) => next(); // 임시

const router = express.Router();

// ===== 공개 API (인증 불필요) =====

// 테스트용
router.get('/test', (req, res) => {
  res.json({ message: 'Book 라우트' });
});


// 도서 검색(aladin-api.service)
router.get('/search', bookController.searchBooks);
// 도서 리스트(aladin-api.service)

// 도서 조회(book.service)



export default router;