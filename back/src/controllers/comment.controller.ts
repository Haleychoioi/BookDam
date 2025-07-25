import { Request, Response, NextFunction } from "express";
import { commentService } from "../services/comment.service";

export const commentController = {
  // 특정 게시물의 댓글 목록 조회 (GET /posts/:postId/comments)
  async getCommentsByPostId(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = parseInt(req.params.postId);
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");
      const sort = (req.query.sort as string) || "latest";

      const { comments, totalPages, currentPage } =
        await commentService.getCommentsByPostId(postId, { page, size, sort });
      res.status(200).json({ comments, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 특정 게시물에 댓글 작성 (대댓글 기능 추가)
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const postId = parseInt(req.params.postId);
      const { content, parentId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const newComment = await commentService.createComment(
        postId,
        userId,
        content,
        parentId
      );
      res
        .status(201)
        .json({ status: "success", commentId: newComment.commentId });
    } catch (error) {
      next(error);
    }
  },

  // 특정 댓글 수정 (PUT /comments/:id)
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const updatedComment = await commentService.updateComment(
        commentId,
        userId,
        content
      );
      if (!updatedComment) {
        return res
          .status(404)
          .json({ message: "댓글을 찾을 수 없거나 수정 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "댓글 수정 완료" });
    } catch (error) {
      next(error);
    }
  },

  // 특정 댓글 삭제 (DELETE /comments/:id)
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const commentId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const deleted = await commentService.deleteComment(commentId, userId);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "댓글을 찾을 수 없거나 삭제 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "댓글 삭제 완료" });
    } catch (error) {
      next(error);
    }
  },
};
