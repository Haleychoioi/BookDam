// src/controllers/team-comments.controller.ts

import { Request, Response, NextFunction } from "express";
import { TeamCommentService } from "../services/team-comments.service";

export class TeamCommentController {
  private teamCommentService: TeamCommentService;

  constructor() {
    this.teamCommentService = new TeamCommentService();
  }

  /**
   * GET /team-posts/:teamPostId/comments - 특정 팀 게시물의 댓글 목록 조회 (최상위 댓글 및 1단계 대댓글 포함)
   */
  public getTeamCommentsByTeamPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params;

      // NOTE: 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아 사용합니다.
      // 여기서는 예시를 위해 쿼리 파라미터에서 받지만, 실제 프로덕션에서는 보안상 적절하지 않습니다.
      const { requestingUserId: rawRequestingUserId } = req.query;

      // 필수 필드 및 타입 유효성 검사
      if (rawTeamPostId === undefined) {
        return res
          .status(400)
          .json({ message: "필수 정보(팀 게시물 ID)가 누락되었습니다." });
      }

      const teamPostId = Number(rawTeamPostId);
      if (isNaN(teamPostId)) {
        return res
          .status(400)
          .json({ message: "유효한 팀 게시물 ID가 아닙니다." });
      }

      // requestingUserId는 현재 서비스 계층에서 사용되지 않으므로, 유효성 검사만 수행하고 전달하지 않습니다.
      if (rawRequestingUserId !== undefined) {
        const requestingUserId = Number(rawRequestingUserId);
        if (isNaN(requestingUserId)) {
          return res
            .status(400)
            .json({ message: "유효한 요청 사용자 ID가 아닙니다." });
        }
      }

      // 서비스 계층의 findCommentsByTeamPostId는 이제 추가 쿼리 파라미터나 requestingUserId를 받지 않습니다.
      const teamComments =
        await this.teamCommentService.findCommentsByTeamPostId(teamPostId);

      res.status(200).json({
        message: `팀 게시물 ID ${teamPostId}의 댓글 목록 조회 성공`,
        data: teamComments,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 또는 대댓글 작성
   */
  public createTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params;
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아 사용합니다.
      const { userId: rawUserId, content, parentId: rawParentId } = req.body;

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamPostId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
          message: "필수 필드(팀 게시물 ID, 사용자 ID, 내용)가 누락되었습니다.",
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

      // 서비스 계층의 createComment는 단일 객체를 받습니다.
      const newTeamComment = await this.teamCommentService.createComment({
        teamPostId,
        userId,
        content,
        parentId, // parentId를 포함하여 전달
      });

      res.status(201).json({
        status: "success",
        message: "팀 댓글 작성 완료",
        teamCommentId: newTeamComment.teamCommentId,
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
      const { id: rawTeamCommentId } = req.params;
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져와야 합니다.
      const { content, userId: rawUserId } = req.body;

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamCommentId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
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

      // 서비스 계층의 updateComment는 teamCommentId, userId, content를 개별 인자로 받습니다.
      await this.teamCommentService.updateComment(
        teamCommentId,
        userId,
        content
      );

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
      const { id: rawTeamCommentId } = req.params;
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져와야 합니다.
      const { userId: rawUserId } = req.body;

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

      // 서비스 계층의 deleteComment는 삭제된 레코드 수를 반환합니다.
      const deletedCount = await this.teamCommentService.deleteComment(
        teamCommentId,
        userId
      );

      if (deletedCount === 0) {
        return res
          .status(404)
          .json({
            status: "fail",
            message: "삭제할 댓글을 찾을 수 없거나 권한이 없습니다.",
          });
      }

      res.status(200).json({ status: "success", message: "팀 댓글 삭제 완료" });
    } catch (error) {
      next(error);
    }
  };
}
