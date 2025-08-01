// src/routes/index.ts

import { Router } from "express";
import communitiesRouter from "./communities.routes";
import postsRouter from "./posts.routes";
import teamPostsRouter from "./team-posts.routes";
// 퍼블릭 댓글 라우터
import {
  postCommentsRouter,
  standaloneCommentsRouter,
} from "./comments.routes";
// 팀 댓글 라우터
import {
  teamPostCommentsRouter,
  standaloneTeamCommentsRouter,
} from "./team-comments.routes";
import applicationsRouter from "./applications.routes";
import booksRouter from "./book.routes";

const router = Router();

// 커뮤니티 관련 라우트: /api/communities
router.use("/communities", communitiesRouter);

// 퍼블릭 게시물 라우트: /api/posts
router.use("/posts", postsRouter);
// 게시물에 종속된 퍼블릭 댓글 라우트: /api/posts/:postId/comments
router.use("/posts", postCommentsRouter);

// 개별 퍼블릭 댓글 수정/삭제 라우트: /api/comments/:id
router.use("/comments", standaloneCommentsRouter);

// 팀 게시물 라우트: /api/team-posts
router.use("/team-posts", teamPostsRouter);
// GET/POST /api/team-posts/:teamPostId/comments
router.use("/team-posts", teamPostCommentsRouter);

// PUT/DELETE /api/team-comments/:id
router.use("/team-comments", standaloneTeamCommentsRouter);

// 마이페이지 커뮤니티 모집 관련 라우트: /api/mypage/communities/recruiting
router.use("/mypage/communities/recruiting", applicationsRouter);

// 도서 관련 라우트: /api/books
router.use("/books", booksRouter);

export default router;
