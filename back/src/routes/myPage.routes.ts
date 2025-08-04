// src/routes/myPage.routes.ts

import { Router, Request, Response, NextFunction } from "express";
import authenticate from "../middleware/authenticate-middleware";
import upload from "../middleware/multer";
import {
  handleValidationResult,
  updateProfileValidator,
} from "../middleware/validation-result-handler";

import userController from "../controllers/user.controller";
import wishListController from "../controllers/wishList.controller";
import tasteAnalysisController from "../controllers/tasteAnalysis.controller";
import myLibraryController from "../controllers/myLibrary.controller";
import { PostController } from "../controllers/posts.controller";
import { CommentController } from "../controllers/comments.controller";
import { CommunityController } from "../controllers/communities.controller";
import { ApplicationController } from "../controllers/applications.controller"; // ApplicationController 임포트 유지
import { TeamPostController } from "../controllers/team-posts.controller";
import { TeamCommentController } from "../controllers/team-comments.controller";

const postController = new PostController();
const commentController = new CommentController();
const communityController = new CommunityController();

const applicationController = new ApplicationController(); // ApplicationController 인스턴스화 유지
const teamPostController = new TeamPostController();
const teamCommentController = new TeamCommentController();

const router = Router();
const communitiesRouter = Router();

// =========================================================
// 사용자 계정 관련 라우트
// =========================================================
router.get(
  "/getProfile",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getProfile(req, res, next)
);
router.put(
  "/profile-edit",
  authenticate,
  upload.single("profileImage"),
  updateProfileValidator,
  handleValidationResult,
  (req: Request, res: Response, next: NextFunction) =>
    userController.updateProfile(req, res, next)
);
router.put(
  "/change-password",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    userController.changePassword(req, res, next)
);
router.delete(
  "/delete",
  authenticate,
  handleValidationResult,
  (req: Request, res: Response, next: NextFunction) =>
    userController.deleteUser(req, res, next)
);

// =========================================================
// 위시리스트 관련 라우트
// =========================================================
router.post(
  "/wishlist",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    wishListController.addWish(req, res, next)
);
router.delete(
  "/wishlist/:isbn13",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    wishListController.removeWish(req, res, next)
);
router.get(
  "/wishlist",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    wishListController.getWishList(req, res, next)
);

// =========================================================
// 독서 취향 분석 관련 라우트
// =========================================================
router.get(
  "/taste-analysis",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    tasteAnalysisController.getTasteAnalysis(req, res)
);

// =========================================================
// 내 서재 관련 라우트
// =========================================================
router.post(
  "/my-library",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    myLibraryController.upsertBookInLibrary(req, res, next)
);
router.get(
  "/my-library",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    myLibraryController.getBooksInLibrary(req, res, next)
);
router.delete(
  "/my-library/:isbn13",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    myLibraryController.deleteBookFromLibrary(req, res, next)
);

// =========================================================
// 내 활동 기록 관련 라우트 (글, 댓글)
// =========================================================
router.get(
  "/my-posts",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    postController.getMyPosts(req, res, next)
);
router.get(
  "/my-comments",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    commentController.getMyComments(req, res, next)
);

// =========================================================
// 커뮤니티 관련 라우트들을 communitiesRouter 안으로 이동합니다.
// =========================================================

// POST /mypage/communities - 도서 기반 커뮤니티 생성
communitiesRouter.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.createCommunity(req, res, next)
);

// GET /mypage/communities - 모든 커뮤니티 목록 조회
communitiesRouter.get("/", (req: Request, res: Response, next: NextFunction) =>
  communityController.getCommunities(req, res, next)
);

// GET /mypage/communities/books/:itemId - 특정 도서 관련 커뮤니티 목록 조회
communitiesRouter.get(
  "/books/:itemId",
  (req: Request, res: Response, next: NextFunction) =>
    communityController.getCommunitiesByBook(req, res, next)
);

// POST /mypage/communities/:communityId/apply - 커뮤니티 가입 신청
communitiesRouter.post(
  "/:communityId/apply",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.createApplication(req, res, next)
);

// GET /mypage/communities/recruiting - 내가 모집 중인 커뮤니티 목록 조회
communitiesRouter.get(
  "/recruiting",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.getMyRecruitingCommunities(req, res, next)
);

// GET /mypage/communities/applied - 내가 신청한 커뮤니티 목록 조회
communitiesRouter.get(
  "/applied",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.getMyApplications(req, res, next)
);

// GET /mypage/communities/participating - 현재 참여 중인 커뮤니티 목록 조회
communitiesRouter.get(
  "/participating",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.getMyParticipatingCommunities(req, res, next)
);

// GET /api/mypage/communities/ended - 모집 종료된 커뮤니티 목록 조회
communitiesRouter.get(
  "/ended",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.getMyEndedCommunities(req, res, next)
);

// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
communitiesRouter.get(
  "/recruiting/:communityId/applicants",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.getCommunityApplicants(req, res, next)
);

// DELETE /mypage/communities/applications/:applicationId - 지원서 모집 신청 취소
communitiesRouter.delete(
  "/applications/:applicationId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.cancelApplication(req, res, next)
);

// PUT /mypage/communities/:communityId - 특정 커뮤니티 상세 정보 업데이트
communitiesRouter.put(
  "/:communityId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.updateCommunityDetails(req, res, next)
);

// PUT /mypage/communities/:communityId/status - 커뮤니티 상태 업데이트
communitiesRouter.put(
  "/:communityId/status",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.updateCommunityStatus(req, res, next)
);

// PATCH /api/mypage/communities/:communityId/end-recruitment - 커뮤니티 모집 종료
communitiesRouter.patch(
  "/:communityId/end-recruitment",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.endRecruitment(req, res, next)
);

// DELETE /mypage/communities/recruiting/:communityId - 모집 취소 (app.ts에서 이동했으므로, 다시 이곳에 정의)
communitiesRouter.delete(
  "/recruiting/:communityId", // 이 라우트 정의는 이제 app.ts로 이동했었지만, 다시 이곳으로 정의합니다.
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.cancelRecruitment(req, res, next)
);

// DELETE /mypage/communities/:communityId - 커뮤니티 삭제 (참여 중인 커뮤니티의 삭제/탈퇴 라우트)
// 이 라우트가 "호스트는 삭제, 멤버는 탈퇴" 로직을 담당합니다.
communitiesRouter.delete(
  "/participating/:communityId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    communityController.leaveOrDeleteCommunity(req, res, next)
);

// DELETE /mypage/communities/:communityId - 일반적인 커뮤니티 ID 기반 삭제 (이전 충돌 라우트 제거)
// 이 라우트는 위 /participating/:communityId 와 충돌할 수 있으므로 제거합니다.
// (다만, 관리자 기능 등으로 /api/mypage/communities/:communityId 형태의 삭제가 필요하면 별도로 정의해야 함)
// communitiesRouter.delete("/:communityId", authenticate, (req: Request, res: Response, next: NextFunction) => communityController.deleteCommunity(req, res, next));

// GET /mypage/communities/:communityId - 특정 커뮤니티 상세 조회
communitiesRouter.get(
  "/:communityId",
  (req: Request, res: Response, next: NextFunction) =>
    communityController.getCommunityById(req, res, next)
);

// =========================================================
// 팀 게시물 관련 라우트들을 communitiesRouter 안으로 이동합니다.
// =========================================================

// POST /mypage/communities/:communityId/posts/write - 새로운 팀 게시물 생성
communitiesRouter.post(
  "/:communityId/posts/write",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamPostController.createTeamPost(req, res, next)
);

// GET /mypage/communities/:communityId/posts - 특정 커뮤니티의 모든 팀 게시물 조회
communitiesRouter.get(
  "/:communityId/posts",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamPostController.getTeamPosts(req, res, next)
);

// GET /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회
communitiesRouter.get(
  "/:communityId/posts/:teamPostId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamPostController.getTeamPostById(req, res, next)
);

// PUT /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정
communitiesRouter.put(
  "/:communityId/posts/:teamPostId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamPostController.updateTeamPost(req, res, next)
);

// DELETE /mypage/communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제
communitiesRouter.delete(
  "/:communityId/posts/:teamPostId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamPostController.deleteTeamPost(req, res, next)
);

// =========================================================
// 팀 댓글 관련 라우트들을 communitiesRouter 안으로 이동합니다.
// =========================================================

// GET /api/mypage/team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
communitiesRouter.get(
  "/team-posts/:teamPostId/comments",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamCommentController.getTeamCommentsByTeamPost(req, res, next)
);

// POST /api/mypage/team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
communitiesRouter.post(
  "/team-posts/:teamPostId/comments",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamCommentController.createTeamComment(req, res, next)
);

// PUT /api/mypage/team-comments/:id - 특정 팀 댓글 수정
communitiesRouter.put(
  "/team-comments/:id",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamCommentController.updateTeamComment(req, res, next)
);

// DELETE /api/mypage/team-comments/:id - 특정 팀 댓글 삭제
communitiesRouter.delete(
  "/team-comments/:id",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    teamCommentController.deleteTeamComment(req, res, next)
);

// PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
communitiesRouter.put(
  "/recruiting/:communityId/applicants/:userId",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.updateApplicationStatus(req, res, next)
);

// GET /api/mypage/users/:userId/community-history - 특정 사용자의 커뮤니티 참여 이력 조회
router.get(
  "/users/:userId/community-history",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getCommunityHistory(req, res, next)
);

// myPageRouter에 communitiesRouter를 마운트합니다.
router.use("/communities", communitiesRouter);

export default router;
