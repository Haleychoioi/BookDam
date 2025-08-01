// src/controllers/applications.controller.ts

import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/applications.service";
import { ApplicationStatus } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  /**
   * POST /communities/:communityId/apply - 커뮤니티 가입 신청
   */
  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;
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
   */
  public getCommunityApplicants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const requestingUserId = req.user;

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
          requestingUserId
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
   */
  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, userId: rawApplicantUserId } =
        req.params;
      const requestingUserId = req.user;
      const { status } = req.body;

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
        requestingUserId
      );
      res.status(200).json({ status: "success", message: "신청 처리 성공" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /mypage/communities/recruiting/:communityId - 모집 취소 (API 명세서에 따라)
   */
  public cancelRecruitment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const requestingUserId = req.user;

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
        requestingUserId
      );
      res.status(200).json({ status: "success", message: "모집 취소 성공" });
    } catch (error) {
      next(error);
    }
  };
}
