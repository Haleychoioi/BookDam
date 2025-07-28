// src/controllers/comments.controller.ts

import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/comments.service";

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
        status: "success",
        message: `게시물 ID ${postId}의 댓글 목록 조회 성공`,
        data: comments,
      });
    } catch (error: any) {
      // 에러 타입 명시
      // 서비스 계층에서 발생한 에러 메시지를 클라이언트에 전달
      if (error.message === "Post not found") {
        return res.status(404).json({ message: error.message });
      }
      next(error); // 그 외 에러는 다음 미들웨어로 전달
    }
  };

  /**
   * POST /posts/:postId/comments - 특정 게시물에 댓글 작성 (대댓글 포함)
   */
  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // --- 디버깅 로그 추가 시작 ---
      console.log("createComment - req.params:", req.params);
      console.log("createComment - req.body:", req.body);
      // --- 디버깅 로그 추가 끝 ---

      const { postId: rawPostId } = req.params; // 게시물 ID
      const { userId: rawUserId, content, parentId: rawParentId } = req.body;

      // 필수 필드 및 타입 유효성 검사
      if (
        rawPostId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        // --- 디버깅 로그 추가 시작 ---
        console.log("Validation failed:");
        console.log("  rawPostId:", rawPostId);
        console.log("  rawUserId:", rawUserId);
        console.log("  content:", content);
        // --- 디버깅 로그 추가 끝 ---
        return res.status(400).json({
          message: "필수 필드(게시물 ID, 사용자 ID, 내용)가 누락되었습니다.",
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

      let parentId: number | undefined;
      if (rawParentId !== undefined) {
        parentId = Number(rawParentId);
        if (isNaN(parentId)) {
          return res
            .status(400)
            .json({ message: "유효한 부모 댓글 ID(parentId)가 아닙니다." });
        }
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
    } catch (error: any) {
      if (error.message === "Post not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.startsWith("Invalid parent comment")) {
        return res.status(400).json({ message: error.message });
      }
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
      const { id: rawCommentId } = req.params;
      const { content, userId: rawUserId } = req.body;

      if (
        rawCommentId === undefined ||
        rawUserId === undefined ||
        content === undefined
      ) {
        return res.status(400).json({
          message: "필수 정보(댓글 ID, 사용자 ID, 내용)가 누락되었습니다.",
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
    } catch (error: any) {
      if (error.message === "Comment not found") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message === "Unauthorized: You can only update your own comments."
      ) {
        return res.status(403).json({ message: error.message });
      }
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
      const { id: rawCommentId } = req.params;
      const { userId: rawUserId } = req.body;

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

      const deleted = await this.commentService.deleteComment(
        commentId,
        userId
      );
      if (deleted) {
        res.status(200).json({ status: "success", message: "댓글 삭제 완료" });
      } else {
        res
          .status(404)
          .json({ status: "fail", message: "삭제할 댓글을 찾을 수 없습니다." });
      }
    } catch (error: any) {
      if (error.message === "Comment not found") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message === "Unauthorized: You can only delete your own comments."
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  };
}
