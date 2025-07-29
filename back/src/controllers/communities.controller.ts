// src/controllers/communities.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommunityService } from "../services/communities.service";
import { CommunityStatus } from "@prisma/client";

export class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

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
      next(error);
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
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아야 합니다.
      const {
        userId: rawUserId,
        bookIsbn13,
        title,
        content,
        maxMembers: rawMaxMembers,
      } = req.body;

      // 필수 필드 및 타입 유효성 검사
      if (
        rawUserId === undefined ||
        title === undefined ||
        content === undefined ||
        rawMaxMembers === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 필드(userId, title, content, maxMembers)가 누락되었습니다.",
        });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      const maxMembers = Number(rawMaxMembers);
      if (isNaN(maxMembers) || maxMembers <= 0) {
        return res
          .status(400)
          .json({ message: "유효한 최대 인원(maxMembers)이 아닙니다." });
      }

      const newCommunity = await this.communityService.createCommunity({
        userId,
        bookIsbn13,
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
      next(error);
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
      const { itemId } = req.params; // 도서 ISBN13

      if (!itemId) {
        return res
          .status(400)
          .json({ message: "도서 ID(ISBN13)가 필요합니다." });
      }

      const { size: rawSize } = req.query;
      const size = rawSize ? Number(rawSize) : undefined;
      if (rawSize !== undefined && isNaN(size as number)) {
        // rawSize가 존재하는데 숫자가 아닐 경우
        return res.status(400).json({ message: "유효한 size 값이 아닙니다." });
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
      next(error);
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
        return res.status(400).json({ message: "커뮤니티 ID가 필요합니다." });
      }
      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const community = await this.communityService.findCommunityById(
        communityId
      );
      res.status(200).json({
        message: `커뮤니티 ID ${communityId} 상세 정보 조회 성공`,
        data: community,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /communities/:communityId - 특정 커뮤니티 상세 정보 업데이트 (recruiting 포함)
   */
  public updateCommunityDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const { userId: rawUserId, ...updateData } = req.body; // userId는 권한 확인용, 나머지는 업데이트 데이터

      // 필수 필드 및 타입 유효성 검사
      if (rawCommunityId === undefined || rawUserId === undefined) {
        return res.status(400).json({
          message: "필수 정보(communityId, userId)가 누락되었습니다.",
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
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      // updateData에 유효한 필드가 있는지 확인 (recruiting, title, content, maxMembers 등)
      const validUpdateKeys = ["recruiting", "title", "content", "maxMembers"];
      const hasValidUpdateData = Object.keys(updateData).some((key) =>
        validUpdateKeys.includes(key)
      );

      if (!hasValidUpdateData) {
        return res
          .status(400)
          .json({ message: "업데이트할 유효한 필드가 제공되지 않았습니다." });
      }

      // recruiting 필드가 있다면 boolean 타입인지 확인
      if (
        updateData.recruiting !== undefined &&
        typeof updateData.recruiting !== "boolean"
      ) {
        return res
          .status(400)
          .json({ message: "recruiting 필드는 boolean 타입이어야 합니다." });
      }

      // maxMembers 필드가 있다면 숫자 타입인지 확인
      if (updateData.maxMembers !== undefined) {
        updateData.maxMembers = Number(updateData.maxMembers); // 숫자로 변환
        if (isNaN(updateData.maxMembers) || updateData.maxMembers <= 0) {
          return res
            .status(400)
            .json({ message: "유효한 최대 인원(maxMembers)이 아닙니다." });
        }
      }

      const updatedCommunity =
        await this.communityService.updateCommunityDetails(
          communityId,
          userId,
          // maxMembers는 서비스 계층에서 Post 모델의 recruitmentPost.maxMembers를 업데이트합니다.
          // recruiting은 서비스 계층에서 CommunityStatus와 Post 모델의 recruitmentStatus를 업데이트합니다.
          updateData
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 정보 업데이트 완료",
        data: updatedCommunity,
      });
    } catch (error) {
      console.error("Error in updateCommunityDetails:", error);
      next(error);
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
      const { newStatus, requestingUserId: rawRequestingUserId } = req.body; // requestingUserId는 권한 확인용으로 임시로 body에서 받음

      if (
        rawCommunityId === undefined ||
        newStatus === undefined ||
        rawRequestingUserId === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, newStatus, requestingUserId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const requestingUserId = Number(rawRequestingUserId);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      if (
        !Object.values(CommunityStatus).includes(
          newStatus.toUpperCase() as CommunityStatus
        )
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 커뮤니티 상태입니다." });
      }

      const updatedCommunity =
        await this.communityService.updateCommunityStatus(
          communityId,
          newStatus.toUpperCase() as CommunityStatus,
          requestingUserId
        );
      res.status(200).json({
        status: "success",
        message: "커뮤니티 상태 업데이트 완료",
        data: updatedCommunity,
      });
    } catch (error) {
      next(error);
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
      const { requestingUserId: rawRequestingUserId } = req.body; // requestingUserId는 권한 확인용으로 임시로 body에서 받음

      if (rawCommunityId === undefined || rawRequestingUserId === undefined) {
        return res.status(400).json({
          message: "필수 정보(communityId, requestingUserId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 ID가 아닙니다." });
      }

      const requestingUserId = Number(rawRequestingUserId);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      await this.communityService.deleteCommunity(
        communityId,
        requestingUserId
      );
      res
        .status(200)
        .json({ status: "success", message: "커뮤니티 삭제 완료" });
    } catch (error) {
      next(error);
    }
  };
}
