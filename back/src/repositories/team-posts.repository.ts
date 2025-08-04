// src/repositories/team-posts.repository.ts

import prisma from "../utils/prisma";
import { TeamPost, TeamPostType, Prisma } from "@prisma/client";

export class TeamPostRepository {
  public async findByUserId(userId: number): Promise<TeamPost[]> {
    return prisma.teamPost.findMany({
      where: { userId: userId },
      include: {
        user: { select: { nickname: true, profileImage: true } },
        _count: { select: { comments: true } },
        // 어느 팀의 게시글인지 알 수 있도록 팀 정보를 포함합니다.
        team: { select: { teamId: true, postTitle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 특정 커뮤니티 ID에 해당하는 팀 게시물 목록 조회
   * @param communityId
   * @param query
   * @returns
   * @remarks
   */
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

  /**
   * 새로운 팀 게시물 생성
   * @param communityId
   * @param postData
   * @returns
   * @remarks
   */
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

  /**
   * 특정 팀 게시물 업데이트
   * @param communityId
   * @param teamPostId
   * @param updateData
   * @returns
   * @remarks
   */
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

  /**
   * 특정 팀 게시물 삭제
   * @param communityId
   * @param teamPostId
   * @returns
   * @remarks P
   */
  public async delete(communityId: number, teamPostId: number): Promise<void> {
    await prisma.teamPost.delete({
      where: {
        teamPostId: teamPostId,
        teamId: communityId,
      },
    });
  }

  /**
   * 특정 팀 게시물 ID로 상세 정보 조회
   * @param teamPostId
   * @returns
   * @remarks
   */
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
              // 대댓글 포함 (1단계만)
              include: { user: { select: { nickname: true } } },
            },
          },
        },
      },
    });
    return teamPost;
  }
}
