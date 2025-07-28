// src/routes/team-comments.routes.ts

import { Router } from "express";
import { TeamCommentController } from "../controllers/team-comments.controller";

const teamCommentController = new TeamCommentController();

// 1. 팀 게시물에 종속된 댓글 (조회 및 생성) 라우터
// 이 라우터는 /team-posts/:teamPostId/comments 경로를 처리합니다.
const teamPostCommentsRouter = Router();
teamPostCommentsRouter.get(
  "/:teamPostId/comments",
  teamCommentController.getTeamCommentsByTeamPost
);
teamPostCommentsRouter.post(
  "/:teamPostId/comments",
  teamCommentController.createTeamComment
);

// 2. 개별 팀 댓글 (수정 및 삭제) 라우터
// 이 라우터는 /team-comments/:id 경로를 처리합니다.
const standaloneTeamCommentsRouter = Router();
standaloneTeamCommentsRouter.put(
  "/:id",
  teamCommentController.updateTeamComment
);
standaloneTeamCommentsRouter.delete(
  "/:id",
  teamCommentController.deleteTeamComment
);

// 두 개의 라우터를 익스포트합니다.
export { teamPostCommentsRouter, standaloneTeamCommentsRouter };
