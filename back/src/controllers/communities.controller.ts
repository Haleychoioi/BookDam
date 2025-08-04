// src/zip/controllers/communities.controller.ts

import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/applications.service";
import { CommunityService } from "../services/communities.service";
import { CustomError } from "../middleware/error-handing-middleware";
import { ApplicationStatus, CommunityStatus } from "@prisma/client"; // ✨ ApplicationStatus 추가 ✨

export class CommunityController {
  private communityService: CommunityService;
  private applicationService: ApplicationService;

  constructor() {
    this.communityService = new CommunityService();
    this.applicationService = new ApplicationService();
  }

  public getCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sort = (req.query.sort as string) || "latest";
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      const communities = await this.communityService.findAllCommunities({
        page,
        pageSize,
        sort,
        userId,
      });

      console.log(
        "CommunityController: Data being sent to frontend (getCommunities):",
        communities
      );

      res.status(200).json({
        status: "success",
        message: "커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCommunitiesByBook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const isbn13 = req.params.isbn13;
      const size = parseInt(req.query.size as string) || 10;
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      const communities = await this.communityService.findCommunitiesByBook(
        isbn13,
        { size, userId }
      );

      console.log(
        "CommunityController: Data being sent to frontend (getCommunitiesByBook):",
        communities
      );

      res.status(200).json({
        status: "success",
        message: `도서 ${isbn13} 관련 커뮤니티 목록 조회 성공`,
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  public createCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { isbn13, title, content, maxMembers } = req.body;
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      const newCommunity = await this.communityService.createCommunity({
        userId,
        isbn13,
        title,
        content,
        maxMembers,
      });

      res.status(201).json({
        status: "success",
        message: "커뮤니티 생성 성공",
        communityId: newCommunity.teamId,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCommunityById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const community = await this.communityService.findCommunityById(
        communityId
      );
      if (!community) {
        throw new CustomError(404, "Community not found");
      }
      res.status(200).json({
        status: "success",
        message: "커뮤니티 상세 조회 성공",
        data: community,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateCommunityDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const updateData = req.body;
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      const updatedCommunity =
        await this.communityService.updateCommunityDetails(
          communityId,
          userId,
          updateData
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 정보 업데이트 성공",
        data: updatedCommunity,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateCommunityStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { newStatus } = req.body;
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      const updatedCommunity =
        await this.communityService.updateCommunityStatus(
          communityId,
          newStatus,
          userId
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 상태 업데이트 성공",
        data: updatedCommunity,
      });
    } catch (err) {
      next(err);
    }
  };

  public async endRecruitment(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined) {
        throw new CustomError(400, "필수 정보(communityId)가 누락되었습니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const updatedCommunity =
        await this.communityService.endCommunityRecruitment(
          communityId,
          userId
        );

      res.status(200).json({
        status: "success",
        message: "커뮤니티 모집이 성공적으로 종료되었습니다.",
        data: updatedCommunity,
      });
    } catch (error) {
      next(error);
    }
  }

  public deleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.communityService.deleteCommunity(communityId, userId);
      res.status(200).json({
        status: "success",
        message: "커뮤니티 삭제 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;
      const { applicationMessage } = req.body;

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

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
        userId,
        applicationMessage,
      });
      res.status(201).json({ status: "success", message: "가입 신청 완료" });
    } catch (err) {
      next(err);
    }
  };

  public getApplicantsByCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("DEBUG: getCommunityApplicants 컨트롤러가 호출되었습니다.");
      const { communityId: rawCommunityId } = req.params;
      console.log("DEBUG: rawCommunityId:", rawCommunityId);
      const requestingUserId = req.user;

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

      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

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

  public cancelRecruitment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const requestingUserId = req.user;

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
    } catch (err) {
      next(err);
    }
  };

  public getMyParticipatingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const communities =
        await this.communityService.getMyParticipatingCommunities(userId);
      res.status(200).json({
        status: "success",
        message: "참여 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  public leaveOrDeleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!;

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.communityService.leaveOrDeleteCommunity(userId, communityId);
      res.status(200).json({
        status: "success",
        message: "커뮤니티 탈퇴/삭제 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  public getAppliedCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      // ✨추가: 서비스에서 받은 데이터 로그 ✨
      const applications = await this.applicationService.getMyApplications(
        userId
      );
      console.log(
        "[DEBUG - Controller] getAppliedCommunities - Raw applications from service:",
        applications
      );

      res.status(200).json({
        status: "success",
        message: "내가 신청한 커뮤니티 목록 조회 성공",
        data: applications, // 이 데이터가 그대로 프론트로 전송됩니다.
      });
    } catch (err) {
      next(err);
    }
  };

  public getMyRecruitingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const communities =
        await this.communityService.getMyRecruitingCommunities(userId);
      res.status(200).json({
        status: "success",
        message: "내가 모집 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  public getMyEndedCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const communities =
        await this.communityService.findEndedCommunitiesByHostId(userId);
      res.status(200).json({
        status: "success",
        message: "내가 모집 종료한 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  public cancelApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const applicationId = Number(req.params.applicationId);
      const userId = req.user!;

      if (isNaN(applicationId)) {
        throw new CustomError(400, "유효하지 않은 지원서 ID입니다.");
      }

      await this.applicationService.cancelApplication(applicationId, userId);
      res.status(200).json({ message: "지원이 취소되었습니다." });
    } catch (error) {
      next(error);
    }
  };
}
