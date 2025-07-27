// src/repositories/team-posts.repository.ts

import prisma from "../utils/prisma";
import { TeamPost, TeamPostType, Prisma } from "@prisma/client";

export class TeamPostRepository {
  /**
   * 특정 커뮤니티 ID에 해당하는 팀 게시물 목록을 조회합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns TeamPost 배열
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
            nickname: true, // 작성자 닉네임 포함
          },
        },
        _count: {
          select: { comments: true }, // 댓글 수 포함
        },
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    }

    const teamPosts = await prisma.teamPost.findMany(findManyOptions);
    return teamPosts;
  }

  /**
   * 새로운 팀 게시물을 생성합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param postData - 생성할 게시물 데이터
   * @returns 생성된 TeamPost 객체
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
   * 특정 팀 게시물을 업데이트합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param teamPostId - 업데이트할 팀 게시물 ID
   * @param updateData - 업데이트할 데이터
   * @returns 업데이트된 TeamPost 객체
   */
  public async update(
    communityId: number,
    teamPostId: number,
    updateData: Partial<TeamPost>
  ): Promise<TeamPost> {
    const updatedTeamPost = await prisma.teamPost.update({
      where: {
        teamPostId: teamPostId,
        teamId: communityId, // 해당 커뮤니티의 게시물인지 확인
      },
      data: updateData,
    });
    return updatedTeamPost;
  }

  /**
   * 특정 팀 게시물을 삭제합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param teamPostId - 삭제할 팀 게시물 ID
   */
  public async delete(communityId: number, teamPostId: number): Promise<void> {
    await prisma.teamPost.delete({
      where: {
        teamPostId: teamPostId,
        teamId: communityId, // 해당 커뮤니티의 게시물인지 확인
      },
    });
  }

  /**
   * 특정 팀 게시물 ID로 상세 정보를 조회합니다.
   * @param teamPostId - 조회할 팀 게시물 ID
   * @returns TeamPost 객체 또는 null
   */
  public async findById(teamPostId: number): Promise<TeamPost | null> {
    const teamPost = await prisma.teamPost.findUnique({
      where: { teamPostId: teamPostId },
      include: {
        user: {
          select: { nickname: true }, // 작성자 닉네임 포함
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
}
