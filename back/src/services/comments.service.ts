// src/services/comments.service.ts

import { CommentRepository } from "../repositories/comments.repository";
import { PostRepository } from "../repositories/posts.repository";
import { Comment } from "@prisma/client";

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
   * @throws Error 게시물을 찾을 수 없을 때
   */
  public async findCommentsByPost(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<CommentWithRelations[]> {
    // 반환 타입을 CommentWithRelations[]로 변경
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found"); // 게시물 없음 에러
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
   * @throws Error 게시물을 찾을 수 없을 때, 부모 댓글이 유효하지 않을 때, 또는 사용자 ID가 유효하지 않을 때
   */
  public async createComment(
    postId: number,
    commentData: { userId: number; content: string; parentId?: number }
  ): Promise<Comment> {
    // 1. 게시물 존재 여부 확인
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // 2. (선택 사항) commentData.userId에 해당하는 User가 존재하는지 확인하는 로직 (UserRepository 필요)
    // 현재는 userId가 유효하다고 가정합니다.

    // 3. parentId가 있을 경우 부모 댓글 유효성 검사
    if (commentData.parentId) {
      const parentComment = await this.commentRepository.findById(
        commentData.parentId
      );
      // 부모 댓글이 존재하지 않거나, 해당 게시물의 댓글이 아닌 경우 에러
      // 또한, 대댓글의 대댓글(2단계 이상)은 허용하지 않도록 parentComment.parentId가 null이 아니면 에러를 발생시킵니다.
      if (
        !parentComment ||
        parentComment.postId !== postId ||
        parentComment.parentId !== null
      ) {
        throw new Error(
          "Invalid parent comment: Parent comment not found, does not belong to this post, or is already a reply."
        );
      }
    }

    // 4. 댓글 생성
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
      throw new Error("Comment not found"); // 댓글 없음 에러
    }

    // 수정 권한 확인: 요청하는 userId가 댓글 작성자인지 확인
    if (existingComment.userId !== updateData.userId) {
      throw new Error("Unauthorized: You can only update your own comments."); // 권한 없음 에러
    }

    // 내용이 제공된 경우에만 업데이트
    const updatedComment = await this.commentRepository.update(
      commentId,
      { content: updateData.content } // content만 전달
    );
    return updatedComment;
  }

  /**
   * 특정 댓글을 삭제합니다.
   * @param commentId - 삭제할 댓글 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns boolean - 삭제 성공 여부
   * @throws Error 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deleteComment(
    commentId: number,
    requestingUserId: number
  ): Promise<boolean> {
    // 반환 타입을 boolean으로 변경
    const existingComment = await this.commentRepository.findById(commentId);
    if (!existingComment) {
      throw new Error("Comment not found"); // 댓글 없음 에러
    }

    // 삭제 권한 확인: 요청하는 userId가 댓글 작성자인지 확인
    if (existingComment.userId !== requestingUserId) {
      throw new Error("Unauthorized: You can only delete your own comments."); // 권한 없음 에러
    }

    // 대댓글이 있는 부모 댓글을 삭제할 경우, 대댓글의 parentId는 null로 설정됩니다.
    // 이는 schema.prisma의 onDelete: SetNull 설정 때문입니다.
    const deletedCount = await this.commentRepository.delete(commentId);
    return deletedCount > 0; // 삭제된 레코드가 1개 이상이면 true 반환
  }
}
