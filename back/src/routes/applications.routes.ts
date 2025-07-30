// src/routes/applications.routes.ts

import { Router } from "express";
import { ApplicationController } from "../controllers/applications.controller"; // ApplicationController를 import합니다.
import authenticate from "../middleware/authenticate-middleware"; // authenticate 미들웨어 import

const router = Router();
const applicationController = new ApplicationController(); // ApplicationController 인스턴스를 생성합니다.

// API 명세서 기반 라우트 정의
// 이 라우터는 일반적으로 src/app.ts (또는 main 라우터 파일)에서
// app.use("/mypage/communities/recruiting", applicationsRoutes); 와 같이 마운트됩니다.

// POST /communities/:communityId/apply - 커뮤니티 가입 신청 (이 라우트는 applications.routes.ts에 직접 정의되지 않고,
// 일반적으로 communities.routes.ts 또는 별도의 라우트에서 처리됩니다.
// 현재 applications.routes.ts에는 이 라우트가 없으므로 추가하지 않습니다.)
// 만약 이 라우트가 applications.routes.ts에 포함되어야 한다면, 아래와 같이 추가할 수 있습니다:
// router.post("/:communityId/apply", authenticate, applicationController.createApplication);

// GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
// 인증된 사용자만 접근 가능
router.get(
  "/:communityId/applicants",
  authenticate, // 인증 미들웨어 추가
  applicationController.getCommunityApplicants
);

// PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
// 인증된 사용자만 접근 가능
router.put(
  "/:communityId/applicants/:userId",
  authenticate, // 인증 미들웨어 추가
  applicationController.updateApplicationStatus
);

// DELETE /mypage/communities/recruiting/:communityId - 모집 취소
// 인증된 사용자만 접근 가능
router.delete(
  "/:communityId",
  authenticate, // 인증 미들웨어 추가
  applicationController.cancelRecruitment
);

export default router;
