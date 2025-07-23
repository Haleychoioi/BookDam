import prisma from "../utils/prisma";
import { TeamPostType, TeamRole } from "@prisma/client";

export const teamPostService = {
  // 특정 커뮤니티 (팀) 내부 게시물 목록 조회
  async getTeamPosts(
    teamId: number,
    { page, size, sort }: { page: number; size: number; sort: string }
  ) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    if (sort === "latest") {
      orderBy.createdAt = "desc";
    }

    const teamPosts = await prisma.teamPost.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            nickname: true,
            userId: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip,
      take: size,
    });

    const totalCount = await prisma.teamPost.count({ where: { teamId } });
    const totalPages = Math.ceil(totalCount / size);

    const formattedPosts = teamPosts.map((post) => ({
      id: post.teamPostId,
      title: post.title,
      content: post.content,
      type: post.type,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user.nickname,
      authorId: post.user.userId,
      commentCount: post._count.comments,
    }));

    return { teamPosts: formattedPosts, totalPages, currentPage: page };
  },

  // 특정 커뮤니티 (팀) 내부 게시물 작성
  async createTeamPost(
    userId: number,
    teamId: number,
    {
      title,
      content,
      type,
    }: { title: string; content: string; type: TeamPostType }
  ) {
    // 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (!teamMember) {
      throw new Error("해당 팀의 멤버가 아닙니다.");
    }

    // 공지글(NOTICE)은 팀장만 작성 가능
    if (type === TeamPostType.NOTICE && teamMember.role !== TeamRole.LEADER) {
      throw new Error("공지글은 팀장만 작성할 수 있습니다.");
    }

    const newTeamPost = await prisma.teamPost.create({
      data: {
        userId,
        teamId,
        title,
        content,
        type,
      },
    });
    return newTeamPost;
  },

  // 팀 내부 게시물 상세 조회
  async getTeamPostById(teamPostId: number) {
    const post = await prisma.teamPost.findUnique({
      where: { teamPostId },
      include: {
        user: { select: { userId: true, nickname: true } },
        team: { select: { teamId: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) return null;

    return {
      id: post.teamPostId,
      title: post.title,
      content: post.content,
      type: post.type,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user.nickname,
      authorId: post.user.userId,
      teamId: post.team.teamId,
      commentCount: post._count.comments,
    };
  },

  // 팀 내부 게시물 수정
  async updateTeamPost(
    teamPostId: number,
    userId: number,
    {
      title,
      content,
      type,
    }: { title?: string; content?: string; type?: TeamPostType }
  ) {
    const post = await prisma.teamPost.findUnique({
      where: { teamPostId },
      select: { userId: true, teamId: true },
    });

    if (!post || post.userId !== userId) {
      return null;
    }

    // 공지글(NOTICE) 타입으로 변경은 팀장만 가능하게 할 수 있음
    const updatedPost = await prisma.teamPost.update({
      where: { teamPostId },
      data: { title, content, type },
    });
    return updatedPost;
  },

  // 팀 내부 게시물 삭제
  async deleteTeamPost(teamPostId: number, userId: number) {
    const post = await prisma.teamPost.findUnique({
      where: { teamPostId },
      select: {
        userId: true,
        team: { select: { members: { where: { role: TeamRole.LEADER } } } },
      },
    });

    if (!post) {
      return false;
    }

    // 작성자 본인 또는 팀장만 삭제 가능
    const isLeader = post.team.members.some(
      (member) => member.userId === userId && member.role === TeamRole.LEADER
    );

    if (post.userId !== userId && !isLeader) {
      return false;
    }

    await prisma.teamPost.delete({
      where: { teamPostId },
    });
    return true;
  },
};
