// src/services/posts.service.ts

import { PostRepository } from "../repositories/posts.repository";
import { Post, PostType, RecruitmentStatus } from "@prisma/client";

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  /**
   * 전체 게시판 게시물 목록을 조회합니다.
   * @param query - 페이지네이션 및 정렬 옵션
   * @returns Post 배열
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
   * 전체 게시판에 게시물을 작성합니다.
   * @param postData - 작성할 게시물 데이터 { userId, title, content }
   * @returns 생성된 Post 객체
   */
  public async createPost(postData: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Post> {
    // TODO: (선택 사항) userId에 해당하는 User가 존재하는지 확인하는 로직 (UserRepository 필요)
    // TODO: (선택 사항) content 길이 제한 등 추가 유효성 검사

    const newPost = await this.postRepository.create({
      ...postData,
      type: PostType.GENERAL, // 일반 게시글로 설정
    });
    return newPost;
  }

// public async createPost(postData: {
//     userId: number;
//     title: string;
//     content: string;
//     type?: PostType;
//     maxMembers?: number;
//     isbn13?: string;
// }): Promise<Post> {
    
//     if (postData.type === PostType.RECRUITMENT) {
//         // 모집글 => 추가 필드 필요
//         if (!postData.maxMembers || postData.maxMembers <= 0) {
//             throw new Error("모집글은 모집 인원이 필요합니다.");
//         }
        
//         return await this.postRepository.create({
//             userId: postData.userId,
//             title: postData.title,
//             content: postData.content,
//             type: PostType.RECRUITMENT,
//             maxMembers: postData.maxMembers,
//             isbn13: postData.isbn13,
//             recruitmentStatus: RecruitmentStatus.RECRUITING
//         });
//     } else {
//         // 일반글 => 기본 필드만
//         return await this.postRepository.create({
//             userId: postData.userId,
//             title: postData.title,
//             content: postData.content,
//             // type은 스키마 기본값 GENERAL 사용, 나머지 필드들은 null처리
//         });
//     }
// }

  /**
   * 특정 게시물의 상세 정보를 조회합니다.
   * @param postId - 조회할 게시물 ID
   * @returns Post 객체
   * @throws Error 게시물을 찾을 수 없을 때
   */
  public async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found"); // 게시물을 찾을 수 없을 때 에러 발생
    }
    return post;
  }

  /**
   * 특정 게시물을 수정합니다.
   * @param postId - 수정할 게시물 ID
   * @param updateData - 업데이트할 데이터 { title?, content?, userId } (userId는 권한 확인용)
   * @returns 업데이트된 Post 객체
   * @throws Error 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updatePost(
    postId: number,
    updateData: { title?: string; content?: string; userId: number }
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== updateData.userId) {
      throw new Error("Unauthorized: You can only update your own posts.");
    }

    const updatedPost = await this.postRepository.update(postId, updateData);
    return updatedPost;
  }

  /**
   * 특정 게시물을 삭제합니다.
   * @param postId - 삭제할 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @throws Error 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deletePost(
    postId: number,
    requestingUserId: number
  ): Promise<void> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // 삭제 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== requestingUserId) {
      throw new Error("Unauthorized: You can only delete your own posts.");
    }

    await this.postRepository.delete(postId);
  }
}
