// src/zip/services/comments.service.ts

import { CommentRepository } from "../repositories/comments.repository";
import { TeamCommentRepository } from "../repositories/team-comments.repository";
import { PostRepository } from "../repositories/posts.repository";
import { Comment, PostType, TeamComment } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

// CommentRepository에서 정의한 CommentWithRelations 타입 (현재 서비스 파일 내 정의)
type CommentWithRelations = Comment & {
  user: { nickname: string; profileImage: string | null } | null; // 이 user 타입이 문제의 원인
  replies: (Comment & {
    user: { nickname: string; profileImage: string | null } | null;
  })[];
  postTitle?: string;
  postId?: number;
  teamPostId?: number;
  communityId?: number;
  type?: string;
  source?: string; // 소스 필드가 있다면 추가
};

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;
  private teamCommentRepository: TeamCommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
    this.teamCommentRepository = new TeamCommentRepository();
  }

  public async getMyComments(
    userId: number,
    query: {
      page?: number;
      pageSize?: number;
      sort?: string;
      type?: string;
    }
  ) {
    const { page = 1, pageSize = 10, sort = "latest", type } = query;

    // Prisma 쿼리 결과를 직접 받을 수 있도록 임시적으로 any 타입 사용 (타입 추론 복잡성 회피)
    let publicCommentsRaw: any[] = [];
    let teamCommentsRaw: any[] = [];

    // 1. 레포지토리에서 댓글 원본 데이터 조회
    if (type === "TEAM") {
      teamCommentsRaw = await this.teamCommentRepository.findByUserId(userId);
    } else if (type === "GENERAL" || type === "RECRUITMENT") {
      const postType = type as PostType;
      publicCommentsRaw = await this.commentRepository.findByUserId(
        userId,
        postType
      );
    } else {
      // type이 없거나 유효하지 않은 경우: 전체 조회
      publicCommentsRaw = await this.commentRepository.findByUserId(userId);
      teamCommentsRaw = await this.teamCommentRepository.findByUserId(userId);
    }

    let combinedComments: CommentWithRelations[] = [];

    // 2. 일반 게시물 댓글 처리: 연결된 게시물이 null이 아닌 경우만 포함하고 필드 평탄화
    publicCommentsRaw.forEach((c) => {
      if (c.post !== null) {
        // 게시물이 null이 아닌 경우만 필터링
        combinedComments.push({
          ...c, // 원본 댓글 속성 스프레드
          postTitle: c.post.title,
          postId: c.post.postId,
          type: c.post.type, // GENERAL 또는 RECRUITMENT
          source: "PUBLIC",
          // ✨ user 객체를 명시적으로 재구성하여 profileImage를 보장합니다. ✨
          user: c.user
            ? {
                nickname: c.user.nickname,
                profileImage: c.user.profileImage || null, // profileImage가 undefined면 null로 설정
              }
            : null, // user 객체가 null인 경우 처리
        });
      }
    });

    // 3. 팀 게시물 댓글 처리: 연결된 팀 게시물이 null이 아닌 경우만 포함하고 필드 평탄화
    teamCommentsRaw.forEach((c) => {
      if (c.teamPost !== null) {
        // 팀 게시물이 null이 아닌 경우만 필터링
        combinedComments.push({
          ...c, // 원본 팀 댓글 속성 스프레드
          type: "TEAM",
          postTitle: c.teamPost.title,
          teamPostId: c.teamPost.teamPostId,
          communityId: c.teamPost.teamId, // teamId가 곧 communityId
          source: "TEAM",
          // ✨ user 객체를 명시적으로 재구성하여 profileImage를 보장합니다. ✨
          user: c.user
            ? {
                nickname: c.user.nickname,
                profileImage: c.user.profileImage || null, // profileImage가 undefined면 null로 설정
              }
            : null, // user 객체가 null인 경우 처리
        });
      }
    });

    // 4. 합쳐진 배열을 생성 날짜 기준으로 정렬합니다.
    combinedComments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    // 5. 정렬된 배열에 대해 페이지네이션을 적용합니다.
    const totalCount = combinedComments.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;
    const paginatedComments = combinedComments.slice(skip, skip + pageSize);

    return {
      comments: paginatedComments,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
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
    return comments as CommentWithRelations[]; // Cast to ensure consistent return type
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
    return comment as CommentWithRelations; // Cast to ensure consistent return type
  }
}
