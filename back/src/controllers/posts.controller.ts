import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/posts.service";
import { CustomError } from "../middleware/error-handing-middleware";

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }
  
  public getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      const { page, size, sort } = req.query;

      const result = await this.postService.getUserPosts(userId, {
        page: page ? Number(page) : undefined,
        pageSize: size ? Number(size) : undefined,
        sort: sort ? String(sort) : undefined,
      });

      res.status(200).json({
        message: "내가 작성한 게시물 조회 성공",
        data: result.data
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No posts found") {
          next(new CustomError(500, error.message));
        } else {
          next(error);
        }
      } else {
        next(error);
      }
    }
  };


  /**
   * GET /posts - 전체 게시판 게시물 목록 조회
   */
  public getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      if (error instanceof Error) {
        if (error.message === "No posts found") {
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
   * POST /posts/write - 전체 게시판에 게시물 작성
   */
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user;
      const { title, content } = req.body;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      // 필수 필드 유효성 검사
      if (title === undefined || content === undefined) {
        throw new CustomError(
          400,
          "필수 필드(title, content)가 누락되었습니다."
        );
      }

      const newPost = await this.postService.createPost({
        userId,
        title,
        content,
      });
      res.status(201).json({
        status: "success",
        message: "게시물 작성 완료",
        postId: newPost.postId,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
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
   * GET /posts/:id - 특정 게시물 상세 정보 조회
   */
  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params;

      // 필수 필드 및 타입 유효성 검사
      if (rawPostId === undefined) {
        throw new CustomError(400, "게시물 ID가 필요합니다.");
      }
      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        throw new CustomError(400, "유효한 게시물 ID가 아닙니다.");
      }

      const post = await this.postService.findPostById(postId);
      res.status(200).json({
        message: `게시물 ID ${postId} 상세 정보 조회 성공`,
        data: post,
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
   * PUT /posts/:id - 특정 게시물 수정
   */
  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params;
      const userId = req.user;
      const { title, content } = req.body;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (rawPostId === undefined || (!title && !content)) {
        throw new CustomError(
          400,
          "필수 정보(게시물 ID) 또는 수정할 내용이 누락되었습니다."
        );
      }

      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        throw new CustomError(400, "유효한 게시물 ID가 아닙니다.");
      }

      await this.postService.updatePost(postId, { title, content, userId });
      res.status(200).json({ status: "success", message: "게시물 수정 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Unauthorized: You can only update your own posts."
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
   * DELETE /posts/:id - 특정 게시물 삭제
   */
  public deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: rawPostId } = req.params;
      const userId = req.user;

      // 인증된 사용자 ID가 없는 경우
      if (userId === undefined) {
        throw new CustomError(401, "인증된 사용자 ID는 필수입니다.");
      }

      // 필수 필드 및 타입 유효성 검사
      if (rawPostId === undefined) {
        throw new CustomError(400, "필수 정보(게시물 ID)가 누락되었습니다.");
      }

      const postId = Number(rawPostId);
      if (isNaN(postId)) {
        throw new CustomError(400, "유효한 게시물 ID가 아닙니다.");
      }

      // postService.deletePost가 삭제 성공 시 에러 던지지 않음
      // 게시물을 찾을 수 없거나 권한이 없는 경우 서비스 계층에서 CustomError
      await this.postService.deletePost(postId, userId);

      // 서비스에서 에러를 던지지 않았다면 삭제 성공
      res.status(200).json({ status: "success", message: "게시물 삭제 완료" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          next(new CustomError(404, error.message));
        } else if (
          error.message === "Unauthorized: You can only delete your own posts."
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
