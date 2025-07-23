import { Request, Response, NextFunction } from "express";
import { teamCommentService } from "../services/teamComment.service";

export const teamCommentController = {
  // 특정 팀 게시물의 댓글 목록 조회 (GET /team-posts/:teamPostId/comments)
  // teamPost.routes.ts에서 호출
  async getTeamCommentsByTeamPostId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const teamPostId = parseInt(req.params.teamPostId);
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");
      const sort = (req.query.sort as string) || "latest";

      const { comments, totalPages, currentPage } =
        await teamCommentService.getTeamCommentsByTeamPostId(teamPostId, {
          page,
          size,
          sort,
        });
      res.status(200).json({ comments, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 특정 팀 게시물에 댓글 작성 (POST /team-posts/:teamPostId/comments)
  async createTeamComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const teamPostId = parseInt(req.params.teamPostId);
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const newComment = await teamCommentService.createTeamComment(
        teamPostId,
        userId,
        content
      );
      res
        .status(201)
        .json({ status: "success", teamCommentId: newComment.teamCommentId });
    } catch (error) {
      next(error);
    }
  },

  // 특정 팀 댓글 수정 (PUT /team-comments/:id)
  async updateTeamComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const updatedComment = await teamCommentService.updateTeamComment(
        commentId,
        userId,
        content
      );
      if (!updatedComment) {
        return res
          .status(404)
          .json({ message: "팀 댓글을 찾을 수 없거나 수정 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "팀 댓글 수정 완료" });
    } catch (error) {
      next(error);
    }
  },

  // 특정 팀 댓글 삭제 (DELETE /team-comments/:id)
  async deleteTeamComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const commentId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const deleted = await teamCommentService.deleteTeamComment(
        commentId,
        userId
      );
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "팀 댓글을 찾을 수 없거나 삭제 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "팀 댓글 삭제 완료" });
    } catch (error) {
      next(error);
    }
  },
};
