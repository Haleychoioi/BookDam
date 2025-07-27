// src/repositories/comments.repository.ts

import prisma from "../utils/prisma";
import { Comment, Prisma } from "@prisma/client";

export class CommentRepository {
  /**
   * 특정 게시물 ID에 해당하는 댓글 목록을 조회합니다.
   * @param postId - 게시물 ID
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns Comment 배열 (최상위 댓글 및 1단계 대댓글 포함)
   */
  public async findManyByPostId(
    postId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<Comment[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.CommentFindManyArgs = {
      where: {
        postId: postId,
        parentId: null, // 최상위 댓글만 가져오고, 대댓글은 include로 가져옵니다.
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
            user: { select: { nickname: true } },
          },
        },
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      // 'oldest' 정렬 추가 (선택 사항)
      findManyOptions.orderBy = { createdAt: "asc" };
    }

    const comments = await prisma.comment.findMany(findManyOptions);
    return comments;
  }

  /**
   * 새로운 댓글을 생성합니다.
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
        postId: postId,
        ...commentData,
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
      data: updateData,
    });
    return updatedComment;
  }

  /**
   * 특정 댓글을 삭제합니다.
   * @param commentId - 삭제할 댓글 ID
   */
  public async delete(commentId: number): Promise<void> {
    await prisma.comment.delete({
      where: { commentId: commentId },
    });
  }

  /**
   * 특정 댓글 ID로 댓글을 조회합니다.
   * @param commentId - 조회할 댓글 ID
   * @returns Comment 객체 또는 null
   */
  public async findById(commentId: number): Promise<Comment | null> {
    const comment = await prisma.comment.findUnique({
      where: { commentId: commentId },
      include: { user: { select: { nickname: true } } },
    });
    return comment;
  }
}
