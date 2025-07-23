import { Router } from "express";
import { teamCommentController } from "../controllers/teamComment.controller"; // 팀 댓글 컨트롤러
import { authMiddleware } from "../middlewares/auth.middleware"; // 인증 미들웨어

const router = Router();

// 팀 댓글 개별 관리 라우트 (수정/삭제)
router.put("/:id", authMiddleware, teamCommentController.updateTeamComment); // 특정 팀 댓글 수정 (인증 및 본인 확인 필요)
router.delete("/:id", authMiddleware, teamCommentController.deleteTeamComment); // 특정 팀 댓글 삭제 (인증 및 본인 확인 필요)

export default router;
