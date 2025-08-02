// src/repositories/comments.repository.ts

import prisma from "../utils/prisma";
import { Comment, Prisma, PostType } from "@prisma/client";

// Prisma의 findUnique/findMany 타입
// Comment 모델에 user (nickname만 포함), replies (Comment와 user 포함) 관계가 포함된 형태
type CommentWithRelations = Comment & {
  user: { nickname: string } | null;
  replies: (Comment & { user: { nickname: string } | null })[];
};

// 사용자가 작성한 댓글 조회 시 게시물 제목을 포함하기 위한 타입
type CommentWithPostTitle = Comment & {
  post: { title: string } | null;
};

export class CommentRepository {

  public async findByUserId(
    userId: number,
    type?: PostType
  ): Promise<Comment[]> {
    const where: Prisma.CommentWhereInput = {
      userId: userId,
    };

    // type 파라미터가 있으면, 연결된 post의 type을 조건으로 추가합니다.
    if (type) {
      where.post = {
        type: type,
      };
    }

    return prisma.comment.findMany({
      where,
      include: {
        post: {
          select: {
            postId: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }


  /**
   * 특정 게시물 ID에 해당하는 댓글 목록 조회
   * 최상위 댓글, 1단계 대댓글
   * @param postId
   * @param query
   * @returns
   */
  public async findManyByPostId(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<CommentWithRelations[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.CommentFindManyArgs = {
      where: {
        postId: postId,
        parentId: null, // 최상위 댓글만
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { nickname: true },
        },
        replies: {
          // 대댓글 포함 (1단계만)
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true } },
          },
        },
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      findManyOptions.orderBy = { createdAt: "asc" };
    } else {
      findManyOptions.orderBy = { createdAt: "asc" };
    }

    const comments = await prisma.comment.findMany(findManyOptions);
    return comments as CommentWithRelations[];
  }

  /**
   * 새로운 댓글 생성(대댓글 포함)
   * @param postId
   * @param commentData
   * @returns
   * @remarks
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
        // parentId가 제공되면 부모 댓글과 연결
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
   * 특정 댓글 업데이트
   * @param commentId
   * @param updateData
   * @returns
   * @remarks
   */
  public async update(
    commentId: number,
    updateData: Partial<Comment>
  ): Promise<Comment> {
    const updatedComment = await prisma.comment.update({
      where: { commentId: commentId },
      data: { ...updateData, updatedAt: new Date() },
    });
    return updatedComment;
  }

  /**
   * 특정 댓글 삭제
   * @param commentId
   * @returns
   * @remarks
   */
  public async delete(commentId: number): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { commentId: commentId },
    });
    return result.count;
  }

  /**
   * 특정 댓글 ID로 댓글 조회
   * @param commentId
   * @returns
   * @remarks
   */
  public async findById(
    commentId: number
  ): Promise<CommentWithRelations | null> {
    const comment = await prisma.comment.findUnique({
      where: { commentId: commentId },
      include: {
        user: { select: { nickname: true } },
        replies: {
          include: { user: { select: { nickname: true } } },
        },
      },
    });
    return comment;
  }

  /**
   * 특정 게시물에 연결된 모든 댓글 삭제(게시물 삭제 시 사용)
   * @param postId
   * @returns
   * @remarks
   */
  public async deleteManyByPostId(postId: number): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { postId: postId },
    });
    return result.count;
  }
}
