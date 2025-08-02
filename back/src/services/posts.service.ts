// src/services/posts.service.ts

import { PostRepository } from "../repositories/posts.repository";
import { Post, PostType, RecruitmentStatus } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  public async getUserPosts(userId: number, 
    query: {
      page?: number;
      pageSize?: number;
      sort?: string;
    }
  ) {
    try {
      // 입력값 검증
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10)); // 최대 50개로 제한

      const posts = await this.postRepository.findByUserId(userId, {
        page,
        pageSize,
        sort: query.sort || "latest",
      });

      const totalCount = await this.postRepository.countByUserId(userId);
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      console.error('유저 게시물 조회 중 오류:', error);
      throw new Error('게시물을 조회하는 중 오류가 발생했습니다.');
    }
  }



  /**
   * 전체 게시판 게시물 목록 조회 (일반글 및 공개된 모집글 포함)
   * @param query
   * @returns
   * @throws
   */
  public async findAllPosts(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<Post[]> {
    const posts = await this.postRepository.findMany(query);
    return posts;
  }

  /**
   * 전체 게시판에 게시물 작성 (일반글)
   * @param postData
   * @returns
   * @throws
   */
  public async createPost(postData: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Post> {
    const newPost = await this.postRepository.create({
      ...postData,
      type: PostType.GENERAL,
    });
    return newPost;
  }

  /**
   * 특정 게시물의 상세 정보 조회
   * @param postId
   * @returns
   * @throws
   */
  public async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    return post;
  }

  /**
   * 특정 게시물 수정
   * @param postId
   * @param updateData
   * @returns
   * @throws
   */
  public async updatePost(
    postId: number,
    updateData: { title?: string; content?: string; userId: number }
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found");
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== updateData.userId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own posts."
      );
    }

    const updatedPost = await this.postRepository.update(postId, updateData);
    return updatedPost;
  }

  /**
   * 특정 게시물 삭제
   * @param postId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async deletePost(
    postId: number,
    requestingUserId: number
  ): Promise<void> {
    // 반환 타입을 Promise<void>로 변경
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found");
    }

    // 삭제 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== requestingUserId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own posts."
      );
    }

    try {
      await this.postRepository.delete(postId);
    } catch (error) {
      throw error;
    }
  }
}
