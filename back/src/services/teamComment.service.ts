import prisma from "../utils/prisma";

export const teamCommentService = {
  // 특정 팀 게시물의 댓글 목록 조회
  async getTeamCommentsByTeamPostId(
    teamPostId: number,
    { page, size, sort }: { page: number; size: number; sort: string }
  ) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    orderBy.createdAt = "desc";

    const comments = await prisma.teamComment.findMany({
      where: {
        teamPostId,
        parentId: null, // 최상위 댓글만 조회
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

    const totalCount = await prisma.teamComment.count({
      where: { teamPostId, parentId: null }, // 최상위 댓글 수만 카운트
    });
    const totalPages = Math.ceil(totalCount / size);

    // 응답 형식에 맞게 데이터 가공
    const formattedComments = comments.map((comment) => ({
      id: comment.teamCommentId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user.nickname,
      authorId: comment.user.userId,
      teamPostId: comment.teamPostId,
      parentId: comment.parentId,
      replies: comment.replies.map((reply) => ({
        // 대댓글 목록
        id: reply.teamCommentId,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.user.nickname,
        authorId: reply.user.userId,
        teamPostId: reply.teamPostId,
        parentId: reply.parentId,
      })),
    }));

    return { comments: formattedComments, totalPages, currentPage: page };
  },

  // 특정 팀 게시물에 댓글 작성 (대댓글 기능 추가)
  async createTeamComment(
    teamPostId: number,
    userId: number,
    content: string,
    parentId?: number
  ) {
    // 사용자가 해당 팀 게시물의 팀에 속하는지 확인
    const teamPost = await prisma.teamPost.findUnique({
      where: { teamPostId },
      select: { teamId: true },
    });

    if (!teamPost) {
      throw new Error("유효하지 않은 팀 게시물입니다.");
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId: teamPost.teamId },
      },
    });

    if (!teamMember) {
      throw new Error("해당 팀의 멤버만 댓글을 작성할 수 있습니다.");
    }

    // parentId가 제공되면 해당 부모 댓글이 존재하는지 확인 (선택 사항이지만 유효성 검사 강화)
    if (parentId) {
      const parentComment = await prisma.teamComment.findUnique({
        where: { teamCommentId: parentId },
      });
      if (!parentComment) {
        throw new Error("유효하지 않은 부모 댓글 ID입니다.");
      }
      // 부모 댓글이 현재 팀 게시물에 속하는지 확인
      if (parentComment.teamPostId !== teamPostId) {
        throw new Error("부모 댓글이 해당 팀 게시물에 속하지 않습니다.");
      }
    }

    const newComment = await prisma.teamComment.create({
      data: {
        teamPostId,
        userId,
        content,
        parentId, // parentId가 있으면 대댓글로 생성
      },
    });
    return newComment;
  },

  // 특정 팀 댓글 수정
  async updateTeamComment(
    teamCommentId: number,
    userId: number,
    content: string
  ) {
    const comment = await prisma.teamComment.findUnique({
      where: { teamCommentId },
      select: { userId: true },
    });

    if (!comment || comment.userId !== userId) {
      return null; // 댓글 없거나, 작성자가 아님
    }

    const updatedComment = await prisma.teamComment.update({
      where: { teamCommentId },
      data: { content },
    });
    return updatedComment;
  },

  // 특정 팀 댓글 삭제
  async deleteTeamComment(teamCommentId: number, userId: number) {
    const comment = await prisma.teamComment.findUnique({
      where: { teamCommentId },
      select: { userId: true },
    });

    if (!comment || comment.userId !== userId) {
      return false; // 댓글 없거나, 작성자가 아님
    }

    // 대댓글이 있는 경우, 대댓글도 함께 삭제 (onDelete: Cascade 설정에 따라 자동 처리되지만, 명시적 로직 추가도 가능)
    // Prisma 스키마에서 onDelete: SetNull로 설정했으므로, 부모 댓글 삭제 시 자식 댓글의 parentId는 null이 됩니다.
    // 만약 부모 댓글 삭제 시 자식 댓글도 함께 삭제하려면 스키마의 onDelete를 Cascade로 변경해야 합니다.
    // 현재 스키마는 SetNull이므로, 부모 댓글만 삭제됩니다.

    await prisma.teamComment.delete({
      where: { teamCommentId },
    });
    return true;
  },
};
