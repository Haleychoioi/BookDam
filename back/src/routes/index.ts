// src/routes/index.ts

import { Router } from "express";

// 각 라우트 파일을 import합니다.
import communitiesRouter from "./communities.routes";
import postsRouter from "./posts.routes";
import teamPostsRouter from "./team-posts.routes";
import commentsRouter from "./comments.routes";
import teamCommentsRouter from "./team-comments.routes";
import applicationsRouter from "./applications.routes"; // applications.routes 임포트
import booksRouter from "./book.routes";

const router = Router();

// 각 라우터를 기본 경로에 연결합니다.
router.use("/communities", communitiesRouter);
router.use("/posts", postsRouter);
router.use("/team-posts", teamPostsRouter); // 팀 게시물 라우트
router.use("/comments", commentsRouter);
router.use("/team-comments", teamCommentsRouter); // 수정: "/team-posts"에서 "/team-comments"로 변경하여 중복 방지
// applicationsRouter를 올바른 경로에 연결합니다.
// GET /api/mypage/communities/recruiting/:communityId/applicants 경로를 처리하기 위함입니다.
router.use("/mypage/communities/recruiting", applicationsRouter);
router.use("/books", booksRouter);

export default router;
