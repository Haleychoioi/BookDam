// src/services/comments.service.ts

import { CommentRepository } from "../repositories/comments.repository";
import { PostRepository } from "../repositories/posts.repository";
import { Comment } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

// CommentRepository에서 정의한 CommentWithRelations 타입
type CommentWithRelations = Comment & {
  user: { nickname: string } | null;
  replies: (Comment & { user: { nickname: string } | null })[];
};

type CommentWithPostTitle = Comment & {
  post: { title: string } | null;
};

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
  }

  public async getMyComments(userId: number): Promise<CommentWithPostTitle[]> {
    const comments = await this.commentRepository.findByUserId(userId);

    return comments;
  }

  /**
   * 특정 게시물의 댓글 목록 조회
   * 최상위 댓글과 1단계 대댓글 포함
   * @param postId
   * @param query
   * @returns
   * @throws
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
   * 특정 게시물에 댓글 작성(대댓글 포함)
   * @param postId
   * @param commentData
   * @returns
   * @throws
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
   * 특정 댓글 수정
   * @param commentId
   * @param updateData
   * @returns
   * @throws
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
   * 특정 댓글 삭제
   * @param commentId
   * @param requestingUserId
   * @returns
   * @throws
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
   * 특정 댓글의 상세 정보 조회
   * @param commentId
   * @returns
   * @throws
   */
  public async findCommentById(
    commentId: number
  ): Promise<CommentWithRelations> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new CustomError(404, "Comment not found");
    }
    return comment;
  }
}
