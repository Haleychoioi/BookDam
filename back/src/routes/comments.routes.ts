// src/routes/comments.routes.ts

import { Router } from "express";
import { CommentController } from "../controllers/comments.controller";
import authenticate from "../middleware/authenticate-middleware"; // authenticate 미들웨어 import

const commentController = new CommentController();

// 1. 게시물에 종속된 댓글 (조회 및 생성) 라우터
const postCommentsRouter = Router();

// GET /posts/:postId/comments - 특정 게시물의 댓글 목록 조회
postCommentsRouter.get(
  "/:postId/comments",
  commentController.getCommentsByPost
);

// POST /posts/:postId/comments - 특정 게시물에 댓글 작성
postCommentsRouter.post(
  "/:postId/comments",
  authenticate, // 인증 미들웨어 추가
  commentController.createComment
);

// 2. 개별 댓글 (조회, 수정 및 삭제) 라우터
const standaloneCommentsRouter = Router();

// GET /comments/:id - 특정 댓글 상세 조회 (새로 추가)
// 댓글 상세 조회는 일반적으로 인증이 필요하지 않으므로 authenticate 미들웨어를 추가하지 않습니다.
standaloneCommentsRouter.get(
  "/:id",
  commentController.getCommentById // 새로 추가된 컨트롤러 메서드
);

// PUT /comments/:id - 특정 댓글 수정
standaloneCommentsRouter.put(
  "/:id",
  authenticate, // 인증 미들웨어 추가
  commentController.updateComment
);

// DELETE /comments/:id - 특정 댓글 삭제
standaloneCommentsRouter.delete(
  "/:id",
  authenticate, // 인증 미들웨어 추가
  commentController.deleteComment
);

// 두 개의 라우터를 익스포트합니다.
export { postCommentsRouter, standaloneCommentsRouter };
