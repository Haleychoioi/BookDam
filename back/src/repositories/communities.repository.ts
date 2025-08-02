// src/repositories/communities.repository.ts

import prisma from "../utils/prisma";
import {
  TeamApplication,
  TeamCommunity,
  CommunityStatus,
  Prisma,
} from "@prisma/client";

type CommunityWithRecruitingInfo = TeamCommunity & {
  recruitmentPost: {
    applications: (TeamApplication & {
      user: {
        userId: number;
        nickname: string;
      };
    })[];
  };
};

export class CommunityRepository {
  public async findRecruitingByHostId(
    hostId: number
  ): Promise<CommunityWithRecruitingInfo[]> {
    const communities = await prisma.teamCommunity.findMany({
      where: {
        recruitmentPost: {
          userId: hostId,
        },
        status: CommunityStatus.RECRUITING,
      },
      include: {
        recruitmentPost: {
          include: {
            applications: {
              include: {
                user: {
                  select: {
                    userId: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return communities as CommunityWithRecruitingInfo[];
  }

  public async findActiveByMemberId(userId: number): Promise<TeamCommunity[]> {
    const communities = await prisma.teamCommunity.findMany({
      where: {
        status: CommunityStatus.ACTIVE,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return communities;
  }

  /**
   * 모든 커뮤니티 조회
   * @param query
   * @returns
   * @remarks
   */
  public async findMany(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<TeamCommunity[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.TeamCommunityFindManyArgs = {
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "popular") {
      // TODO: 인기순 정렬 로직 추가 (예: 멤버 수, 게시글 수 등)
    }

    const communities = await prisma.teamCommunity.findMany(findManyOptions);
    return communities;
  }

  /**
   * 새로운 커뮤니티 생성
   * @param communityData
   * @returns
   * @remarks
   */
  public async create(communityData: {
    postId: number;
    isbn13?: string;
    status: CommunityStatus;
    postTitle: string;
    postContent: string;
    postAuthor: string;
  }): Promise<TeamCommunity> {
    const newCommunity = await prisma.teamCommunity.create({
      data: communityData,
    });
    return newCommunity;
  }

  /**
   * 특정 커뮤니티 업데이트
   * @param teamId
   * @param updateData
   * @returns
   * @remarks
   */
  public async update(
    // 기존 update 메서드를 활용하여 status도 업데이트 가능하게
    teamId: number,
    updateData: Partial<TeamCommunity>
  ): Promise<TeamCommunity> {
    const updatedCommunity = await prisma.teamCommunity.update({
      where: { teamId: teamId },
      data: updateData,
    });
    return updatedCommunity;
  }

  /**
   * 특정 도서 ISBN13으로 커뮤니티 목록 조회
   * @param bookIsbn13
   * @param query
   * @returns
   * @remarks
   */
  public async findByBookIsbn13(
    bookIsbn13: string,
    query: { size?: number }
  ): Promise<TeamCommunity[]> {
    const { size } = query;
    const findManyOptions: Prisma.TeamCommunityFindManyArgs = {
      where: { isbn13: bookIsbn13 },
      take: size,
      orderBy: { createdAt: "desc" },
    };
    const communities = await prisma.teamCommunity.findMany(findManyOptions);
    return communities;
  }

  /**
   * 특정 커뮤니티 ID로 커뮤니티 조회
   * @param teamId
   * @returns
   */
  public async findById(teamId: number): Promise<TeamCommunity | null> {
    const community = await prisma.teamCommunity.findUnique({
      where: { teamId: teamId },
    });
    return community;
  }

  /**
   * 특정 커뮤니티 삭제
   * @param teamId
   * @returns
   * @remarks
   */
  public async delete(teamId: number): Promise<number> {
    try {
      const result = await prisma.teamCommunity.deleteMany({
        where: { teamId: teamId },
      });
      return result.count;
    } catch (error) {
      console.error(`Error deleting community ${teamId}:`, error);
      throw error;
    }
  }

  public async findEndedByHostId(hostId: number): Promise<TeamCommunity[]> {
    return prisma.teamCommunity.findMany({
      where: {
        recruitmentPost: {
          // 모집글의 userId가 hostId와 일치하는 조건
          userId: hostId,
        },
        status: CommunityStatus.CLOSED, // 모집 종료 상태인 커뮤니티만 조회
      },
      // 필요한 경우 include를 추가하여 관련 데이터를 함께 가져옵니다.
      // include: {
      //   recruitmentPost: true,
      //   members: true,
      // },
      orderBy: { createdAt: "desc" },
    });
  }
}
