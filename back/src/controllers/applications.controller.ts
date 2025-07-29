// src/controllers/applications.controller.ts

import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/applications.service";
import { ApplicationStatus } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  /**
   * POST /communities/:communityId/apply - 커뮤니티 가입 신청
   * userId: req.user (인증 미들웨어에서 주입)
   * communityId: req.params
   * applicationMessage: req.body
   */
  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      const userId = req.user; // 인증 미들웨어에서 주입된 userId 사용
      const { applicationMessage } = req.body;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 유효성 검사
      if (rawCommunityId === undefined || applicationMessage === undefined) {
        throw new CustomError(
          400,
          "필수 필드(communityId, applicationMessage)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      await this.applicationService.createApplication(communityId, {
        userId, // req.user에서 가져온 userId 사용
        applicationMessage,
      });
      res.status(201).json({ status: "success", message: "가입 신청 완료" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /mypage/communities/recruiting/:communityId/applicants - 특정 모집 커뮤니티의 신청자 목록 상세 조회
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   * communityId: req.params
   */
  public getCommunityApplicants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      const requestingUserId = req.user; // 인증 미들웨어에서 주입된 userId 사용

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined) {
        throw new CustomError(400, "필수 정보(communityId)가 누락되었습니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const applicants =
        await this.applicationService.findApplicantsByCommunity(
          communityId,
          requestingUserId // req.user에서 가져온 requestingUserId 사용
        );
      res.status(200).json({
        message: `커뮤니티 ID ${communityId}의 신청자 목록 조회 성공`,
        applicants: applicants,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /mypage/communities/recruiting/:communityId/applicants/:userId - 신청 수락/거절
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   * communityId, applicantUserId: req.params
   * status: req.body
   */
  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, userId: rawApplicantUserId } =
        req.params; // 커뮤니티 ID, 지원자 ID (URL 파라미터)
      const requestingUserId = req.user; // 인증 미들웨어에서 주입된 userId 사용
      const { status } = req.body; // status: "accepted" or "rejected"

      // --- 디버깅 로그 제거 ---
      // console.log("--- updateApplicationStatus Debug ---");
      // console.log("req.params:", req.params);
      // console.log("req.body:", req.body);
      // console.log("rawCommunityId (from params):", rawCommunityId);
      // console.log("rawApplicantUserId (from params.userId):", rawApplicantUserId);
      // console.log("status (from body):", status);
      // console.log("requestingUserId (from req.user):", requestingUserId);
      // --- 디버깅 로그 끝 ---

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 유효성 검사
      if (
        rawCommunityId === undefined ||
        rawApplicantUserId === undefined ||
        status === undefined
      ) {
        throw new CustomError(
          400,
          "필수 정보(communityId, applicantUserId, status)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const applicantUserId = Number(rawApplicantUserId);
      if (isNaN(applicantUserId)) {
        throw new CustomError(400, "유효한 지원자 사용자 ID가 아닙니다.");
      }

      // 상태 값 유효성 검사
      const upperCaseStatus = status.toUpperCase() as ApplicationStatus;
      if (!Object.values(ApplicationStatus).includes(upperCaseStatus)) {
        throw new CustomError(400, "유효하지 않은 신청 상태입니다.");
      }

      await this.applicationService.updateApplicationStatus(
        communityId,
        applicantUserId,
        upperCaseStatus,
        requestingUserId // req.user에서 가져온 requestingUserId 사용
      );
      res.status(200).json({ status: "success", message: "신청 처리 성공" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /mypage/communities/recruiting/:communityId - 모집 취소 (API 명세서에 따라)
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   * communityId: req.params
   */
  public cancelRecruitment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      const requestingUserId = req.user; // 인증 미들웨어에서 주입된 userId 사용

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined) {
        throw new CustomError(400, "필수 정보(communityId)가 누락되었습니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      await this.applicationService.cancelRecruitment(
        communityId,
        requestingUserId // req.user에서 가져온 requestingUserId 사용
      );
      res.status(200).json({ status: "success", message: "모집 취소 성공" });
    } catch (error) {
      next(error);
    }
  };
}
