// src/routes/team-comments.routes.ts

import { Router } from "express";
import { TeamCommentController } from "../controllers/team-comments.controller";
import authenticate from "../middleware/authenticate-middleware"; // authenticate 미들웨어 import

const teamCommentController = new TeamCommentController();

// 1. 팀 게시물에 종속된 댓글 (조회 및 생성) 라우터
// 이 라우터는 /team-posts/:teamPostId/comments 경로를 처리합니다.
// (메인 app.ts에서 app.use("/team-posts", teamPostCommentsRouter)와 같이 마운트될 것으로 예상)
const teamPostCommentsRouter = Router();

// GET /team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
// 팀 게시물 댓글 조회는 팀 멤버만 가능하므로 authenticate 미들웨어를 추가합니다.
teamPostCommentsRouter.get(
  "/:teamPostId/comments",
  authenticate, // 인증 미들웨어 추가
  teamCommentController.getTeamCommentsByTeamPost
);

// POST /team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
// 팀 댓글 작성은 사용자 인증이 필수적이므로 authenticate 미들웨어를 추가합니다.
teamPostCommentsRouter.post(
  "/:teamPostId/comments",
  authenticate, // 인증 미들웨어 추가
  teamCommentController.createTeamComment
);

// 2. 개별 팀 댓글 (수정 및 삭제) 라우터
// 이 라우터는 /team-comments/:id 경로를 처리합니다.
// (메인 app.ts에서 app.use("/team-comments", standaloneTeamCommentsRouter)와 같이 마운트될 것으로 예상)
const standaloneTeamCommentsRouter = Router();

// PUT /team-comments/:id - 특정 팀 댓글 수정
// 팀 댓글 수정은 사용자 인증이 필수적이므로 authenticate 미들웨어를 추가합니다.
standaloneTeamCommentsRouter.put(
  "/:id",
  authenticate, // 인증 미들웨어 추가
  teamCommentController.updateTeamComment
);

// DELETE /team-comments/:id - 특정 팀 댓글 삭제
// 팀 댓글 삭제는 사용자 인증이 필수적이므로 authenticate 미들웨어를 추가합니다.
standaloneTeamCommentsRouter.delete(
  "/:id",
  authenticate, // 인증 미들웨어 추가
  teamCommentController.deleteTeamComment
);

// 두 개의 라우터를 익스포트합니다.
export { teamPostCommentsRouter, standaloneTeamCommentsRouter };
