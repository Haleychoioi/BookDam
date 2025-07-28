// src/routes/index.ts

import { Router } from "express";

// 각 라우트 파일을 import합니다.
import communitiesRouter from "./communities.routes";
import postsRouter from "./posts.routes";
import teamPostsRouter from "./team-posts.routes";
// 퍼블릭 댓글 라우터 (이전 대화에서 수정 완료)
import {
  postCommentsRouter,
  standaloneCommentsRouter,
} from "./comments.routes";
// 팀 댓글 라우터 (분리된 두 라우터를 임포트합니다.)
import {
  teamPostCommentsRouter,
  standaloneTeamCommentsRouter,
} from "./team-comments.routes";
import applicationsRouter from "./applications.routes";
import booksRouter from "./book.routes";

const router = Router();

// 각 라우터를 기본 경로에 연결합니다.

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
// 중요: 팀 게시물에 종속된 댓글 라우트를 /team-posts 경로 아래에 연결합니다.
// 이렇게 해야 GET/POST /api/team-posts/:teamPostId/comments 경로가 올바르게 매핑됩니다.
router.use("/team-posts", teamPostCommentsRouter); // teamPostCommentsRouter 연결

// 중요: 개별 팀 댓글 수정/삭제 라우트를 /team-comments 경로 아래에 직접 연결합니다.
// 이렇게 해야 PUT/DELETE /api/team-comments/:id 경로가 올바르게 매핑됩니다.
router.use("/team-comments", standaloneTeamCommentsRouter); // standaloneTeamCommentsRouter 연결

// 마이페이지 커뮤니티 모집 관련 라우트: /api/mypage/communities/recruiting
router.use("/mypage/communities/recruiting", applicationsRouter);

// 도서 관련 라우트: /api/books
router.use("/books", booksRouter);

export default router;
