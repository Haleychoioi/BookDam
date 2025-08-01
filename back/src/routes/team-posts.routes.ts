// src/routes/team-posts.routes.ts

import { Router } from "express";
import { TeamPostController } from "../controllers/team-posts.controller";
import authenticate from "../middleware/authenticate-middleware";

const router = Router();
const teamPostController = new TeamPostController();

// GET /api/team-posts - 팀 게시물 목록 조회
router.get("/", authenticate, teamPostController.getTeamPosts);

// POST /api/team-posts - 새 팀 게시물 생성
router.post("/", authenticate, teamPostController.createTeamPost);

// GET /api/team-posts/:teamPostId - 특정 팀 게시물 상세 조회
router.get("/:teamPostId", authenticate, teamPostController.getTeamPostById);

// PUT /api/team-posts/:teamPostId - 특정 팀 게시물 수정
router.put("/:teamPostId", authenticate, teamPostController.updateTeamPost);

// DELETE /api/team-posts/:teamPostId - 특정 팀 게시물 삭제
router.delete("/:teamPostId", authenticate, teamPostController.deleteTeamPost);

export default router;
