// src/controllers/team-posts.controller.ts

import { Request, Response, NextFunction } from "express";
import { TeamPostService } from "../services/team-posts.service";
// TeamCommentService는 이 컨트롤러에서 직접 댓글 관련 로직을 처리하지 않으므로 제거합니다.
// import { TeamCommentService } from "../services/team-comments.service";
import { TeamPostType } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

export class TeamPostController {
  private teamPostService: TeamPostService;
  // private teamCommentService: TeamCommentService; // 제거

  constructor() {
    this.teamPostService = new TeamPostService();
    // this.teamCommentService = new TeamCommentService(); // 제거
  }

  /**
   * GET /communities/:communityId/posts - 특정 커뮤니티의 게시물 목록 조회
   * 라우트: src/routes/communities.routes.ts
   * communityId: req.params
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   */
  public getTeamPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // communityId는 params에서
      const { page, size, sort } = req.query;
      const requestingUserId = req.user; // req.user에서 requestingUserId 가져오기

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

      const parsedPage = page ? Number(page) : undefined;
      const parsedPageSize = size ? Number(size) : undefined;
      const parsedSort = sort ? String(sort) : undefined;

      const teamPosts = await this.teamPostService.findAllTeamPosts(
        communityId,
        {
          page: parsedPage,
          pageSize: parsedPageSize,
          sort: parsedSort,
        },
        requestingUserId
      );
      res.status(200).json({
        message: `팀 게시물 ID ${communityId}의 게시물 목록 조회 성공`,
        data: teamPosts,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Unauthorized: You are not a member of this team."
        ) {
          next(new CustomError(403, error.message));
        } else if (
          error.message === "No team posts found for this community."
        ) {
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
   * POST /communities/:communityId/posts/write - 특정 커뮤니티에 게시물 작성
   * 라우트: src/routes/communities.routes.ts
   * communityId: req.params
   * userId: req.user (인증 미들웨어에서 주입)
   * title, content, type: req.body
   */
  public createTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // communityId는 params에서
      const userId = req.user; // req.user에서 userId 가져오기

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      const { title, content, type } = req.body; // 나머지는 body에서

      if (
        rawCommunityId === undefined ||
        title === undefined ||
        content === undefined
      ) {
        throw new CustomError(
          400,
          "필수 필드(communityId, title, content)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      // type이 제공된 경우 유효성 검사
      const upperCaseType = type ? type.toUpperCase() : TeamPostType.DISCUSSION;
      if (!Object.values(TeamPostType).includes(upperCaseType)) {
        throw new CustomError(400, "유효하지 않은 팀 게시물 타입입니다.");
      }

      const newTeamPost = await this.teamPostService.createTeamPost(
        communityId,
        { userId, title, content, type: upperCaseType }
      );
      res.status(201).json({
        status: "success",
        message: "팀 게시물 작성 완료",
        postId: newTeamPost.teamPostId,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Community not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Unauthorized: You are not a member of this team."
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
   * GET /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   */
  public getTeamPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params;
      const requestingUserId = req.user; // req.user에서 requestingUserId 가져오기

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined || rawTeamPostId === undefined) {
        throw new CustomError(
          400,
          "필수 정보(communityId, teamPostId)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        throw new CustomError(
          400,
          "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다."
        );
      }

      const teamPost = await this.teamPostService.findTeamPostById(
        communityId,
        teamPostId,
        requestingUserId
      );

      res.status(200).json({
        status: "success",
        message: `팀 게시물 ID ${teamPostId} 상세 조회 성공`,
        data: teamPost,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message ===
          "Team Post not found or does not belong to this community."
        ) {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Unauthorized: You are not a member of this team."
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
   * PUT /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * userId: req.user (인증 미들웨어에서 주입)
   * title, content: req.body
   */
  public updateTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params;
      const userId = req.user; // req.user에서 userId 가져오기

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      const { title, content } = req.body;

      if (
        rawCommunityId === undefined ||
        rawTeamPostId === undefined ||
        (!title && !content)
      ) {
        throw new CustomError(
          400,
          "필수 정보(communityId, teamPostId) 또는 수정할 내용이 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        throw new CustomError(
          400,
          "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다."
        );
      }

      // 서비스 계층의 updateTeamPost는 communityId, teamPostId, userId, updateData를 받습니다.
      // updateData는 { title?: string, content?: string } 형태의 객체입니다.
      await this.teamPostService.updateTeamPost(
        communityId,
        teamPostId,
        userId,
        { title, content } // 이 부분이 서비스 메서드의 인자 타입과 일치해야 합니다.
      );
      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 수정 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message ===
          "Team Post not found or does not belong to this community."
        ) {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only update your own team posts or be a team leader."
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
   * DELETE /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * requestingUserId: req.user (인증 미들웨어에서 주입)
   */
  public deleteTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params;
      const requestingUserId = req.user; // req.user에서 requestingUserId 가져오기

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      if (rawCommunityId === undefined || rawTeamPostId === undefined) {
        throw new CustomError(
          400,
          "필수 정보(communityId, teamPostId)가 누락되었습니다."
        );
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        throw new CustomError(
          400,
          "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다."
        );
      }

      // 서비스 계층에서 삭제 실패 시 CustomError를 던지므로, 별도의 deletedCount 확인 로직은 불필요합니다.
      await this.teamPostService.deleteTeamPost(
        communityId,
        teamPostId,
        requestingUserId
      );

      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 삭제 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message ===
          "Team Post not found or does not belong to this community."
        ) {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only delete your own team posts or be a team leader."
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

  // --- 댓글 관련 메서드 (이 컨트롤러에서는 제거) ---
  // 이 메서드들은 team-comments.controller.ts에서 관리됩니다.
  // public createComment = async ( ... ) => { ... };
  // public getCommentsByTeamPostId = async ( ... ) => { ... };
  // public updateComment = async ( ... ) => { ... };
  // public deleteComment = async ( ... ) => { ... };
}
