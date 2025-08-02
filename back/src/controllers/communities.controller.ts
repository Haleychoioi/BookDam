// src/controllers/communities.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommunityService } from "../services/communities.service";
import { CommunityStatus } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";
import { bookService } from "../services/book.service";

export class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

  public getMyRecruitingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!

      const communities = await this.communityService.getMyRecruitingCommunities(userId);

      res.status(200).json({
        message: "내가 모집 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyParticipatingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;

      const communities =await this.communityService.getMyParticipatingCommunities(userId);

      res.status(200).json({
        message: "내가 참여 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /communities - 커뮤니티 목록 조회
   */

  public getCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, pageSize, sort } = req.query;
      const communities = await this.communityService.findAllCommunities({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        sort: sort ? String(sort) : undefined,
      });
      res
        .status(200)
        .json({ message: "커뮤니티 목록 조회 성공", data: communities });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No communities found") {
          next(new CustomError(404, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * POST /communities - 도서 기반 커뮤니티 생성
   */

  public createCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user;
      const { isbn13, title, content, maxMembers: rawMaxMembers } = req.body; // 인증된 사용자 ID가 없는 경우

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (
        isbn13 === undefined ||
        title === undefined ||
        content === undefined ||
        rawMaxMembers === undefined
      ) {
        throw new CustomError(
          400,
          "필수 필드(isbn13, title, content, maxMembers)가 누락되었습니다."
        );
      }

      const maxMembers = Number(rawMaxMembers);
      if (isNaN(maxMembers) || maxMembers <= 0) {
        throw new CustomError(400, "유효한 최대 인원(maxMembers)이 아닙니다.");
      }

      await bookService.getBookDetail(isbn13);

      const newCommunity = await this.communityService.createCommunity({
        userId,
        isbn13,
        title,
        content,
        maxMembers,
      });
      res.status(201).json({
        status: "success",
        message: "커뮤니티 생성 완료",
        communityId: newCommunity.teamId,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          next(new CustomError(404, error.message));
        } else if (error.message === "Book not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Community with this ISBN already exists"
        ) {
          next(new CustomError(409, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * GET /books/:itemId/communities - 특정 도서 관련 커뮤니티 목록 조회
   */

  public getCommunitiesByBook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { itemId } = req.params;

      if (!itemId) {
        throw new CustomError(400, "도서 ID(ISBN13)가 필요합니다.");
      }

      const { size: rawSize } = req.query;
      const size = rawSize ? Number(rawSize) : undefined;
      if (rawSize !== undefined && isNaN(size as number)) {
        throw new CustomError(400, "유효한 size 값이 아닙니다.");
      }

      const communities = await this.communityService.findCommunitiesByBook(
        itemId,
        { size }
      );
      res.status(200).json({
        message: `도서 ID ${itemId} 관련 커뮤니티 목록 조회 성공`,
        data: communities,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Book not found") {
          next(new CustomError(404, error.message));
        } else if (error.message === "No communities found for this book") {
          next(new CustomError(404, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * GET /communities/:communityId - 특정 커뮤니티 상세 조회
   */

  public getCommunityById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;

      if (!rawCommunityId) {
        throw new CustomError(400, "커뮤니티 ID가 필요합니다.");
      }
      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const community = await this.communityService.findCommunityById(
        communityId
      );
      res.status(200).json({
        message: `커뮤니티 ID ${communityId} 상세 정보 조회 성공`,
        data: community,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * PUT /communities/:communityId - 특정 커뮤니티 상세 정보 업데이트
   */

  public updateCommunityDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;
      const updateData = req.body; // 인증된 사용자 ID가 없는 경우

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      } // 필수 필드 및 타입 유효성 검사

      if (rawCommunityId === undefined) {
        throw new CustomError(400, "필수 정보(communityId)가 누락되었습니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      } // updateData에 유효한 필드가 있는지 확인

      const validUpdateKeys = ["recruiting", "title", "content", "maxMembers"];
      const hasValidUpdateData = Object.keys(updateData).some((key) =>
        validUpdateKeys.includes(key)
      );

      if (!hasValidUpdateData) {
        throw new CustomError(
          400,
          "업데이트할 유효한 필드가 제공되지 않았습니다."
        );
      } // recruiting 필드가 있다면 boolean 타입인지 확인

      if (
        updateData.recruiting !== undefined &&
        typeof updateData.recruiting !== "boolean"
      ) {
        throw new CustomError(
          400,
          "recruiting 필드는 boolean 타입이어야 합니다."
        );
      } // maxMembers 필드가 있다면 숫자 타입인지 확인

      if (updateData.maxMembers !== undefined) {
        updateData.maxMembers = Number(updateData.maxMembers);
        if (isNaN(updateData.maxMembers) || updateData.maxMembers <= 0) {
          throw new CustomError(
            400,
            "유효한 최대 인원(maxMembers)이 아닙니다."
          );
        }
      }

      const updatedCommunity =
        await this.communityService.updateCommunityDetails(
          communityId,
          userId,
          updateData
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 정보 업데이트 완료",
        data: updatedCommunity,
      });
    } catch (error) {
      console.error("Error in updateCommunityDetails:", error);
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: Only the community creator can update details."
        ) {
          next(new CustomError(403, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * PUT /communities/:communityId/status - 커뮤니티 상태 업데이트
   */

  public updateCommunityStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;
      const { newStatus } = req.body; // 인증된 사용자 ID가 없는 경우

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined || newStatus === undefined) {
        throw new CustomError(
          400,
          "필수 정보(communityId, newStatus)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      if (
        !Object.values(CommunityStatus).includes(
          newStatus.toUpperCase() as CommunityStatus
        )
      ) {
        throw new CustomError(400, "유효하지 않은 커뮤니티 상태입니다.");
      }

      const updatedCommunity =
        await this.communityService.updateCommunityStatus(
          communityId,
          newStatus.toUpperCase() as CommunityStatus,
          userId
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 상태 업데이트 완료",
        data: updatedCommunity,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: Only the community creator can change status."
        ) {
          next(new CustomError(403, error.message));
        } else if (error.message === "Invalid status transition") {
          next(new CustomError(400, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
  /**
   * DELETE /communities/:communityId - 커뮤니티 삭제
   */

  public deleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user; // 인증된 사용자 ID가 없는 경우

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined) {
        throw new CustomError(400, "필수 정보(communityId)가 누락되었습니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      await this.communityService.deleteCommunity(communityId, userId);
      res
        .status(200)
        .json({ status: "success", message: "커뮤니티 삭제 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: Only the community creator can delete the community."
        ) {
          next(new CustomError(403, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
}
