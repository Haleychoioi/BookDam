// src/controllers/team-comments.controller.ts

import { Request, Response, NextFunction } from "express";
import { TeamCommentService } from "../services/team-comments.service"; // TeamCommentService를 import합니다.

export class TeamCommentController {
  private teamCommentService: TeamCommentService;

  constructor() {
    this.teamCommentService = new TeamCommentService();
  }

  /**
   * GET /team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회
   */
  public getTeamCommentsByTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params; // 팀 게시물 ID
      // NOTE: requestingUserId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받고, 팀 멤버 권한 확인
      const {
        page,
        size,
        sort,
        requestingUserId: rawRequestingUserId,
      } = req.query; // 쿼리 파라미터 (page, size, sort, requestingUserId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (rawTeamPostId === undefined || rawRequestingUserId === undefined) {
        return res
          .status(400)
          .json({
            message:
              "필수 정보(팀 게시물 ID, 요청 사용자 ID)가 누락되었습니다.",
          });
      }

      const teamPostId = Number(rawTeamPostId);
      if (isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 팀 게시물 ID가 아닙니다." });
      }

      const requestingUserId = Number(rawRequestingUserId);
      if (isNaN(requestingUserId)) {
        return res
          .status(400)
          .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
      }

      const teamComments =
        await this.teamCommentService.findTeamCommentsByTeamPost(
          teamPostId,
          {
            page: page ? Number(page) : undefined,
            pageSize: size ? Number(size) : undefined,
            sort: sort ? String(sort) : undefined,
          },
          requestingUserId
        ); // 서비스 계층으로 requestingUserId 전달
      res.status(200).json({
        message: `팀 게시물 ID ${teamPostId}의 댓글 목록 조회 성공`,
        data: teamComments,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 작성
   */
  public createTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params; // 팀 게시물 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받고, 팀 멤버 권한 확인
      const { userId: rawUserId, content, parentId: rawParentId } = req.body; // 요청 바디 (userId, content, parentId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamPostId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res
          .status(400)
          .json({
            message:
              "필수 필드(팀 게시물 ID, 사용자 ID, 내용)가 누락되었습니다.",
          });
      }

      const teamPostId = Number(rawTeamPostId);
      if (isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 팀 게시물 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      const parentId = rawParentId ? Number(rawParentId) : undefined;
      if (rawParentId !== undefined && isNaN(parentId as number)) {
        return res
          .status(400)
          .json({ message: "유효한 부모 댓글 ID(parentId)가 아닙니다." });
      }

      const newTeamComment = await this.teamCommentService.createTeamComment(
        teamPostId,
        { userId, content, parentId }
      );
      res.status(201).json({
        status: "success",
        message: "팀 댓글 작성 완료",
        teamCommentId: newTeamComment.teamCommentId, // 생성된 팀 댓글 ID 반환
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /team-comments/:id - 특정 팀 댓글 수정
   */
  public updateTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawTeamCommentId } = req.params; // 팀 댓글 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 댓글인지 확인해야 합니다.
      const { content, userId: rawUserId } = req.body; // 요청 바디 (content, userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamCommentId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res
          .status(400)
          .json({
            message:
              "필수 정보(팀 댓글 ID, 사용자 ID) 또는 수정할 내용이 누락되었습니다.",
          });
      }

      const teamCommentId = Number(rawTeamCommentId);
      if (isNaN(teamCommentId)) {
        return res
          .status(400)
          .json({ message: "유효한 팀 댓글 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.teamCommentService.updateTeamComment(teamCommentId, {
        content,
        userId,
      });
      res.status(200).json({ status: "success", message: "팀 댓글 수정 완료" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /team-comments/:id - 특정 팀 댓글 삭제
   */
  public deleteTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawTeamCommentId } = req.params; // 팀 댓글 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 댓글인지 확인해야 합니다.
      const { userId: rawUserId } = req.body; // 요청 바디 (userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (rawTeamCommentId === undefined || rawUserId === undefined) {
        return res
          .status(400)
          .json({
            message: "필수 정보(팀 댓글 ID, 사용자 ID)가 누락되었습니다.",
          });
      }

      const teamCommentId = Number(rawTeamCommentId);
      if (isNaN(teamCommentId)) {
        return res
          .status(400)
          .json({ message: "유효한 팀 댓글 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.teamCommentService.deleteTeamComment(teamCommentId, userId);
      res.status(200).json({ status: "success", message: "팀 댓글 삭제 완료" });
    } catch (error) {
      next(error);
    }
  };
}
