// src/routes/team-posts.routes.ts

import { Router } from "express";
import { TeamPostController } from "../controllers/team-posts.controller"; // TeamPostController를 import합니다.

const router = Router();
const teamPostController = new TeamPostController();

// API 명세서 기반 라우트 정의

// GET /api/team-posts - 팀 게시물 목록 조회 (커뮤니티 ID는 쿼리 파라미터 또는 바디로 전달될 수 있음)
router.get("/", teamPostController.getTeamPosts);

// POST /api/team-posts - 새 팀 게시물 생성 (커뮤니티 ID는 바디로 전달)
router.post("/", teamPostController.createTeamPost);

// GET /api/team-posts/:teamPostId - 특정 팀 게시물 상세 조회
router.get("/:teamPostId", teamPostController.getTeamPostById);

// PUT /api/team-posts/:teamPostId - 특정 팀 게시물 수정
router.put("/:teamPostId", teamPostController.updateTeamPost);

// DELETE /api/team-posts/:teamPostId - 특정 팀 게시물 삭제
router.delete("/:teamPostId", teamPostController.deleteTeamPost);

// --- 팀 게시물 댓글 관련 라우트 ---
// POST /api/team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
router.post(
  "/:teamPostId/comments", // 이 경로가 Postman 요청과 일치해야 합니다.
  teamPostController.createComment
);

// GET /api/team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
router.get("/:teamPostId/comments", teamPostController.getCommentsByTeamPostId);

// PUT /api/team-posts/:teamPostId/comments/:commentId - 특정 댓글 수정
router.put(
  "/:teamPostId/comments/:commentId",
  teamPostController.updateComment
);

// DELETE /api/team-posts/:teamPostId/comments/:commentId - 특정 댓글 삭제
router.delete(
  "/:teamPostId/comments/:commentId",
  teamPostController.deleteComment
);

export default router;
