// routes/book.routes.ts
import express from 'express';
import { bookController } from '../controllers/book.controller';
// import { authenticate } from '../middlewares/authenticate'; 
//const authenticate = (req: any, res: any, next: any) => next(); // 임시

const router = express.Router();


// 도서 검색(aladin-api.service)
router.get('/search', bookController.searchBooks);




// 도서 리스트(aladin-api.service)
// 베스트셀러
router.get('/bestsellers', bookController.getBestSellers);

// 신간
router.get('/newBooks', bookController.getNewBooks);

// 신간 스페셜
router.get('/specialNewBooks', bookController.getSpecialNewBooks);

// 도서 전체 리스트
router.get('/allBooks', bookController.getAllBooks);


// 도서 조회(book.service)
router.get('/detail/:itemId', bookController.getBookDetail);



export default router;