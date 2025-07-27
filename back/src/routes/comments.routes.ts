// src/routes/comments.routes.ts

import { Router } from "express";
import { CommentController } from "../controllers/comments.controller"; // CommentController를 import합니다.

const router = Router();
const commentController = new CommentController();

// API 명세서 기반 라우트 정의 (예시)
// GET /posts/:id/comments - 특정 게시물의 댓글 목록 조회
router.get("/:postId/comments", commentController.getCommentsByPost);
// POST /posts/:id/comments - 특정 게시물에 댓글 작성
router.post("/:postId/comments", commentController.createComment);
// PUT /comments/:id - 특정 댓글 수정
router.put("/:id", commentController.updateComment);
// DELETE /comments/:id - 특정 댓글 삭제
router.delete("/:id", commentController.deleteComment);

export default router;
