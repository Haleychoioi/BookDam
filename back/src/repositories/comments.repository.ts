// src/repositories/comments.repository.ts

import prisma from "../utils/prisma";
import { Comment, Prisma } from "@prisma/client";

// Prisma의 findMany 결과에 대한 타입을 명확히 정의합니다.
// Comment 모델에 user (nickname만 포함) 및 replies (Comment와 user 포함) 관계가 포함된 형태입니다.
type CommentWithRelations = Comment & {
  user: { nickname: string } | null;
  replies: (Comment & { user: { nickname: string } | null })[];
};

export class CommentRepository {
  /**
   * 특정 게시물 ID에 해당하는 댓글 목록을 조회합니다.
   * 최상위 댓글과 그에 대한 1단계 대댓글을 포함합니다.
   * @param postId - 게시물 ID
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns Comment 배열 (최상위 댓글 및 1단계 대댓글 포함, 작성자 닉네임 포함)
   */
  public async findManyByPostId(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<CommentWithRelations[]> {
    // 명확한 반환 타입 사용
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.CommentFindManyArgs = {
      where: {
        postId: postId,
        parentId: null, // 최상위 댓글만 가져옵니다.
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { nickname: true }, // 댓글 작성자 닉네임 포함
        },
        replies: {
          // 대댓글 포함 (1단계만)
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true } }, // 대댓글 작성자 닉네임 포함
          },
        },
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      findManyOptions.orderBy = { createdAt: "asc" };
    } else {
      findManyOptions.orderBy = { createdAt: "asc" }; // 기본 정렬 추가
    }

    const comments = await prisma.comment.findMany(findManyOptions);
    return comments as CommentWithRelations[]; // 명시적 캐스팅
  }

  /**
   * 새로운 댓글을 생성합니다. (대댓글 포함)
   * @param postId - 댓글이 속할 게시물 ID
   * @param commentData - 생성할 댓글 데이터 { userId, content, parentId? }
   * @returns 생성된 Comment 객체
   */
  public async create(
    postId: number,
    commentData: { userId: number; content: string; parentId?: number }
  ): Promise<Comment> {
    const newComment = await prisma.comment.create({
      data: {
        post: {
          connect: { postId: postId },
        },
        user: {
          connect: { userId: commentData.userId },
        },
        content: commentData.content,
        // parentId가 제공되면 부모 댓글과 연결합니다.
        ...(commentData.parentId && {
          parent: {
            connect: { commentId: commentData.parentId },
          },
        }),
      },
    });
    return newComment;
  }

  /**
   * 특정 댓글을 업데이트합니다.
   * @param commentId - 업데이트할 댓글 ID
   * @param updateData - 업데이트할 데이터 { content? }
   * @returns 업데이트된 Comment 객체
   */
  public async update(
    commentId: number,
    updateData: Partial<Comment>
  ): Promise<Comment> {
    const updatedComment = await prisma.comment.update({
      where: { commentId: commentId },
      data: { ...updateData, updatedAt: new Date() }, // updatedAt 자동 업데이트
    });
    return updatedComment;
  }

  /**
   * 특정 댓글을 삭제합니다.
   * (schema.prisma의 onDelete: SetNull 설정으로 대댓글의 parentId는 자동으로 null이 됩니다.)
   * @param commentId - 삭제할 댓글 ID
   * @returns 삭제된 레코드 수 (0 또는 1)
   */
  public async delete(commentId: number): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { commentId: commentId },
    });
    return result.count;
  }

  /**
   * 특정 댓글 ID로 댓글을 조회합니다.
   * @param commentId - 조회할 댓글 ID
   * @returns Comment 객체 또는 null (작성자 닉네임 포함)
   */
  public async findById(
    commentId: number
  ): Promise<(Comment & { user: { nickname: string } | null }) | null> {
    const comment = await prisma.comment.findUnique({
      where: { commentId: commentId },
      include: { user: { select: { nickname: true } } }, // 작성자 닉네임 포함
    });
    return comment;
  }

  /**
   * 특정 게시물에 연결된 모든 댓글을 삭제합니다. (게시물 삭제 시 사용)
   * @param postId - 게시물 ID
   * @returns 삭제된 레코드 수
   */
  public async deleteManyByPostId(postId: number): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { postId: postId },
    });
    return result.count;
  }
}
