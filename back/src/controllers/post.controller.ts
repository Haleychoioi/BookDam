import { Request, Response, NextFunction } from "express";
import { postService } from "../services/post.service";

export const postController = {
  // 게시물 목록 조회 (GET /posts)
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");
      const sort = (req.query.sort as string) || "latest";

      const { posts, totalPages, currentPage } = await postService.getPosts({
        page,
        size,
        sort,
      });
      res.status(200).json({ posts, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 게시물 작성 (POST /posts)
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { title, content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const newPost = await postService.createPost(userId, { title, content });
      res.status(201).json({ status: "success", postId: newPost.postId });
    } catch (error) {
      next(error);
    }
  },

  // 특정 게시물 상세 정보 조회 (GET /posts/:id)
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = parseInt(req.params.id);
      const post = await postService.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
      }
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },

  // 특정 게시물 수정 (PUT /posts/:id)
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const postId = parseInt(req.params.id);
      const { title, content } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const updatedPost = await postService.updatePost(postId, userId, {
        title,
        content,
      });
      if (!updatedPost) {
        return res
          .status(404)
          .json({ message: "게시물을 찾을 수 없거나 수정 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "게시물 수정 완료" });
    } catch (error) {
      next(error);
    }
  },

  // 특정 게시물 삭제 (DELETE /posts/:id)
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const postId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const deleted = await postService.deletePost(postId, userId);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "게시물을 찾을 수 없거나 삭제 권한이 없습니다." });
      }
      res.status(200).json({ status: "success", message: "게시물 삭제 완료" });
    } catch (error) {
      next(error);
    }
  },
};
