import { Request, Response, NextFunction } from "express";
import { TeamCommentService } from "../services/team-comments.service";
import { CustomError } from "../middleware/error-handing-middleware";

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
      const { communityId: rawCommunityId } = req.query;
      const requestingUserId = req.user;

      // 인증된 사용자 ID가 없는 경우
      if (requestingUserId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (rawTeamPostId === undefined || rawCommunityId === undefined) {
        throw new CustomError(
          400,
          "필수 정보(팀 게시물 ID, 커뮤니티 ID)가 누락되었습니다."
        );
      }

      const teamPostId = Number(rawTeamPostId);
      if (isNaN(teamPostId)) {
        throw new CustomError(400, "유효한 팀 게시물 ID가 아닙니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const teamComments = await this.teamCommentService.findTeamComments(
        communityId,
        teamPostId,
        requestingUserId
      );

      res.status(200).json({
        status: "success",
        message: `팀 게시물 ID ${teamPostId}의 댓글 목록 조회 성공`,
        data: teamComments,
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
   * POST /team-posts/:teamPostId/comments - 특정 팀 게시물에 댓글 또는 대댓글 작성
   */
  public createTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { teamPostId: rawTeamPostId } = req.params;
      const { communityId: rawCommunityId } = req.query;
      const { content, parentId: rawParentId } = req.body;
      const userId = req.user;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamPostId === undefined ||
        rawCommunityId === undefined ||
        content === undefined
      ) {
        throw new CustomError(
          400,
          "필수 필드(팀 게시물 ID, 커뮤니티 ID, 내용)가 누락되었습니다."
        );
      }

      const teamPostId = Number(rawTeamPostId);
      if (isNaN(teamPostId)) {
        throw new CustomError(400, "유효한 팀 게시물 ID가 아닙니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      let parentId: number | undefined;
      if (rawParentId !== undefined) {
        parentId = Number(rawParentId);
        if (isNaN(parentId)) {
          throw new CustomError(
            400,
            "유효한 부모 댓글 ID(parentId)가 아닙니다."
          );
        }
      }

      const newTeamComment = await this.teamCommentService.createTeamComment(
        communityId,
        teamPostId,
        userId,
        content,
        parentId
      );

      res.status(201).json({
        status: "success",
        message: "댓글이 성공적으로 작성되었습니다.",
        data: newTeamComment,
        teamCommentId: newTeamComment.teamCommentId,
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
        } else if (
          error.message ===
          "Parent comment not found or does not belong to this post."
        ) {
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
   * PUT /team-comments/:id - 특정 팀 댓글 수정
   */
  public updateTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawTeamCommentId } = req.params;
      const { communityId: rawCommunityId } = req.query;
      const { content } = req.body;
      const userId = req.user;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamCommentId === undefined ||
        rawCommunityId === undefined ||
        content === undefined
      ) {
        throw new CustomError(
          400,
          "필수 정보(팀 댓글 ID, 커뮤니티 ID, 내용)가 누락되었습니다."
        );
      }

      const teamCommentId = Number(rawTeamCommentId);
      if (isNaN(teamCommentId)) {
        throw new CustomError(400, "유효한 팀 댓글 ID가 아닙니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      await this.teamCommentService.updateTeamComment(
        communityId,
        teamCommentId,
        userId,
        content
      );

      res.status(200).json({ status: "success", message: "팀 댓글 수정 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Associated team post not found or does not belong to this community."
        ) {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only update your own comments or be a team leader."
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
   * DELETE /team-comments/:id - 특정 팀 댓글 삭제
   */
  public deleteTeamComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawTeamCommentId } = req.params;
      const {
        communityId: rawCommunityId,
        teamPostId: rawTeamPostIdFromQuery,
      } = req.query;
      const userId = req.user;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID가 필요합니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (
        rawTeamCommentId === undefined ||
        rawCommunityId === undefined ||
        rawTeamPostIdFromQuery === undefined
      ) {
        throw new CustomError(
          400,
          "필수 정보(팀 댓글 ID, 커뮤니티 ID, 팀 게시물 ID)가 누락되었습니다."
        );
      }

      const teamCommentId = Number(rawTeamCommentId);
      if (isNaN(teamCommentId)) {
        throw new CustomError(400, "유효한 팀 댓글 ID가 아닙니다.");
      }

      const communityId = Number(rawCommunityId);
      if (isNaN(communityId)) {
        throw new CustomError(400, "유효한 커뮤니티 ID가 아닙니다.");
      }

      const teamPostIdFromQuery = Number(rawTeamPostIdFromQuery); // query에서 받은 teamPostId
      if (isNaN(teamPostIdFromQuery)) {
        throw new CustomError(400, "유효한 팀 게시물 ID가 아닙니다.");
      }

      const deletedCount = await this.teamCommentService.deleteTeamComment(
        communityId,
        teamPostIdFromQuery,
        teamCommentId,
        userId
      );

      if (deletedCount === 0) {
        // 서비스 계층에서 에러를 던지지 않고 0을 반환하는 경우에만 실행
        throw new CustomError(
          404,
          "삭제할 댓글을 찾을 수 없거나 권한이 없습니다."
        );
      }

      res.status(200).json({ status: "success", message: "팀 댓글 삭제 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Associated team post not found or does not belong to this community/post."
        ) {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only delete your own comments or be a team leader."
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
