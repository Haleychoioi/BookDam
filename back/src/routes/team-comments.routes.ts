// src/routes/team-comments.routes.ts

import { Router } from "express";
import { TeamCommentController } from "../controllers/team-comments.controller"; // TeamCommentController를 import합니다.

const router = Router();
const teamCommentController = new TeamCommentController();

// API 명세서 기반 라우트 정의 (예시)
// GET /team-posts/:id/comments - 특정 팀 게시물의 댓글 목록 조회 (경로 조정 필요 시 변경)
router.get(
  "/:teamPostId/comments",
  teamCommentController.getTeamCommentsByTeamPost
);
// POST /team-posts/:id/comments - 특정 팀 게시물에 댓글 작성 (경로 조정 필요 시 변경)
router.post("/:teamPostId/comments", teamCommentController.createTeamComment);
// PUT /team-comments/:id - 특정 팀 댓글 수정
router.put("/:id", teamCommentController.updateTeamComment);
// DELETE /team-comments/:id - 특정 팀 댓글 삭제
router.delete("/:id", teamCommentController.deleteTeamComment);

export default router;
