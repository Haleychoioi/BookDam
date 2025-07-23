import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 댓글 관리 라우트 (특정 댓글 수정/삭제)
router.put("/:id", authMiddleware, commentController.updateComment); // 댓글 수정 (인증 및 본인 확인 필요)
router.delete("/:id", authMiddleware, commentController.deleteComment); // 댓글 삭제 (인증 및 본인 확인 필요)

export default router;
