// src/controllers/comments.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/comments.service";
import { CustomError } from "../middleware/error-handing-middleware";

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  public getMyComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      const { page, size, sort, type } = req.query;

      const result = await this.commentService.getMyComments(userId, {
        page: page ? Number(page) : undefined,
        pageSize: size ? Number(size) : undefined,
        sort: sort ? String(sort) : undefined,
        type: type ? String(type).toUpperCase() : undefined,
      });

      res.status(200).json({
        message: "내가 작성한 댓글 목록 조회 성공",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /posts/:postId/comments - 특정 게시물의 댓글 목록 조회
   */
  public getCommentsByPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId: rawPostId } = req.params;
      const { page, size, sort } = req.query;

      if (rawPostId === undefined) {
        throw new CustomError(400, "게시물 ID가 필요합니다.");
      }

      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        throw new CustomError(400, "유효한 게시물 ID가 아닙니다.");
      }

      const comments = await this.commentService.findCommentsByPost(postId, {
        page: page ? Number(page) : undefined,
        pageSize: size ? Number(size) : undefined,
        sort: sort ? String(sort) : undefined,
      });

      res.status(200).json({
        message: `게시물 ID ${postId}의 댓글 목록 조회 성공`,
        data: comments,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
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
   * POST /posts/:postId/comments - 특정 게시물에 댓글 작성
   */
  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId: rawPostId } = req.params;
      const userId = req.user;
      const { content, parentId: rawParentId } = req.body;

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      if (rawPostId === undefined || content === undefined) {
        throw new CustomError(
          400,
          "필수 필드(게시물 ID, 내용)가 누락되었습니다."
        );
      }

      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        throw new CustomError(400, "유효한 게시물 ID가 아닙니다.");
      }

      const parentId = rawParentId ? Number(rawParentId) : undefined;
      if (rawParentId !== undefined && isNaN(parentId as number)) {
        throw new CustomError(400, "유효한 부모 댓글 ID가 아닙니다.");
      }

      const newComment = await this.commentService.createComment(postId, {
        userId,
        content,
        parentId,
      });

      res.status(201).json({
        status: "success",
        message: "댓글 작성 완료",
        commentId: newComment.commentId,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Invalid parent comment: Parent comment not found, does not belong to this post, or is already a reply."
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
   * PUT /comments/:id - 특정 댓글 수정
   */
  public updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawCommentId } = req.params;
      const userId = req.user;
      const { content } = req.body;

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      if (rawCommentId === undefined || content === undefined) {
        throw new CustomError(
          400,
          "필수 필드(댓글 ID, 내용)가 누락되었습니다."
        );
      }

      const commentId = Number(rawCommentId);
      if (isNaN(commentId)) {
        throw new CustomError(400, "유효한 댓글 ID가 아닙니다.");
      }

      await this.commentService.updateComment(commentId, { userId, content });

      res.status(200).json({ status: "success", message: "댓글 수정 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only update your own comments."
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
   * DELETE /comments/:id - 특정 댓글 삭제
   */
  public deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawCommentId } = req.params;
      const userId = req.user;

      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      if (rawCommentId === undefined) {
        throw new CustomError(400, "댓글 ID가 필요합니다.");
      }

      const commentId = Number(rawCommentId);
      if (isNaN(commentId)) {
        throw new CustomError(400, "유효한 댓글 ID가 아닙니다.");
      }

      await this.commentService.deleteComment(commentId, userId);

      res.status(200).json({ status: "success", message: "댓글 삭제 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message ===
          "Unauthorized: You can only delete your own comments."
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
   * GET /comments/:id - 특정 댓글 상세 정보 조회
   */
  public getCommentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawCommentId } = req.params;

      if (rawCommentId === undefined) {
        throw new CustomError(400, "댓글 ID가 필요합니다.");
      }

      const commentId = Number(rawCommentId);
      if (isNaN(commentId)) {
        throw new CustomError(400, "유효한 댓글 ID가 아닙니다.");
      }

      const comment = await this.commentService.findCommentById(commentId);

      res.status(200).json({
        status: "success",
        message: `댓글 ID ${commentId} 상세 조회 성공`,
        data: comment,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          next(new CustomError(404, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
}
