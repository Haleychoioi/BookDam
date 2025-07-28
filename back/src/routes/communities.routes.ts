// src/routes/communities.routes.ts

import { Router } from "express";
import { CommunityController } from "../controllers/communities.controller";
import { TeamPostController } from "../controllers/team-posts.controller"; // TeamPostController를 import합니다.
import { ApplicationController } from "../controllers/applications.controller"; // ApplicationController를 import합니다.

const router = Router();
const communityController = new CommunityController();
const teamPostController = new TeamPostController(); // TeamPostController 인스턴스를 생성합니다.
const applicationController = new ApplicationController(); // ApplicationController 인스턴스를 생성합니다.

// API 명세서 기반 라우트 정의

// 커뮤니티 관련 라우트
// GET /communities - 커뮤니티 목록 조회
router.get("/", communityController.getCommunities);
// POST /communities - 도서 기반 커뮤니티 생성
router.post("/", communityController.createCommunity);
// GET /books/:itemId/communities - 특정 도서 관련 커뮤니티 목록 조회
router.get("/books/:itemId", communityController.getCommunitiesByBook);
// GET /communities/:communityId - 특정 커뮤니티 상세 조회
router.get("/:communityId", communityController.getCommunityById);

// PUT /communities/:communityId - 특정 커뮤니티 상세 정보 업데이트 (recruiting 포함)
// 이 라우트는 커뮤니티의 이름, 설명, 최대 멤버 수, 모집 여부 등을 업데이트하는 데 사용됩니다.
router.put("/:communityId", communityController.updateCommunityDetails); // 새로운 라우트 추가

// PUT /communities/:communityId/status - 커뮤니티 상태 업데이트 (기존 라우트)
router.put("/:communityId/status", communityController.updateCommunityStatus);
// DELETE /communities/:communityId - 커뮤니티 삭제
router.delete("/:communityId", communityController.deleteCommunity);

// --- 커뮤니티 가입 신청 라우트 ---
// POST /communities/:communityId/apply - 커뮤니티 가입 신청
router.post("/:communityId/apply", applicationController.createApplication);

// --- 특정 모집 커뮤니티의 신청자 목록 상세 조회 라우트 추가 ---
// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
router.get(
  "/mypage/communities/recruiting/:communityId/applicants",
  applicationController.getCommunityApplicants // 이 메서드는 ApplicationController에 구현되어야 합니다.
);

// --- 팀 게시물 관련 라우트 ---
// 참고: 팀 게시물 라우트는 커뮤니티 ID를 포함하는 중첩 경로로 정의됩니다.

// POST /communities/:communityId/posts/write - 새로운 팀 게시물 생성
router.post("/:communityId/posts/write", teamPostController.createTeamPost);

// GET /communities/:communityId/posts - 특정 커뮤니티의 모든 팀 게시물 조회
router.get("/:communityId/posts", teamPostController.getTeamPosts);

// GET /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회
router.get(
  "/:communityId/posts/:teamPostId",
  teamPostController.getTeamPostById
);

// PUT /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정
router.put(
  "/:communityId/posts/:teamPostId",
  teamPostController.updateTeamPost
);

// DELETE /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제
router.delete(
  "/:communityId/posts/:teamPostId",
  teamPostController.deleteTeamPost
);

export default router;
