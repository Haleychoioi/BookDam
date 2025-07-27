// src/routes/applications.routes.ts

import { Router } from "express";
import { ApplicationController } from "../controllers/applications.controller"; // ApplicationController를 import합니다.

const router = Router();
const applicationController = new ApplicationController(); // ApplicationController 인스턴스를 생성합니다.

// API 명세서 기반 라우트 정의
// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
// index.ts에서 "/mypage/communities/recruiting"을 베이스 경로로 사용하므로, 여기서는 상대 경로로 정의합니다.
router.get(
  "/:communityId/applicants", // 수정: "/mypage/communities/recruiting" 부분 제거
  applicationController.getCommunityApplicants // 컨트롤러 메서드 이름 확인
);

// PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
// index.ts에서 "/mypage/communities/recruiting"을 베이스 경로로 사용하므로, 여기서는 상대 경로로 정의합니다.
router.put(
  "/:communityId/applicants/:userId", // 수정: "/mypage/communities/recruiting" 부분 제거
  applicationController.updateApplicationStatus
);

// DELETE /mypage/communities/recruiting/:communityId - 모집 취소
// index.ts에서 "/mypage/communities/recruiting"을 베이스 경로로 사용하므로, 여기서는 상대 경로로 정의합니다.
router.delete(
  "/:communityId", // 수정: "/mypage/communities/recruiting" 부분 제거
  applicationController.cancelRecruitment
);

export default router;
