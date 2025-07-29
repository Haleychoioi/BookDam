// src/routes/team-posts.routes.ts

import { Router } from "express";
import { TeamPostController } from "../controllers/team-posts.controller"; // TeamPostController를 import합니다.
// authenticate 미들웨어를 import합니다.
import authenticate from "../middleware/authenticate-middleware";

const router = Router();
const teamPostController = new TeamPostController();

// API 명세서 기반 라우트 정의

// GET /api/team-posts - 팀 게시물 목록 조회
// 인증된 사용자만 접근 가능
router.get("/", authenticate, teamPostController.getTeamPosts);

// POST /api/team-posts - 새 팀 게시물 생성
// 인증된 사용자만 접근 가능
router.post("/", authenticate, teamPostController.createTeamPost);

// GET /api/team-posts/:teamPostId - 특정 팀 게시물 상세 조회
// 인증된 사용자만 접근 가능
router.get("/:teamPostId", authenticate, teamPostController.getTeamPostById);

// PUT /api/team-posts/:teamPostId - 특정 팀 게시물 수정
// 인증된 사용자만 접근 가능
router.put("/:teamPostId", authenticate, teamPostController.updateTeamPost);

// DELETE /api/team-posts/:teamPostId - 특정 팀 게시물 삭제
// 인증된 사용자만 접근 가능
router.delete("/:teamPostId", authenticate, teamPostController.deleteTeamPost);

// --- 팀 게시물 댓글 관련 라우트 ---
// 이 라우트들은 team-comments.controller.ts에서 처리되어야 하며,
// team-posts.controller.ts에서는 더 이상 존재하지 않으므로 제거합니다.
// router.post("/:teamPostId/comments", teamPostController.createComment);
// router.get("/:teamPostId/comments", teamPostController.getCommentsByTeamPostId);
// router.put("/:teamPostId/comments/:commentId", teamPostController.updateComment);
// router.delete("/:teamPostId/comments/:commentId", teamPostController.deleteComment);

export default router;
