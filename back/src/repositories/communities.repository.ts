// src/repositories/communities.repository.ts

import prisma from "../utils/prisma";
import {
  TeamApplication,
  TeamCommunity,
  CommunityStatus,
  Prisma,
} from "@prisma/client";

// 반환 타입에 hasApplied 추가
type CommunityWithApplicationStatus = TeamCommunity & {
  hasApplied?: boolean; // ✨ hasApplied 필드 추가 ✨
  recruitmentPost?: {
    // applications를 포함할 수 있도록 옵셔널하게 추가 (include 시에만 존재)
    applications?: { applicationId: number }[];
  } | null;
};

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
   * 모든 커뮤니티 조회 (현재는 모집 중인 커뮤니티만 필터링)
   * @param query
   * @returns
   * @remarks
   */
  public async findMany(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
    userId?: number; // ✨ userId 추가 ✨
  }): Promise<CommunityWithApplicationStatus[]> {
    // ✨ 반환 타입 변경 ✨
    const { page = 1, pageSize = 10, sort, userId } = query; // ✨ userId 구조 분해 할당 ✨
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.TeamCommunityFindManyArgs = {
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where: {
        status: CommunityStatus.RECRUITING,
      },
      // ✨ userId가 있을 경우 applications 포함하여 조회 ✨
      // _count를 사용하여 신청 여부 확인 (Prisma 2.x 이상)
      include: {
        recruitmentPost: userId
          ? {
              include: {
                _count: {
                  select: {
                    applications: {
                      where: {
                        userId: userId,
                      },
                    },
                  },
                },
              },
            }
          : undefined, // userId 없으면 recruitmentPost도 include 안함
      },
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "popular") {
      // TODO: 인기순 정렬 로직 추가 (예: 멤버 수, 게시글 수 등)
    }

    const communities = await prisma.teamCommunity.findMany(findManyOptions);

    // ✨ hasApplied 필드 추가 로직 (데이터 변환) ✨
    const communitiesWithStatus = communities.map((community: any) => {
      // ✨ community.recruitmentPost?._count?.applications가 null/undefined일 경우 0으로 처리 ✨
      const hasApplied =
        userId && (community.recruitmentPost?._count?.applications ?? 0) > 0;
      console.log(
        `Community ID: ${community.teamId}, UserId: ${userId}, Applications Count: ${community.recruitmentPost?._count?.applications}, hasApplied: ${hasApplied}`
      ); // ✨ 디버깅 로그 ✨
      return {
        ...community,
        hasApplied: hasApplied,
      };
    }) as CommunityWithApplicationStatus[];

    return communitiesWithStatus;
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
    query: { size?: number; userId?: number } // ✨ userId 추가 ✨
  ): Promise<CommunityWithApplicationStatus[]> {
    // ✨ 반환 타입 변경 ✨
    const { size, userId } = query; // ✨ userId 구조 분해 할당 ✨
    const findManyOptions: Prisma.TeamCommunityFindManyArgs = {
      where: { isbn13: bookIsbn13, status: CommunityStatus.RECRUITING }, // ✨ 모집 중인 커뮤니티만 필터링 추가 ✨
      take: size,
      orderBy: { createdAt: "desc" },
      // ✨ userId가 있을 경우 applications 포함하여 조회 ✨
      include: {
        recruitmentPost: userId
          ? {
              include: {
                _count: {
                  select: {
                    applications: {
                      where: {
                        userId: userId,
                      },
                    },
                  },
                },
              },
            }
          : undefined,
      },
    };
    const communities = await prisma.teamCommunity.findMany(findManyOptions);

    // ✨ hasApplied 필드 추가 로직 ✨
    const communitiesWithStatus = communities.map((community: any) => {
      // any 사용
      const hasApplied =
        userId && (community.recruitmentPost?._count?.applications ?? 0) > 0;
      console.log(
        `Book ISBN13: ${bookIsbn13}, Community ID: ${community.teamId}, UserId: ${userId}, Applications Count: ${community.recruitmentPost?._count?.applications}, hasApplied: ${hasApplied}`
      ); // ✨ 디버깅 로그 ✨
      return {
        ...community,
        hasApplied: hasApplied,
      };
    }) as CommunityWithApplicationStatus[];

    return communitiesWithStatus;
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
