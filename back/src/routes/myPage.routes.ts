import express from 'express';
import wishListController from '../controllers/wishList.controller';
import tasteAnalysisController from '../controllers/tasteAnalysis.controller';
import myLibraryController from "../controllers/myLibrary.controller";
import authenticate from '../middleware/authenticate-middleware'
import { PostController } from "../controllers/posts.controller";
import { CommentController } from '../controllers/comments.controller';
import { CommunityController } from '../controllers/communities.controller';
import { ApplicationController } from '../controllers/applications.controller';

const postController = new PostController();
const commentController = new CommentController();
const communityController = new CommunityController();
const applicationController = new ApplicationController();

const router = express.Router();

// 위시리스트 추가
router.post('/', authenticate, wishListController.addWish);

// 삭제
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

// 참여중인 커뮤
router.get("/communities/participating", authenticate, communityController.getMyParticipatingCommunities);

// 커뮤 탈퇴, 삭제(멤버-삭제/팀장-삭제)

export default router;