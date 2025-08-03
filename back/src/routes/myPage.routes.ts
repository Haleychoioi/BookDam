// src/routes/myPage.routes.ts

import { Router } from "express";
import authenticate from "../middleware/authenticate-middleware";
import upload from "../middleware/multer";
import {
  handleValidationResult,
  updateProfileValidator,
} from "../middleware/validation-result-handler";

// ✨ 모든 필요한 컨트롤러 임포트 및 인스턴스 생성 ✨
import userController from "../controllers/user.controller";
import wishListController from "../controllers/wishList.controller";
import tasteAnalysisController from "../controllers/tasteAnalysis.controller";
import myLibraryController from "../controllers/myLibrary.controller";
import { PostController } from "../controllers/posts.controller";
import { CommentController } from "../controllers/comments.controller";
import { CommunityController } from "../controllers/communities.controller";
import { ApplicationController } from "../controllers/applications.controller";
import { TeamPostController } from "../controllers/team-posts.controller";
import { TeamCommentController } from "../controllers/team-comments.controller";

const postController = new PostController();
const commentController = new CommentController();
const communityController = new CommunityController();
const applicationController = new ApplicationController();
const teamPostController = new TeamPostController();
const teamCommentController = new TeamCommentController();

const router = Router(); // 기존 myPageRouter (최상위)
const communitiesRouter = Router(); // ✨ 새로 생성된 communities 전용 서브 라우터 ✨

// =========================================================
// 사용자 계정 관련 라우트
// =========================================================
router.get(
  "/getProfile",
  authenticate,
  userController.getProfile.bind(userController)
);
router.put(
  "/profile-edit",
  authenticate,
  upload.single("profileImage"),
  updateProfileValidator,
  handleValidationResult,
  userController.updateProfile.bind(userController)
);
router.put(
  "/change-password",
  authenticate,
  userController.changePassword.bind(userController)
);
router.delete(
  "/delete",
  authenticate,
  handleValidationResult,
  userController.deleteUser.bind(userController)
);

// =========================================================
// 위시리스트 관련 라우트
// =========================================================
router.post(
  "/wishlist",
  authenticate,
  wishListController.addWish.bind(wishListController)
);
router.delete(
  "/wishlist/:isbn13",
  authenticate,
  wishListController.removeWish.bind(wishListController)
);
router.get(
  "/wishlist",
  authenticate,
  wishListController.getWishList.bind(wishListController)
);

// =========================================================
// 독서 취향 분석 관련 라우트
// =========================================================
router.get(
  "/taste-analysis",
  authenticate,
  tasteAnalysisController.getTasteAnalysis.bind(tasteAnalysisController)
);

// =========================================================
// 내 서재 관련 라우트
// =========================================================
router.post(
  "/my-library",
  authenticate,
  myLibraryController.upsertBookInLibrary.bind(myLibraryController)
);
router.get(
  "/my-library",
  authenticate,
  myLibraryController.getBooksInLibrary.bind(myLibraryController)
);
router.delete(
  "/my-library/:isbn13",
  authenticate,
  myLibraryController.deleteBookFromLibrary.bind(myLibraryController)
);

// =========================================================
// 내 활동 기록 관련 라우트 (글, 댓글)
// =========================================================
router.get(
  "/my-posts",
  authenticate,
  postController.getMyPosts.bind(postController)
);
router.get(
  "/my-comments",
  authenticate,
  commentController.getMyComments.bind(commentController)
);

// =========================================================
// ✨ 커뮤니티 관련 라우트들을 communitiesRouter 안으로 이동합니다. ✨
// myPageRouter는 /communities 접두사를 사용하여 communitiesRouter를 마운트합니다.
// =========================================================

// POST /mypage/communities - 도서 기반 커뮤니티 생성
communitiesRouter.post(
  "/",
  authenticate,
  communityController.createCommunity.bind(communityController)
);

// GET /mypage/communities - 모든 커뮤니티 목록 조회 (추가)
communitiesRouter.get(
  "/",
  communityController.getCommunities.bind(communityController)
);

// GET /mypage/communities/books/:itemId - 특정 도서 관련 커뮤니티 목록 조회
communitiesRouter.get(
  "/books/:itemId",
  communityController.getCommunitiesByBook.bind(communityController)
);

// POST /mypage/communities/:communityId/apply - 커뮤니티 가입 신청
communitiesRouter.post(
  "/:communityId/apply",
  authenticate,
  applicationController.createApplication.bind(applicationController)
);

// GET /mypage/communities/recruiting - 내가 모집 중인 커뮤니티 목록 조회
communitiesRouter.get(
  "/recruiting",
  authenticate,
  communityController.getMyRecruitingCommunities.bind(communityController)
);

// GET /mypage/communities/applied - 내가 신청한 커뮤니티 목록 조회
communitiesRouter.get(
  "/applied",
  authenticate,
  applicationController.getMyApplications.bind(applicationController)
);

// GET /mypage/communities/participating - 현재 참여 중인 커뮤니티 목록 조회
communitiesRouter.get(
  "/participating",
  authenticate,
  communityController.getMyParticipatingCommunities.bind(communityController)
);

// GET /api/mypage/communities/ended - 모집 종료된 커뮤니티 목록 조회
communitiesRouter.get(
  "/ended",
  authenticate,
  communityController.getMyEndedCommunities.bind(communityController)
);

// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
communitiesRouter.get(
  "/recruiting/:communityId/applicants",
  authenticate,
  applicationController.getCommunityApplicants.bind(applicationController)
);

// DELETE /mypage/communities/applications/:applicationId - 지원서 모집 신청 취소
communitiesRouter.delete(
  "/applications/:applicationId",
  authenticate,
  applicationController.cancelApplication.bind(applicationController)
);

// PUT /mypage/communities/:communityId - 특정 커뮤니티 상세 정보 업데이트
communitiesRouter.put(
  "/:communityId",
  authenticate,
  communityController.updateCommunityDetails.bind(communityController)
);

// PUT /mypage/communities/:communityId/status - 커뮤니티 상태 업데이트
communitiesRouter.put(
  "/:communityId/status",
  authenticate,
  communityController.updateCommunityStatus.bind(communityController)
);

// PATCH /api/mypage/communities/:communityId/end-recruitment - 커뮤니티 모집 종료
communitiesRouter.patch(
  "/:communityId/end-recruitment",
  authenticate,
  communityController.endRecruitment.bind(communityController)
);

// DELETE /mypage/communities/:communityId - 커뮤니티 삭제
communitiesRouter.delete(
  "/:communityId",
  authenticate,
  communityController.deleteCommunity.bind(communityController)
);

// GET /mypage/communities/:communityId - 특정 커뮤니티 상세 조회
communitiesRouter.get(
  "/:communityId",
  communityController.getCommunityById.bind(communityController)
);

// =========================================================
// 팀 게시물 관련 라우트들을 communitiesRouter 안으로 이동합니다.
// =========================================================

// POST /mypage/communities/:communityId/posts/write - 새로운 팀 게시물 생성
communitiesRouter.post(
  "/:communityId/posts/write",
  authenticate,
  teamPostController.createTeamPost.bind(teamPostController)
);

// GET /mypage/communities/:communityId/posts - 특정 커뮤니티의 모든 팀 게시물 조회
communitiesRouter.get(
  "/:communityId/posts",
  authenticate,
  teamPostController.getTeamPosts.bind(teamPostController)
);

// GET /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회
communitiesRouter.get(
  "/:communityId/posts/:teamPostId",
  authenticate,
  teamPostController.getTeamPostById.bind(teamPostController)
);

// PUT /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정
communitiesRouter.put(
  "/:communityId/posts/:teamPostId",
  authenticate,
  teamPostController.updateTeamPost.bind(teamPostController)
);

// DELETE /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제
communitiesRouter.delete(
  "/:communityId/posts/:teamPostId",
  authenticate,
  teamPostController.deleteTeamPost.bind(teamPostController)
);

// =========================================================
// 팀 댓글 관련 라우트들을 communitiesRouter 안으로 이동합니다.
// =========================================================

// GET /api/mypage/team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
communitiesRouter.get(
  "/team-posts/:teamPostId/comments",
  authenticate,
  teamCommentController.getTeamCommentsByTeamPost.bind(teamCommentController)
);

// POST /api/mypage/team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
communitiesRouter.post(
  "/team-posts/:teamPostId/comments",
  authenticate,
  teamCommentController.createTeamComment.bind(teamCommentController)
);

// PUT /api/mypage/team-comments/:id - 특정 팀 댓글 수정
communitiesRouter.put(
  "/team-comments/:id",
  authenticate,
  teamCommentController.updateTeamComment.bind(teamCommentController)
);

// DELETE /api/mypage/team-comments/:id - 특정 팀 댓글 삭제
communitiesRouter.delete(
  "/team-comments/:id",
  authenticate,
  teamCommentController.deleteTeamComment.bind(teamCommentController)
);

// PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
communitiesRouter.put(
  "/recruiting/:communityId/applicants/:userId", // 이 줄을 수동으로 다시 정확히 입력합니다.
  authenticate,
  applicationController.updateApplicationStatus.bind(applicationController)
);

// GET /api/mypage/users/:userId/community-history - 특정 사용자의 커뮤니티 참여 이력 조회
router.get(
  "/users/:userId/community-history",
  authenticate,
  userController.getCommunityHistory.bind(userController)
);

// myPageRouter에 communitiesRouter를 마운트합니다.
router.use("/communities", communitiesRouter);

export default router;
