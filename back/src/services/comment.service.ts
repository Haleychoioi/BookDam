import prisma from "../utils/prisma";

export const commentService = {
  // 특정 게시물의 댓글 목록 조회
  async getCommentsByPostId(
    postId: number,
    { page, size, sort }: { page: number; size: number; sort: string }
  ) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    orderBy.createdAt = "desc";

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // 최상위 댓글만 조회 (대댓글은 replies 필드로 가져옴)
      },
      include: {
        user: {
          select: {
            userId: true,
            nickname: true,
          },
        },
        replies: {
          // 대댓글 포함
          include: {
            user: {
              // 대댓글 작성자 정보
              select: {
                userId: true,
                nickname: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy,
      skip,
      take: size,
    });

    const totalCount = await prisma.comment.count({
      where: { postId, parentId: null }, // 최상위 댓글 수만 카운트
    });
    const totalPages = Math.ceil(totalCount / size);

    // 응답 형식에 맞게 데이터 가공
    const formattedComments = comments.map((comment) => ({
      id: comment.commentId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user.nickname,
      authorId: comment.user.userId,
      postId: comment.postId,
      parentId: comment.parentId,
      replies: comment.replies.map((reply) => ({
        // 대댓글 목록
        id: reply.commentId,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.user.nickname,
        authorId: reply.user.userId,
        postId: reply.postId,
        parentId: reply.parentId,
      })),
    }));

    return { comments: formattedComments, totalPages, currentPage: page };
  },

  // 특정 게시물에 댓글 작성 (대댓글 기능 추가)
  async createComment(
    postId: number,
    userId: number,
    content: string,
    parentId?: number
  ) {
    // parentId가 제공되면 해당 부모 댓글이 존재하는지 확인
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { commentId: parentId },
      });
      if (!parentComment) {
        throw new Error("유효하지 않은 부모 댓글 ID입니다.");
      }
      // 부모 댓글이 현재 게시물에 속하는지 확인
      if (parentComment.postId !== postId) {
        throw new Error("부모 댓글이 해당 게시물에 속하지 않습니다.");
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId, // parentId가 있으면 대댓글로 생성
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
      return false; // 댓글 없거나, 작성자가 아님
    }

    // 대댓글이 있는 경우, 대댓글도 함께 삭제 (onDelete: Cascade 설정에 따라 자동 처리되지만, 명시적 로직 추가도 가능)
    // Prisma 스키마에서 onDelete: SetNull로 설정했으므로, 부모 댓글 삭제 시 자식 댓글의 parentId는 null이 됩니다.
    // 만약 부모 댓글 삭제 시 자식 댓글도 함께 삭제하려면 스키마의 onDelete를 Cascade로 변경해야 합니다.
    // 현재 스키마는 SetNull이므로, 부모 댓글만 삭제됩니다.

    await prisma.comment.delete({
      where: { commentId },
    });
    return true;
  },
};
