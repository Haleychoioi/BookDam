import express from 'express';
import wishListController from '../controllers/wishList.controller';
import tasteAnalysisController from '../controllers/tasteAnalysis.controller';
import myLibraryController from "../controllers/myLibrary.controller";
import authenticate from '../middleware/authenticate-middleware'
import { PostController } from "../controllers/posts.controller";
import { CommentController } from '../controllers/comments.controller';
import { CommunityController } from '../controllers/communities.controller';
import { ApplicationController } from '../controllers/applications.controller';
import userController from '../controllers/user.controller';
import { handleValidationResult, updateProfileValidator } from '../middleware/validation-result-handler';
import upload from '../middleware/multer';

const postController = new PostController();
const commentController = new CommentController();
const communityController = new CommunityController();
const applicationController = new ApplicationController();

const router = express.Router();

// 내 정보 조회(백엔드 확인)
router.get('/getProfile', authenticate, userController.getProfile);

// 회원정보 수정
router.put('/profile-edit',authenticate,upload.single('profileImage'),updateProfileValidator,handleValidationResult,userController.updateProfile);

// 비밀번호 수정
router.put('/change-password', authenticate, userController.changePassword);

// 유저 삭제
router.delete('/delete', authenticate, handleValidationResult, userController.deleteUser);

// 위시리스트 추가
router.post('/', authenticate, wishListController.addWish);

// 위시 삭제
router.delete('/:isbn13', authenticate, wishListController.removeWish);

// 전체 위시리스트
router.get('/', authenticate, wishListController.getWishList);

// 사용자 도서 통계
router.get("/", authenticate, tasteAnalysisController.getTasteAnalysis);

// 서재에 없으면 추가, 있으면 상태변경
router.post('/', authenticate, myLibraryController.upsertBookInLibrary);

// 서재 목록 보기
router.get("/", authenticate, myLibraryController.getBooksInLibrary);

// 서재 도서 삭제
router.delete("/:isbn13", authenticate, myLibraryController.deleteBookFromLibrary);

// 내가 작성한 글
router.get("/my-post", authenticate, postController.getMyPosts);

// 내가 작성한 댓글
router.get("/my-comments", authenticate, commentController.getMyComments);

// 내가 모집중인
router.get("/communities/recruiting", authenticate, communityController.getMyRecruitingCommunities);

// 내가 신청한
router.get("/communities/applied", authenticate, applicationController.getMyApplications);

// 지원서 모집 신청 취소
router.delete("/communities/applications/:applicationId", authenticate, applicationController.cancelApplication);

// 참여중인 커뮤
router.get("/communities/participating", authenticate, communityController.getMyParticipatingCommunities);

// 커뮤 탈퇴, 삭제(멤버-삭제/팀장-삭제)
router.delete("/communities/participating/:communityId", authenticate, communityController.leaveOrDeleteCommunity);

export default router;