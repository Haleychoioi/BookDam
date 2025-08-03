// // src/routes/communities.routes.ts

// import { Router } from "express";
// import { CommunityController } from "../controllers/communities.controller";
// import { TeamPostController } from "../controllers/team-posts.controller";
// import { ApplicationController } from "../controllers/applications.controller";
// import authenticate from "../middleware/authenticate-middleware";

// const router = Router();
// const communityController = new CommunityController();
// const teamPostController = new TeamPostController();
// const applicationController = new ApplicationController();

// // GET /communities - 커뮤니티 목록 조회
// router.get("/", communityController.getCommunities);

// // POST /communities - 도서 기반 커뮤니티 생성 (인증 필요)
// router.post("/", authenticate, communityController.createCommunity);

// // GET /books/:itemId/communities - 특정 도서 관련 커뮤니티 목록 조회
// router.get("/books/:itemId", communityController.getCommunitiesByBook);

// // GET /communities/:communityId - 특정 커뮤니티 상세 조회
// router.get("/:communityId", communityController.getCommunityById);

// // PUT /communities/:communityId - 특정 커뮤니티 상세 정보 업데이트 (recruiting 포함) (인증 필요)
// router.put(
//   "/:communityId",
//   authenticate,
//   communityController.updateCommunityDetails
// );

// // PUT /communities/:communityId/status - 커뮤니티 상태 업데이트 (인증 필요)
// router.put(
//   "/:communityId/status",
//   authenticate,
//   communityController.updateCommunityStatus
// );

// // DELETE /communities/:communityId - 커뮤니티 삭제 (인증 필요)
// router.delete(
//   "/:communityId",
//   authenticate,
//   communityController.deleteCommunity
// );

// // POST /communities/:communityId/apply - 커뮤니티 가입 신청 (인증 필요)
// router.post(
//   "/:communityId/apply",
//   authenticate,
//   applicationController.createApplication
// );

// // --- 팀 게시물 관련 라우트 ---
// // POST /communities/:communityId/posts/write - 새로운 팀 게시물 생성 (인증 필요)
// router.post(
//   "/:communityId/posts/write",
//   authenticate,
//   teamPostController.createTeamPost
// );

// // GET /communities/:communityId/posts - 특정 커뮤니티의 모든 팀 게시물 조회 (인증 필요)
// router.get(
//   "/:communityId/posts",
//   authenticate,
//   teamPostController.getTeamPosts
// );

// // GET /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회 (인증 필요)
// router.get(
//   "/:communityId/posts/:teamPostId",
//   authenticate,
//   teamPostController.getTeamPostById
// );

// // PUT /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정 (인증 필요)
// router.put(
//   "/:communityId/posts/:teamPostId",
//   authenticate,
//   teamPostController.updateTeamPost
// );

// // DELETE /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제 (인증 필요)
// router.delete(
//   "/:communityId/posts/:teamPostId",
//   authenticate,
//   teamPostController.deleteTeamPost
// );

// export default router;
