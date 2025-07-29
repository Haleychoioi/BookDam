// src/controllers/applications.controller.ts

import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/applications.service";
import { ApplicationStatus } from "@prisma/client";

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
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아야 합니다.
      const { userId: rawUserId, applicationMessage } = req.body;

      // 필수 필드 및 타입 유효성 검사
      if (
        rawCommunityId === undefined ||
        rawUserId === undefined ||
        applicationMessage === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 필드(communityId, userId, applicationMessage)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.applicationService.createApplication(communityId, {
        userId,
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
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      const rawQueryUserId = req.query.requestingUserId;

      // requestingUserId를 문자열로 정제하고, null/undefined/빈 문자열을 엄격하게 검사합니다.
      // 숫자 타입도 문자열로 변환하여 처리할 수 있도록 수정합니다.
      const requestingUserIdString =
        rawQueryUserId !== undefined && rawQueryUserId !== null
          ? String(
              Array.isArray(rawQueryUserId) ? rawQueryUserId[0] : rawQueryUserId
            ).trim()
          : undefined;

      if (
        rawCommunityId === undefined ||
        requestingUserIdString === undefined ||
        requestingUserIdString.trim() === "" // 빈 문자열도 유효하지 않은 것으로 간주
      ) {
        return res.status(400).json({
          message: "필수 정보(communityId, 요청 사용자 ID)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const requestingUserId = Number(requestingUserIdString);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
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
        req.params; // 커뮤니티 ID, 지원자 ID (URL 파라미터)
      const { status, requestingUserId: rawRequestingUserIdFromBody } =
        req.body; // status: "accepted" or "rejected", requestingUserId: 요청하는 팀장 ID (요청 본문)

      // --- 디버깅 로그 (유지) ---
      console.log("--- updateApplicationStatus Debug ---");
      console.log("req.params:", req.params);
      console.log("req.body:", req.body);
      console.log("rawCommunityId (from params):", rawCommunityId);
      console.log(
        "rawApplicantUserId (from params.userId):",
        rawApplicantUserId
      );
      console.log("status (from body):", status);
      console.log(
        "rawRequestingUserIdFromBody (from body):",
        rawRequestingUserIdFromBody
      );
      // --- 디버깅 로그 끝 ---

      // requestingUserId를 문자열로 정제하고, null/undefined/빈 문자열을 엄격하게 검사합니다.
      // 숫자 타입도 문자열로 변환하여 처리할 수 있도록 수정합니다.
      const requestingUserIdString =
        rawRequestingUserIdFromBody !== undefined &&
        rawRequestingUserIdFromBody !== null
          ? String(rawRequestingUserIdFromBody).trim() // 숫자를 문자열로 변환 후 trim
          : undefined; // 유효하지 않으면 undefined로 설정

      // 필수 필드 및 타입 유효성 검사
      if (
        rawCommunityId === undefined ||
        rawApplicantUserId === undefined ||
        status === undefined ||
        requestingUserIdString === undefined || // 이 변수를 집중적으로 확인합니다.
        requestingUserIdString.trim() === "" // 빈 문자열도 유효하지 않은 것으로 간주
      ) {
        // --- 디버깅 로그 (유지) ---
        console.log("Missing fields detected:");
        if (rawCommunityId === undefined)
          console.log("  rawCommunityId is undefined");
        if (rawApplicantUserId === undefined)
          console.log("  rawApplicantUserId is undefined");
        if (status === undefined) console.log("  status is undefined");
        if (
          requestingUserIdString === undefined ||
          requestingUserIdString.trim() === ""
        )
          console.log("  requestingUserIdString is undefined or empty");
        // --- 디버깅 로그 끝 ---

        return res.status(400).json({
          message:
            "필수 정보(communityId, applicantUserId, status, requestingUserId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const applicantUserId = Number(rawApplicantUserId);
      if (isNaN(applicantUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 지원자 사용자 ID가 아닙니다." });
      }

      const requestingUserId = Number(requestingUserIdString);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      // 상태 값 유효성 검사
      if (
        !Object.values(ApplicationStatus).includes(
          status.toUpperCase() as ApplicationStatus
        )
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 신청 상태입니다." });
      }

      await this.applicationService.updateApplicationStatus(
        communityId,
        applicantUserId,
        status.toUpperCase() as ApplicationStatus,
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
      const { communityId: rawCommunityId } = req.params; // 커뮤니티 ID (모집글 ID와 연결)
      const { requestingUserId: rawRequestingUserIdFromBody } = req.body; // 임시로 body에서 받음

      // requestingUserId를 문자열로 정제하고, null/undefined/빈 문자열을 엄격하게 검사합니다.
      // 숫자 타입도 문자열로 변환하여 처리할 수 있도록 수정합니다.
      const requestingUserIdString =
        rawRequestingUserIdFromBody !== undefined &&
        rawRequestingUserIdFromBody !== null
          ? String(rawRequestingUserIdFromBody).trim()
          : undefined;

      if (
        rawCommunityId === undefined ||
        requestingUserIdString === undefined ||
        requestingUserIdString.trim() === "" // 빈 문자열도 유효하지 않은 것으로 간주
      ) {
        return res.status(400).json({
          message: "필수 정보(communityId, 요청 사용자 ID)가 누락되었습니다.",
        });
      } // <-- 이전에 여기에 불필요한 `});`가 있었습니다.

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const requestingUserId = Number(requestingUserIdString);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
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
