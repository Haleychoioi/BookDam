// src/controllers/posts.controller.ts

import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/posts.service"; // PostService를 import합니다.

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  /**
   * GET /posts - 전체 게시판 게시물 목록 조회
   */
  public getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 쿼리 파라미터 (page, size, sort) 처리
      const { page, size, sort } = req.query;

      const posts = await this.postService.findAllPosts({
        page: page ? Number(page) : undefined,
        pageSize: size ? Number(size) : undefined,
        sort: sort ? String(sort) : undefined,
      });
      res
        .status(200)
        .json({ message: "전체 게시물 목록 조회 성공", data: posts });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /posts/write - 전체 게시판에 게시물 작성
   */
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId: rawUserId, title, content } = req.body; // 요청 바디 (userId, title, content) 처리
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 req.user.userId 등으로 주입받아야 합니다.

      // 필수 필드 및 타입 유효성 검사
      if (
        rawUserId === undefined ||
        title === undefined ||
        content === undefined
      ) {
        return res
          .status(400)
          .json({
            message: "필수 필드(userId, title, content)가 누락되었습니다.",
          });
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효한 사용자 ID(userId)가 아닙니다." });
      }

      const newPost = await this.postService.createPost({
        userId,
        title,
        content,
      });
      res.status(201).json({
        status: "success",
        message: "게시물 작성 완료",
        postId: newPost.postId, // 생성된 게시물 ID 반환
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /posts/:id - 특정 게시물 상세 정보 조회
   */
  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params; // 게시물 ID

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

      const post = await this.postService.findPostById(postId);
      res
        .status(200)
        .json({
          message: `게시물 ID ${postId} 상세 정보 조회 성공`,
          data: post,
        });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /posts/:id - 특정 게시물 수정
   */
  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params; // 게시물 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 게시물인지 확인해야 합니다.
      const { title, content, userId: rawUserId } = req.body; // 요청 바디 (title, content, userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (
        rawPostId === undefined ||
        rawUserId === undefined ||
        (!title && !content)
      ) {
        return res
          .status(400)
          .json({
            message:
              "필수 정보(게시물 ID, 사용자 ID) 또는 수정할 내용이 누락되었습니다.",
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

      await this.postService.updatePost(postId, { title, content, userId });
      res.status(200).json({ status: "success", message: "게시물 수정 완료" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /posts/:id - 특정 게시물 삭제
   */
  public deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params; // 게시물 ID
      // NOTE: userId는 실제 애플리케이션에서는 인증 미들웨어에서 가져오고, 본인 게시물인지 확인해야 합니다.
      const { userId: rawUserId } = req.body; // 요청 바디 (userId) 처리

      // 필수 필드 및 타입 유효성 검사
      if (rawPostId === undefined || rawUserId === undefined) {
        return res
          .status(400)
          .json({
            message: "필수 정보(게시물 ID, 사용자 ID)가 누락되었습니다.",
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

      await this.postService.deletePost(postId, userId);
      res.status(200).json({ status: "success", message: "게시물 삭제 완료" });
    } catch (error) {
      next(error);
    }
  };
}
