// src/controllers/comments.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/comments.service"; // CommentService를 import합니다.

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  /**
   * GET /posts/:postId/comments - 특정 게시물의 댓글 목록 조회
   */
  public getCommentsByPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId: rawPostId } = req.params; // 게시물 ID
      // 쿼리 파라미터 (page, size, sort) 처리
      const { page, size, sort } = req.query;

      // 필수 필드 및 타입 유효성 검사
      if (rawPostId === undefined) {
        return res.status(400).json({ message: "게시물 ID가 필요합니다." });
      }
      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        return res
          .status(400)
          .json({ message: "유효한 게시물 ID가 아닙니다." });
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
      next(error);
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
      const { postId: rawPostId } = req.params; // 게시물 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아야 합니다.
      const { userId: rawUserId, content, parentId: rawParentId } = req.body; // 요청 바디 (userId, content, parentId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (
        rawPostId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res
          .status(400)
          .json({
            message: "필수 필드(postId, userId, content)가 누락되었습니다.",
          });
      }

      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        return res
          .status(400)
          .json({ message: "유효한 게시물 ID가 아닙니다." });
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

      const newComment = await this.commentService.createComment(postId, {
        userId,
        content,
        parentId,
      });
      res.status(201).json({
        status: "success",
        message: "댓글 작성 완료",
        commentId: newComment.commentId, // 생성된 댓글 ID 반환
      });
    } catch (error) {
      next(error);
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
      const { id: rawCommentId } = req.params; // 댓글 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 댓글인지 확인해야 합니다.
      const { content, userId: rawUserId } = req.body; // 요청 바디 (content, userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (
        rawCommentId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res
          .status(400)
          .json({
            message:
              "필수 정보(댓글 ID, 사용자 ID) 또는 수정할 내용이 누락되었습니다.",
          });
      }

      const commentId = Number(rawCommentId);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "유효한 댓글 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.commentService.updateComment(commentId, { content, userId });
      res.status(200).json({ status: "success", message: "댓글 수정 완료" });
    } catch (error) {
      next(error);
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
      const { id: rawCommentId } = req.params; // 댓글 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 댓글인지 확인해야 합니다.
      const { userId: rawUserId } = req.body; // 요청 바디 (userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (rawCommentId === undefined || rawUserId === undefined) {
        return res
          .status(400)
          .json({ message: "필수 정보(댓글 ID, 사용자 ID)가 누락되었습니다." });
      }

      const commentId = Number(rawCommentId);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "유효한 댓글 ID가 아닙니다." });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      await this.commentService.deleteComment(commentId, userId);
      res.status(200).json({ status: "success", message: "댓글 삭제 완료" });
    } catch (error) {
      next(error);
    }
  };
}
