import { Router } from "express";
import { teamPostController } from "../controllers/teamPost.controller";
import { teamCommentController } from "../controllers/teamComment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 팀 내부 게시물 개별 관리 라우트
router.get("/:id", authMiddleware, teamPostController.getTeamPostById); // 특정 팀 게시물 상세 조회 (인증 필요)
router.put("/:id", authMiddleware, teamPostController.updateTeamPost); // 특정 팀 게시물 수정 (인증 및 본인/팀장 확인 필요)
router.delete("/:id", authMiddleware, teamPostController.deleteTeamPost); // 특정 팀 게시물 삭제 (인증 및 본인/팀장 확인 필요)

// 특정 팀 게시물의 댓글 관련 라우트
// 특정 팀 게시물 댓글 목록 조회 (인증 필요)
router.get(
  "/:teamPostId/comments",
  authMiddleware,
  teamCommentController.getTeamCommentsByTeamPostId
);
// 특정 팀 게시물에 댓글 작성 (인증 필요)
router.post(
  "/:teamPostId/comments",
  authMiddleware,
  teamCommentController.createTeamComment
);

export default router;
