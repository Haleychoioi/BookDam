// src/routes/comments.routes.ts

import { Router } from "express";
import { CommentController } from "../controllers/comments.controller";

const commentController = new CommentController();

// 1. 게시물에 종속된 댓글 (조회 및 생성) 라우터
// 이 라우터는 /posts/:postId/comments 경로를 처리합니다.
const postCommentsRouter = Router();
postCommentsRouter.get(
  "/:postId/comments",
  commentController.getCommentsByPost
);
postCommentsRouter.post("/:postId/comments", commentController.createComment);

// 2. 개별 댓글 (수정 및 삭제) 라우터
// 이 라우터는 /comments/:id 경로를 처리합니다.
const standaloneCommentsRouter = Router();
standaloneCommentsRouter.put("/:id", commentController.updateComment);
standaloneCommentsRouter.delete("/:id", commentController.deleteComment);

// 두 개의 라우터를 익스포트합니다.
// export default router; 대신 이렇게 두 라우터를 명시적으로 내보냅니다.
export { postCommentsRouter, standaloneCommentsRouter };
