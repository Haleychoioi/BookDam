import { Router } from "express";
import { TeamCommentController } from "../controllers/team-comments.controller";
import authenticate from "../middleware/authenticate-middleware";

const teamCommentController = new TeamCommentController();

// 1. 팀 게시물에 종속된 댓글 (조회 및 생성) 라우터
// /team-posts/:teamPostId/comments
const teamPostCommentsRouter = Router();

// GET /team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
teamPostCommentsRouter.get(
  "/:teamPostId/comments",
  authenticate,
  teamCommentController.getTeamCommentsByTeamPost
);

// POST /team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
teamPostCommentsRouter.post(
  "/:teamPostId/comments",
  authenticate,
  teamCommentController.createTeamComment
);

// 2. 개별 팀 댓글 (수정 및 삭제) 라우터
// /team-comments/:id
const standaloneTeamCommentsRouter = Router();

// PUT /team-comments/:id - 특정 팀 댓글 수정
standaloneTeamCommentsRouter.put(
  "/:id",
  authenticate,
  teamCommentController.updateTeamComment
);

// DELETE /team-comments/:id - 특정 팀 댓글 삭제
standaloneTeamCommentsRouter.delete(
  "/:id",
  authenticate,
  teamCommentController.deleteTeamComment
);

export { teamPostCommentsRouter, standaloneTeamCommentsRouter };
