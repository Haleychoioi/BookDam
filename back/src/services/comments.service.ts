// src/services/comments.service.ts

import { CommentRepository } from "../repositories/comments.repository";
import { PostRepository } from "../repositories/posts.repository";
import { Comment } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

// CommentRepository에서 정의한 CommentWithRelations 타입을 가져옵니다.
// 이는 Comment 모델에 user 및 replies 관계가 포함된 형태입니다.
type CommentWithRelations = Comment & {
  user: { nickname: string } | null;
  replies: (Comment & { user: { nickname: string } | null })[];
};

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
  }

  /**
   * 특정 게시물의 댓글 목록을 조회합니다.
   * 최상위 댓글과 그에 대한 1단계 대댓글을 포함합니다.
   * @param postId - 게시물 ID
   * @param query - 페이지네이션 및 정렬 옵션
   * @returns CommentWithRelations 배열
   * @throws CustomError 게시물을 찾을 수 없을 때
   */
  public async findCommentsByPost(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<CommentWithRelations[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    const comments = await this.commentRepository.findManyByPostId(
      postId,
      query
    );
    return comments;
  }

  /**
   * 특정 게시물에 댓글을 작성합니다. (대댓글 포함)
   * @param postId - 댓글이 속할 게시물 ID
   * @param commentData - 생성할 댓글 데이터 { userId, content, parentId? }
   * @returns 생성된 Comment 객체
   * @throws CustomError 게시물을 찾을 수 없을 때, 부모 댓글이 유효하지 않을 때
   */
  public async createComment(
    postId: number,
    commentData: { userId: number; content: string; parentId?: number }
  ): Promise<Comment> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }

    if (commentData.parentId) {
      const parentComment = await this.commentRepository.findById(
        commentData.parentId
      );
      if (
        !parentComment ||
        parentComment.postId !== postId ||
        parentComment.parentId !== null
      ) {
        throw new CustomError(
          400,
          "Invalid parent comment: Parent comment not found, does not belong to this post, or is already a reply."
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
   * @throws CustomError 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateComment(
    commentId: number,
    updateData: { content?: string; userId: number }
  ): Promise<Comment> {
    const existingComment = await this.commentRepository.findById(commentId);
    if (!existingComment) {
      throw new CustomError(404, "Comment not found");
    }

    if (existingComment.userId !== updateData.userId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own comments."
      );
    }

    const updatedComment = await this.commentRepository.update(commentId, {
      content: updateData.content,
    });
    return updatedComment;
  }

  /**
   * 특정 댓글을 삭제합니다.
   * @param commentId - 삭제할 댓글 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns boolean - 삭제 성공 여부
   * @throws CustomError 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deleteComment(
    commentId: number,
    requestingUserId: number
  ): Promise<boolean> {
    const existingComment = await this.commentRepository.findById(commentId);
    if (!existingComment) {
      throw new CustomError(404, "Comment not found");
    }

    if (existingComment.userId !== requestingUserId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own comments."
      );
    }

    const deletedCount = await this.commentRepository.delete(commentId);

    if (deletedCount === 0) {
      throw new CustomError(500, "Failed to delete comment.");
    }

    return deletedCount > 0;
  }

  /**
   * 특정 댓글의 상세 정보를 조회합니다.
   * @param commentId - 조회할 댓글 ID
   * @returns CommentWithRelations 객체
   * @throws CustomError 댓글을 찾을 수 없을 때
   */
  public async findCommentById(
    commentId: number
  ): Promise<CommentWithRelations> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new CustomError(404, "Comment not found");
    }
    // commentRepository.findById가 CommentWithRelations | null을 반환하므로,
    // !comment 체크 후에는 comment가 CommentWithRelations 타입임을 TypeScript가 추론합니다.
    return comment;
  }
}
