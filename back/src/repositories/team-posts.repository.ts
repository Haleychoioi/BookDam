// src/zip/repositories/team-posts.repository.ts

import prisma from "../utils/prisma";
import { TeamPost, TeamPostType, Prisma } from "@prisma/client";

export class TeamPostRepository {
  public async findByUserId(userId: number): Promise<TeamPost[]> {
    return prisma.teamPost.findMany({
      where: { userId: userId },
      include: {
        user: { select: { nickname: true, profileImage: true } },
        _count: { select: { comments: true } },
        team: { select: { teamId: true, postTitle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async findManyByCommunityId(
    communityId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<TeamPost[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.TeamPostFindManyArgs = {
      where: {
        teamId: communityId,
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else {
      findManyOptions.orderBy = { createdAt: "desc" };
    }

    const teamPosts = await prisma.teamPost.findMany(findManyOptions);
    return teamPosts;
  }

  public async create(
    communityId: number,
    postData: {
      userId: number;
      title: string;
      content: string;
      type?: TeamPostType;
    }
  ): Promise<TeamPost> {
    const newTeamPost = await prisma.teamPost.create({
      data: {
        teamId: communityId,
        ...postData,
      },
    });
    return newTeamPost;
  }

  public async update(
    communityId: number,
    teamPostId: number,
    updateData: Partial<TeamPost>
  ): Promise<TeamPost> {
    const updatedTeamPost = await prisma.teamPost.update({
      where: {
        teamPostId: teamPostId,
        teamId: communityId,
      },
      data: updateData,
    });
    return updatedTeamPost;
  }

  public async delete(communityId: number, teamPostId: number): Promise<void> {
    await prisma.teamPost.delete({
      where: {
        teamPostId: teamPostId,
        teamId: communityId,
      },
    });
  }

  public async findById(teamPostId: number): Promise<TeamPost | null> {
    const teamPost = await prisma.teamPost.findUnique({
      where: { teamPostId: teamPostId },
      include: {
        user: {
          select: { nickname: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true } },
            replies: {
              include: { user: { select: { nickname: true } } },
            },
          },
        },
      },
    });
    return teamPost;
  }

  // ✨ 추가: 특정 팀의 모든 팀 게시물 삭제 ✨
  public async deleteManyByTeamId(teamId: number): Promise<number> {
    const result = await prisma.teamPost.deleteMany({
      where: { teamId: teamId },
    });
    return result.count;
  }

  public async countPostsByTeamId(teamId: number): Promise<number> {
    const count = await prisma.teamPost.count({
      where: { teamId: teamId },
    });
    return count;
  }
}
