import prisma from "../utils/prisma";

export const teamCommentService = {
  // 특정 팀 게시물의 댓글 목록 조회
  async getTeamCommentsByTeamPostId(
    teamPostId: number,
    { page, size, sort }: { page: number; size: number; sort: string }
  ) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    if (sort === "latest") {
      orderBy.createdAt = "desc";
    }

    const comments = await prisma.teamComment.findMany({
      where: { teamPostId },
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

    const totalCount = await prisma.teamComment.count({
      where: { teamPostId },
    });
    const totalPages = Math.ceil(totalCount / size);

    const formattedComments = comments.map((comment) => ({
      id: comment.teamCommentId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user.nickname,
      authorId: comment.user.userId,
      teamPostId: comment.teamPostId,
    }));

    return { comments: formattedComments, totalPages, currentPage: page };
  },

  // 특정 팀 게시물에 댓글 작성
  async createTeamComment(teamPostId: number, userId: number, content: string) {
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

    const newComment = await prisma.teamComment.create({
      data: {
        teamPostId,
        userId,
        content,
      },
    });
    return newComment;
  },

  // TODO: 특정 팀 댓글 수정 (PUT /teamComments/:id)
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
      return null;
    }

    const updatedComment = await prisma.teamComment.update({
      where: { teamCommentId },
      data: { content },
    });
    return updatedComment;
  },

  // TODO: 특정 팀 댓글 삭제 (DELETE /teamComments/:id)
  async deleteTeamComment(teamCommentId: number, userId: number) {
    const comment = await prisma.teamComment.findUnique({
      where: { teamCommentId },
      select: { userId: true },
    });

    if (!comment || comment.userId !== userId) {
      return false;
    }

    await prisma.teamComment.delete({
      where: { teamCommentId },
    });
    return true;
  },
};
