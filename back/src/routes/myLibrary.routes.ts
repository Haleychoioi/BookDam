// src/routes/myLibrary.routes.ts

import { Router } from "express"; // Router 임포트 확인
import myLibraryController from "../controllers/myLibrary.controller";
import authenticate from "../middleware/authenticate-middleware";
// tasteAnalysisController 관련 임포트는 이 파일에서 완전히 제거됩니다.

const router = Router(); // Express 라우터 인스턴스 생성

// 서재에 없으면 추가, 있으면 상태변경 (POST /api/mypage/my-library)
router.post("/", authenticate, myLibraryController.upsertBookInLibrary);

// 서재 목록 보기 (GET /api/mypage/my-library)
router.get("/", authenticate, myLibraryController.getBooksInLibrary);

// 서재에 잘못추가된 도서 삭제 (DELETE /api/mypage/my-library/:isbn13)
router.delete(
  "/:isbn13",
  authenticate,
  myLibraryController.deleteBookFromLibrary
);

export default router;
