import { Router } from "express";
import myLibraryController from "../controllers/myLibrary.controller";
import authenticate from "../middleware/authenticate-middleware";

const router = Router();

// 서재에 없으면 추가, 있으면 상태변경
router.post("/", authenticate, myLibraryController.upsertBookInLibrary);

// 서재 목록 보기
router.get("/", authenticate, myLibraryController.getBooksInLibrary);

// 서재에 잘못추가된 도서 삭제
router.delete(
  "/:isbn13",
  authenticate,
  myLibraryController.deleteBookFromLibrary
);

export default router;
