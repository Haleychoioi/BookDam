// src/controllers/communities.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommunityService } from "../services/communities.service";
import { CommunityStatus, TeamCommunity } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";
import { bookService } from "../services/book.service";

interface CommunityWithMemberInfo extends TeamCommunity {
  currentMembers: number;
  maxMembers: number;
  hostId: number; // hostId 추가
}

// ✨ 파일 로드 시점에 찍히는 로그 ✨
console.log("CommunityController: File loaded and initialized.");

export class CommunityController {
  [x: string]: any;
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
    console.log("CommunityController: Constructor called."); // ✨ 생성자 호출 시점 로그 ✨
  }

  /**
   * GET /mypage/communities/recruiting - 내가 모집 중인 커뮤니티 목록 조회
   */
  public getMyRecruitingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("DEBUG: getMyRecruitingCommunities 라우터가 호출되었습니다.");
    try {
      const userId = req.user!;
      console.log("Controller (Recruiting): User ID from token:", userId);

      console.log(
        "Controller (Recruiting): About to call service.getMyRecruitingCommunities."
      );
      // communities 변수의 명시적 타입 지정을 제거했습니다.
      const communities =
        await this.communityService.getMyRecruitingCommunities(userId);
      console.log(
        "Controller (Recruiting): Service call completed, communities variable assigned."
      ); // ✨ 이 로그가 찍히는지 확인 ✨

      // ✨ 클라이언트로 전송될 데이터의 상세 로그 ✨
      console.log(
        "컨트롤러에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터 (전체 객체):",
        communities
      );
      console.log(
        "컨트롤러에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터 (길이):",
        communities.length
      );
      if (communities.length > 0) {
        console.log(
          "컨트롤러에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터 (첫 번째 항목):",
          communities[0]
        );
      }
      console.log("Controller (Recruiting): About to send response."); // ✨ 응답 직전 로그 ✨

      res.status(200).json({
        message: "내가 모집 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (error) {
      console.error(
        "getMyRecruitingCommunities 컨트롤러에서 오류 발생 (catch 블록):", // ✨ 오류 로그 개선 ✨
        error
      );
      next(error);
    }
  };

  /**
   * GET /mypage/communities/participating - 현재 참여 중인 커뮤니티 목록 조회
   */
  public getMyParticipatingCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log(
      "CommunityController: getMyParticipatingCommunities method entered."
    ); // ✨ 메서드 진입점 로그 ✨
    try {
      const userId = req.user!;
      console.log("Controller (Participating): User ID from token:", userId);

      const communities =
        await this.communityService.getMyParticipatingCommunities(userId);

      console.log("Controller (Participating): Service call completed.");
      console.log(
        "컨트롤러에서 클라이언트로 전송될 내가 참여 중인 커뮤니티 데이터 (전체 객체):",
        communities
      );

      res.status(200).json({
        message: "내가 참여 중인 커뮤니티 목록 조회 성공",
        data: communities,
      });
    } catch (error) {
      console.error(
        "getMyParticipatingCommunities 컨트롤러에서 오류 발생:",
        error
      ); // ✨ 개선된 오류 로그 ✨
      next(error);
    }
  };

  public leaveOrDeleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!;
      const communityId = Number(req.params.communityId);

      if (isNaN(communityId)) {
        throw new CustomError(400, "유효하지 않은 커뮤니티 ID입니다.");
      }

      const message = await this.communityService.leaveOrDeleteCommunity(
        userId,
        communityId
      );

      res.status(200).json({ message });
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
    console.log("CommunityController: getCommunities method entered."); // ✨ 메서드 진입점 로그 ✨
    try {
      const { page, pageSize, sort } = req.query;
      const communities = await this.communityService.findAllCommunities({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        sort: sort ? String(sort) : undefined,
      });

      console.log(
        "컨트롤러에서 클라이언트로 전송될 모든 커뮤니티 데이터:",
        communities
      );

      res
        .status(200)
        .json({ message: "커뮤니티 목록 조회 성공", data: communities });
    } catch (error) {
      console.error("getCommunities 컨트롤러에서 오류 발생:", error); // ✨ 개선된 오류 로그 ✨
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
    console.log("CommunityController: createCommunity method entered."); // ✨ 메서드 진입점 로그 ✨
    try {
      const userId = req.user;
      const { isbn13, title, content, maxMembers: rawMaxMembers } = req.body; // 인증된 사용자 ID가 없는 경우
      console.log("컨트롤러에서 수신한 req.body (createCommunity):", req.body); // ✨ req.body 로그 ✨

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
      console.error("createCommunity 컨트롤러에서 오류 발생:", error); // ✨ 개선된 오류 로그 ✨
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
    console.log("CommunityController: getCommunitiesByBook method entered."); // ✨ 메서드 진입점 로그 ✨
    try {
      const { itemId } = req.params;
      console.log("Controller (ByBook): itemId:", itemId);

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

      console.log(
        "컨트롤러에서 클라이언트로 전송될 특정 도서 관련 커뮤니티 데이터:",
        communities
      );

      res.status(200).json({
        message: `도서 ID ${itemId} 관련 커뮤니티 목록 조회 성공`,
        data: communities,
      });
    } catch (error) {
      console.error("getCommunitiesByBook 컨트롤러에서 오류 발생:", error); // ✨ 개선된 오류 로그 ✨
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
      console.log(
        `DEBUG: getCommunityById 라우터가 호출되었습니다. communityId: ${rawCommunityId}`
      ); // 이 줄 추가
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
      console.error("getCommunityById 컨트롤러에서 오류 발생:", error); // ✨ 개선된 오류 로그 ✨
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
    console.log("CommunityController: updateCommunityDetails method entered.");
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;
      const updateData = req.body;

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

      const validUpdateKeys = ["recruiting", "title", "content", "maxMembers"];
      const hasValidUpdateData = Object.keys(updateData).some((key) =>
        validUpdateKeys.includes(key)
      );

      if (!hasValidUpdateData) {
        throw new CustomError(
          400,
          "업데이트할 유효한 필드가 제공되지 않았습니다."
        );
      }

      if (
        updateData.recruiting !== undefined &&
        typeof updateData.recruiting !== "boolean"
      ) {
        throw new CustomError(
          400,
          "recruiting 필드는 boolean 타입이어야 합니다."
        );
      }

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
      console.error("updateCommunityDetails 컨트롤러에서 오류 발생:", error);
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
   * DELETE /communities/:communityId - 커뮤니티 삭제
   */

  public deleteCommunity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("CommunityController: deleteCommunity method entered.");
    try {
      const { communityId: rawCommunityId } = req.params;
      const userId = req.user;

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
      console.error("deleteCommunity 컨트롤러에서 오류 발생:", error);
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

  public endRecruitment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params;
      const communityId = Number(rawCommunityId);

      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      // 서비스 계층 호출
      await this.communityService.updateCommunityStatus(
        communityId,
        CommunityStatus.CLOSED,
        req.user!
      ); // req.user는 인증 미들웨어에서 추가됩니다.

      res
        .status(200)
        .json({ message: "커뮤니티 모집이 성공적으로 종료되었습니다." });
    } catch (error) {
      next(error);
    }
  };

  public getMyEndedCommunities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!; // 로그인된 사용자 ID 가져오기
      const endedCommunities =
        await this.communityService.findEndedCommunitiesByHostId(userId);
      res.status(200).json({
        message: "모집 종료된 커뮤니티 목록 조회 성공",
        data: endedCommunities,
      });
    } catch (error) {
      next(error);
    }
  };
}
