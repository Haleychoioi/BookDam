import { Router } from "express";
import { CommentController } from "../controllers/comments.controller";
import authenticate from "../middleware/authenticate-middleware";

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
  authenticate,
  commentController.createComment
);

// 2. 개별 댓글 (조회, 수정 및 삭제) 라우터
const standaloneCommentsRouter = Router();

// GET /comments/:id - 특정 댓글 상세 조회
standaloneCommentsRouter.get("/:id", commentController.getCommentById);

// PUT /comments/:id - 특정 댓글 수정
standaloneCommentsRouter.put(
  "/:id",
  authenticate,
  commentController.updateComment
);

// DELETE /comments/:id - 특정 댓글 삭제
standaloneCommentsRouter.delete(
  "/:id",
  authenticate,
  commentController.deleteComment
);

export { postCommentsRouter, standaloneCommentsRouter };
