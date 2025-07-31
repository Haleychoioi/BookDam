// src/routes/applications.routes.ts

import { Router } from "express";
import { ApplicationController } from "../controllers/applications.controller";
import authenticate from "../middleware/authenticate-middleware";

const router = Router();
const applicationController = new ApplicationController();

// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
router.get(
  "/:communityId/applicants",
  authenticate,
  applicationController.getCommunityApplicants
);

// PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
router.put(
  "/:communityId/applicants/:userId",
  authenticate,
  applicationController.updateApplicationStatus
);

// DELETE /mypage/communities/recruiting/:communityId - 모집 취소
router.delete(
  "/:communityId",
  authenticate,
  applicationController.cancelRecruitment
);

export default router;
