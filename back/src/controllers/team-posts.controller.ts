// src/controllers/team-posts.controller.ts

import { Request, Response, NextFunction } from "express";
import { TeamPostService } from "../services/team-posts.service";
import { TeamCommentService } from "../services/team-comments.service";
import { TeamPostType } from "@prisma/client";

export class TeamPostController {
  private teamPostService: TeamPostService;
  private teamCommentService: TeamCommentService;

  constructor() {
    this.teamPostService = new TeamPostService();
    this.teamCommentService = new TeamCommentService();
  }

  /**
   * GET /communities/:communityId/posts - 특정 커뮤니티의 게시물 목록 조회
   * 라우트: src/routes/communities.routes.ts
   * communityId: req.params
   * requestingUserId: req.query
   */
  public getTeamPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // communityId는 params에서
      const {
        page,
        size,
        sort,
        requestingUserId: rawRequestingUserId,
      } = req.query; // requestingUserId는 query에서

      if (rawCommunityId === undefined || rawRequestingUserId === undefined) {
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

      const requestingUserId = Number(rawRequestingUserId);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      const teamPosts = await this.teamPostService.findAllTeamPosts(
        communityId,
        {
          page: page ? Number(page) : undefined,
          pageSize: size ? Number(size) : undefined,
          sort: sort ? String(sort) : undefined,
        },
        requestingUserId
      );
      res.status(200).json({
        message: `팀 게시물 ID ${communityId}의 게시물 목록 조회 성공`,
        data: teamPosts,
      });
    } catch (error) {
      console.error("Error in getTeamPosts:", error);
      next(error);
    }
  };

  /**
   * POST /communities/:communityId/posts/write - 특정 커뮤니티에 게시물 작성
   * 라우트: src/routes/communities.routes.ts
   * communityId: req.params
   * userId, title, content, type: req.body
   */
  public createTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId } = req.params; // communityId는 params에서
      const { userId: rawUserId, title, content, type } = req.body; // 나머지는 body에서

      if (
        rawCommunityId === undefined ||
        rawUserId === undefined ||
        title === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 필드(communityId, userId, title, content)가 누락되었습니다.",
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

      if (
        type &&
        !Object.values(TeamPostType).includes(
          type.toUpperCase() as TeamPostType
        )
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 팀 게시물 타입입니다." });
      }

      const newTeamPost = await this.teamPostService.createTeamPost(
        communityId,
        { userId, title, content, type: type?.toUpperCase() as TeamPostType }
      );
      res.status(201).json({
        status: "success",
        message: "팀 게시물 작성 완료",
        postId: newTeamPost.teamPostId,
      });
    } catch (error) {
      console.error("Error in createTeamPost:", error);
      next(error);
    }
  };

  /**
   * GET /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 상세 조회
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * requestingUserId: req.query
   */
  public getTeamPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params; // communityId, teamPostId는 params에서
      const { requestingUserId: rawRequestingUserId } = req.query; // requestingUserId는 query에서

      if (
        rawCommunityId === undefined ||
        rawTeamPostId === undefined ||
        rawRequestingUserId === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, 요청 사용자 ID)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다." });
      }

      const requestingUserId = Number(rawRequestingUserId);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      const teamPost = await this.teamPostService.findTeamPostById(
        teamPostId,
        requestingUserId // communityId는 서비스에서 필요하다면 teamPostId로 조회 가능
      );

      res.status(200).json({
        status: "success",
        message: `팀 게시물 ID ${teamPostId} 상세 조회 성공`,
        data: teamPost,
      });
    } catch (error) {
      console.error("Error in getTeamPostById:", error);
      next(error);
    }
  };

  /**
   * PUT /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 수정
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * title, content, userId: req.body
   */
  public updateTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params; // communityId, teamPostId는 params에서
      const { title, content, userId: rawUserId } = req.body; // 나머지는 body에서

      if (
        rawCommunityId === undefined ||
        rawTeamPostId === undefined ||
        rawUserId === undefined ||
        (!title && !content)
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, userId) 또는 수정할 내용이 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.teamPostService.updateTeamPost(communityId, teamPostId, {
        title,
        content,
        userId,
      });
      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 수정 완료" });
    } catch (error) {
      console.error("Error in updateTeamPost:", error);
      next(error);
    }
  };

  /**
   * DELETE /communities/:communityId/posts/:teamPostId - 특정 팀 게시물 삭제
   * 라우트: src/routes/communities.routes.ts
   * communityId, teamPostId: req.params
   * userId: req.body
   */
  public deleteTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { communityId: rawCommunityId, teamPostId: rawTeamPostId } =
        req.params; // communityId, teamPostId는 params에서
      const { userId: rawUserId } = req.body; // userId는 body에서

      if (
        rawCommunityId === undefined ||
        rawTeamPostId === undefined ||
        rawUserId === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, userId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityId);
      const teamPostId = Number(rawTeamPostId);
      if (isNaN(communityId) || isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 커뮤니티 또는 팀 게시물 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      const deletedCount = await this.teamPostService.deleteTeamPost(
        communityId,
        teamPostId,
        userId
      );

      if (deletedCount === 0) {
        return res.status(404).json({
          status: "error",
          message: "삭제할 팀 게시물을 찾을 수 없거나, 삭제 권한이 없습니다.",
        });
      }

      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 삭제 완료" });
    } catch (error) {
      console.error("Error in deleteTeamPost:", error);
      next(error);
    }
  };

  // --- 댓글 관련 메서드 ---

  /**
   * POST /api/team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
   * 라우트: src/routes/team-posts.routes.ts (index.ts에서 /team-posts로 마운트됨)
   * teamPostId: req.params
   * communityId, userId, content, parentId: req.body
   */
  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params; // teamPostId는 params에서
      const {
        communityId: rawCommunityIdFromBody,
        userId: rawUserId,
        content,
        parentId: rawParentId,
      } = req.body; // communityId, userId 등은 body에서

      if (
        rawCommunityIdFromBody === undefined || // communityId는 body에서 받음
        rawTeamPostId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 필드(communityId, teamPostId, userId, content)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityIdFromBody); // communityId를 body에서 숫자로 변환
      const teamPostId = Number(rawTeamPostId);
      const userId = Number(rawUserId);
      const parentId = rawParentId ? Number(rawParentId) : undefined;

      if (
        isNaN(communityId) ||
        isNaN(teamPostId) ||
        isNaN(userId) ||
        (parentId !== undefined && isNaN(parentId))
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 ID 형식입니다." });
      }

      const newComment = await this.teamCommentService.createComment({
        teamPostId,
        userId,
        content,
        parentId,
      });

      res.status(201).json({
        status: "success",
        message: "댓글 작성 완료",
        data: newComment,
        teamCommentId: newComment.teamCommentId,
      });
    } catch (error) {
      console.error("Error in createComment:", error);
      next(error);
    }
  };

  /**
   * GET /api/team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
   * 라우트: src/routes/team-posts.routes.ts
   * teamPostId: req.params
   * communityId, requestingUserId: req.query
   */
  public getCommentsByTeamPostId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params; // teamPostId는 params에서
      const {
        communityId: rawCommunityIdFromQuery,
        requestingUserId: rawRequestingUserId,
      } = req.query; // communityId, requestingUserId는 query에서

      if (
        rawCommunityIdFromQuery === undefined ||
        rawTeamPostId === undefined ||
        rawRequestingUserId === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, requestingUserId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityIdFromQuery);
      const teamPostId = Number(rawTeamPostId);
      const requestingUserId = Number(rawRequestingUserId);

      if (isNaN(communityId) || isNaN(teamPostId) || isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 ID 형식입니다." });
      }

      const comments = await this.teamCommentService.findCommentsByTeamPostId(
        teamPostId // 서비스는 teamPostId만 받음
      );
      res.status(200).json({
        message: `팀 게시물 ID ${teamPostId}의 댓글 목록 조회 성공`,
        data: comments,
      });
    } catch (error) {
      console.error("Error in getCommentsByTeamPostId:", error);
      next(error);
    }
  };

  /**
   * PUT /api/team-posts/:teamPostId/comments/:commentId - 특정 댓글 수정
   * 라우트: src/routes/team-posts.routes.ts
   * teamPostId, commentId: req.params
   * communityId, userId, content: req.body
   */
  public updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId, commentId: rawCommentId } = req.params; // teamPostId, commentId는 params에서
      const {
        communityId: rawCommunityIdFromBody,
        userId: rawUserId,
        content,
      } = req.body; // communityId, userId, content는 body에서

      if (
        rawCommunityIdFromBody === undefined ||
        rawTeamPostId === undefined ||
        rawCommentId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, commentId, userId, content)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityIdFromBody);
      const teamPostId = Number(rawTeamPostId);
      const commentId = Number(rawCommentId);
      const userId = Number(rawUserId);

      if (
        isNaN(communityId) ||
        isNaN(teamPostId) ||
        isNaN(commentId) ||
        isNaN(userId)
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 ID 형식입니다." });
      }

      const updatedComment = await this.teamCommentService.updateComment(
        commentId,
        userId,
        content
      );
      res.status(200).json({
        status: "success",
        message: "댓글 수정 완료",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error in updateComment:", error);
      next(error);
    }
  };

  /**
   * DELETE /api/team-posts/:teamPostId/comments/:commentId - 특정 댓글 삭제
   * 라우트: src/routes/team-posts.routes.ts
   * teamPostId, commentId: req.params
   * communityId, userId: req.body
   */
  public deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId, commentId: rawCommentId } = req.params; // teamPostId, commentId는 params에서
      const { communityId: rawCommunityIdFromBody, userId: rawUserId } =
        req.body; // communityId, userId는 body에서

      if (
        rawCommunityIdFromBody === undefined ||
        rawTeamPostId === undefined ||
        rawCommentId === undefined ||
        rawUserId === undefined
      ) {
        return res.status(400).json({
          message:
            "필수 정보(communityId, teamPostId, commentId, userId)가 누락되었습니다.",
        });
      }

      const communityId = Number(rawCommunityIdFromBody);
      const teamPostId = Number(rawTeamPostId);
      const commentId = Number(rawCommentId);
      const userId = Number(rawUserId);

      if (
        isNaN(communityId) ||
        isNaN(teamPostId) ||
        isNaN(commentId) ||
        isNaN(userId)
      ) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 ID 형식입니다." });
      }

      await this.teamCommentService.deleteComment(commentId, userId);
      res.status(200).json({ status: "success", message: "댓글 삭제 완료" });
    } catch (error) {
      console.error("Error in deleteComment:", error);
      next(error);
    }
  };
}
