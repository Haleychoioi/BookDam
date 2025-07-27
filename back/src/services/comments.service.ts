// src/services/comments.service.ts

import { CommentRepository } from "../repositories/comments.repository";
import { PostRepository } from "../repositories/posts.repository"; // 게시물 존재 여부 확인
import { Comment } from "@prisma/client";

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
  }

  /**
   * 특정 게시물의 댓글 목록을 조회합니다.
   * @param postId - 게시물 ID
   * @param query - 페이지네이션 및 정렬 옵션
   * @returns Comment 배열
   * @throws Error 게시물을 찾을 수 없을 때
   */
  public async findCommentsByPost(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<Comment[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const comments = await this.commentRepository.findManyByPostId(
      postId,
      query
    );
    return comments;
  }

  /**
   * 특정 게시물에 댓글을 작성합니다.
   * @param postId - 댓글이 속할 게시물 ID
   * @param commentData - 생성할 댓글 데이터 { userId, content, parentId? }
   * @returns 생성된 Comment 객체
   * @throws Error 게시물을 찾을 수 없을 때 또는 부모 댓글이 유효하지 않을 때
   */
  public async createComment(
    postId: number,
    commentData: { userId: number; content: string; parentId?: number }
  ): Promise<Comment> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    // TODO: (선택 사항) commentData.userId에 해당하는 User가 존재하는지 확인하는 로직 (UserRepository 필요)

    if (commentData.parentId) {
      const parentComment = await this.commentRepository.findById(
        commentData.parentId
      );
      // 부모 댓글이 존재하지 않거나, 해당 게시물의 댓글이 아닌 경우 에러
      if (!parentComment || parentComment.postId !== postId) {
        throw new Error(
          "Parent comment not found or does not belong to this post"
        );
      }
    }
    const newComment = await this.commentRepository.create(postId, commentData);
    return newComment;
  }

  /**
   * 특정 댓글을 수정합니다.
   * @param commentId - 업데이트할 댓글 ID
   * @param updateData - 업데이트할 데이터 { content?, userId } (userId는 권한 확인용)
   * @returns 업데이트된 Comment 객체
   * @throws Error 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateComment(
    commentId: number,
    updateData: { content?: string; userId: number }
  ): Promise<Comment> {
    const existingComment = await this.commentRepository.findById(commentId);
    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // 수정 권한 확인: 요청하는 userId가 댓글 작성자인지 확인
    if (existingComment.userId !== updateData.userId) {
      throw new Error("Unauthorized: You can only update your own comments.");
    }

    const updatedComment = await this.commentRepository.update(
      commentId,
      updateData
    );
    return updatedComment;
  }

  /**
   * 특정 댓글을 삭제합니다.
   * @param commentId - 삭제할 댓글 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns void
   * @throws Error 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deleteComment(
    commentId: number,
    requestingUserId: number
  ): Promise<void> {
    const existingComment = await this.commentRepository.findById(commentId);
    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // 삭제 권한 확인: 요청하는 userId가 댓글 작성자인지 확인
    if (existingComment.userId !== requestingUserId) {
      throw new Error("Unauthorized: You can only delete your own comments.");
    }

    await this.commentRepository.delete(commentId);
  }
}
