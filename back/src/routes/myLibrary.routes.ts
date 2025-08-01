import express from 'express';
import myLibraryController from "../controllers/myLibrary.controller";
import authenticate from '../middleware/authenticate-middleware'
import tasteAnalysisController from '../controllers/tasteAnalysis.controller';

const router = express.Router();

// 내 서재 읽은책의 평점으로 선호도 통계 데이터
// router.get("/taste-analysis", authenticate, tasteAnalysisController.getTasteAnalysis);


// 서재에 없으면 추가, 있으면 상태변경
router.post('/', authenticate, myLibraryController.upsertBookInLibrary);

// 서재 목록 보기
router.get("/", authenticate, myLibraryController.getBooksInLibrary);

// 서재에 잘못추가된 도서 삭제
router.delete("/:isbn13", authenticate, myLibraryController.deleteBookFromLibrary);


export default router;