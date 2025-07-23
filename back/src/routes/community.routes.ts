import { Router } from "express";
import { communityController } from "../controllers/community.controller";
import { teamPostController } from "../controllers/teamPost.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 퍼블릭 커뮤니티 목록 (모집글 기반)
router.get("/", communityController.getPublicCommunities);

// 특정 도서 기반 커뮤니티 목록 조회
router.get("/books/:bookId", communityController.getCommunitiesByBook); // API 명세 '/books/:id/communities'와 다름. '/communities/books/:bookId'로 통일성을 맞추거나, 책 라우트에 포함. 현재 구조상 여기가 적절

// 커뮤니티 가입 신청 (특정 모집글에 대한 지원)
// POST /communities/:id/apply -> 여기서 :id는 postId임
router.post(
  "/:postId/apply",
  authMiddleware,
  communityController.applyForCommunity
);

// 도서 기반 커뮤니티 생성 (모집글 + 팀)
router.post("/", authMiddleware, communityController.createTeamCommunity);

// 특정 커뮤니티 (팀) 내부 게시물 목록 조회
router.get("/:teamId/posts", authMiddleware, teamPostController.getTeamPosts);

// 특정 커뮤니티 (팀) 내부 게시물 작성
router.post(
  "/:teamId/posts",
  authMiddleware,
  teamPostController.createTeamPost
);

export default router;
