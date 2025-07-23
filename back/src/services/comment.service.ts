import prisma from "../utils/prisma";

export const commentService = {
  // 특정 게시물의 댓글 목록 조회
  async getCommentsByPostId(
    postId: number,
    { page, size, sort }: { page: number; size: number; sort: string }
  ) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    if (sort === "latest") {
      orderBy.createdAt = "desc";
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          // 작성자 정보 포함
          select: {
            userId: true,
            nickname: true,
          },
        },
      },
      orderBy,
      skip,
      take: size,
    });

    const totalCount = await prisma.comment.count({
      where: { postId },
    });
    const totalPages = Math.ceil(totalCount / size);

    const formattedComments = comments.map((comment) => ({
      id: comment.commentId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user.nickname,
      authorId: comment.user.userId,
      postId: comment.postId,
    }));

    return { comments: formattedComments, totalPages, currentPage: page };
  },

  // 특정 게시물에 댓글 작성
  async createComment(postId: number, userId: number, content: string) {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
    });
    return newComment;
  },

  // 특정 댓글 수정
  async updateComment(commentId: number, userId: number, content: string) {
    const comment = await prisma.comment.findUnique({
      where: { commentId },
      select: { userId: true },
    });

    if (!comment || comment.userId !== userId) {
      return null;
    }

    const updatedComment = await prisma.comment.update({
      where: { commentId },
      data: { content },
    });
    return updatedComment;
  },

  // 특정 댓글 삭제
  async deleteComment(commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: { commentId },
      select: { userId: true },
    });

    if (!comment || comment.userId !== userId) {
      return false;
    }

    await prisma.comment.delete({
      where: { commentId },
    });
    return true;
  },
};
