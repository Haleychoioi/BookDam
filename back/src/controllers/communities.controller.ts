// src/controllers/communities.controller.ts

import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/applications.service";
import { CommunityService } from "../services/communities.service";
import { CustomError } from "../middleware/error-handing-middleware";
import { CommunityStatus } from "@prisma/client"; // CommunityStatus 임포트 추가

export class CommunityController {
  private communityService: CommunityService;
  private applicationService: ApplicationService;

  constructor() {
    this.communityService = new CommunityService();
    this.applicationService = new ApplicationService();
  }

  // 모든 커뮤니티 목록 조회
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
        : undefined; // userId를 req.query에서 가져옴

      const communities = await this.communityService.findAllCommunities({
        page,
        pageSize,
        sort,
        userId, // userId를 query 객체에 포함하여 전달
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

  // 도서 ISBN13으로 커뮤니티 조회
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
        // ✨ 메서드명 수정 ✨
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

  // 커뮤니티 생성
  public createCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { isbn13, title, content, maxMembers } = req.body;
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      const newCommunity = await this.communityService.createCommunity({
        // ✨ 수정: 단일 객체 인자로 변경 ✨
        userId,
        isbn13,
        title,
        content,
        maxMembers,
      });

      res.status(201).json({
        status: "success",
        message: "커뮤니티 생성 성공",
        communityId: newCommunity.teamId, // communityId는 반환된 객체에서 가져옴
      });
    } catch (err) {
      next(err);
    }
  };

  // 특정 커뮤니티 상세 조회
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

  // 커뮤니티 상세 업데이트
  public updateCommunityDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const updateData = req.body;
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

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

  // 커뮤니티 상태 업데이트
  public updateCommunityStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { newStatus } = req.body;
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

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

  // 모집 종료 로직 (PATCH /api/mypage/communities/:communityId/end-recruitment)
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

      // ✨ communityService의 새로운 메서드를 호출 ✨
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

  // 커뮤니티 삭제
  public deleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

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

  // 커뮤니티 가입 신청
  public createApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { applicationMessage } = req.body;
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.applicationService.createApplication(communityId, {
        userId,
        applicationMessage,
      });
      res.status(201).json({
        status: "success",
        message: "커뮤니티 가입 신청 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  // 특정 모집 커뮤니티의 신청자 목록 상세 조회
  public getApplicantsByCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      const applicants =
        await this.applicationService.findApplicantsByCommunity(
          communityId,
          userId
        );
      res.status(200).json({
        status: "success",
        message: `커뮤니티 ID ${communityId}의 신청자 목록 조회 성공`,
        applicants: applicants,
      });
    } catch (err) {
      next(err);
    }
  };

  // 신청 수락/거절
  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const applicantUserId = parseInt(req.params.userId);
      const { status: newStatus } = req.body;
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.applicationService.updateApplicationStatus(
        communityId,
        applicantUserId,
        newStatus,
        userId
      );
      res.status(200).json({
        status: "success",
        message: "신청 상태 업데이트 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  // 모집 취소
  public cancelRecruitment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.applicationService.cancelRecruitment(communityId, userId); // ✨ 수정: ApplicationService의 메서드 호출 ✨
      res.status(200).json({
        status: "success",
        message: "모집 취소 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  // 현재 참여 중인 커뮤니티 목록 조회
  public getMyParticipatingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨
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

  // 참여 커뮤니티 탈퇴/삭제
  public leaveOrDeleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.communityService.leaveOrDeleteCommunity(communityId, userId);
      res.status(200).json({
        status: "success",
        message: "커뮤니티 탈퇴/삭제 성공",
      });
    } catch (err) {
      next(err);
    }
  };

  // 내가 신청한 커뮤니티 목록 조회
  public getAppliedCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const applications = await this.applicationService.getMyApplications(
        userId
      );
      res.status(200).json({
        status: "success",
        message: "내가 신청한 커뮤니티 목록 조회 성공",
        data: applications,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내가 모집 중인 커뮤니티 목록 조회
  public getMyRecruitingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const communities =
        await this.communityService.getMyRecruitingCommunities(
          // ✨ 수정: 메서드명 변경 ✨
          userId
        );
      res.status(200).json({
        status: "success",
        message: "내가 모집 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내가 모집 종료한 커뮤니티 목록 조회
  public getMyEndedCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨
      if (!userId) {
        throw new CustomError(401, "Need login");
      }
      const communities =
        await this.communityService.findEndedCommunitiesByHostId(userId); // ✨ 수정: 메서드명 변경 ✨
      res.status(200).json({
        status: "success",
        message: "내가 모집 종료한 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (err) {
      next(err);
    }
  };

  // 신청 취소
  public cancelApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const userId = req.user!; // ✨ 수정: userId로 직접 접근 ✨

      if (!userId) {
        throw new CustomError(401, "Need login");
      }

      await this.applicationService.cancelApplication(applicationId, userId);
      res.status(200).json({
        status: "success",
        message: "신청 취소 성공",
      });
    } catch (err) {
      next(err);
    }
  };
}