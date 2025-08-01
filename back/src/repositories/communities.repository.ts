// src/repositories/communities.repository.ts

import prisma from "../utils/prisma";
import { TeamCommunity, CommunityStatus, Prisma } from "@prisma/client";

export class CommunityRepository {
  /**
   * 모든 커뮤니티를 조회합니다.
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns TeamCommunity 배열
   * @remarks 해당 조건에 맞는 커뮤니티가 없으면 빈 배열을 반환합니다.
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
      orderBy: { createdAt: "desc" }, // 기본 최신순 정렬
    };

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "popular") {
      // TODO: 인기순 정렬 로직 추가 (예: 멤버 수, 게시글 수 등)
      // 현재는 구현되어 있지 않으므로, 필요에 따라 추가 개발이 필요합니다.
    }

    const communities = await prisma.teamCommunity.findMany(findManyOptions);
    return communities;
  }

  /**
   * 새로운 커뮤니티를 생성합니다.
   * @param communityData - 생성할 커뮤니티 데이터 { postId, isbn13?, status, postTitle, postContent, postAuthor }
   * @returns 생성된 TeamCommunity 객체
   * @remarks Prisma의 `create`는 연결된 `postId`가 존재하지 않거나 다른 제약 조건 위반 시 에러를 던질 수 있습니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * 특정 커뮤니티를 업데이트합니다.
   * @param teamId - 업데이트할 커뮤니티 ID
   * @param updateData - 업데이트할 데이터 (Partial<TeamCommunity> 타입)
   * @returns 업데이트된 TeamCommunity 객체
   * @remarks Prisma의 `update`는 `teamId`에 해당하는 레코드가 없으면 `RecordNotFound` 에러를 던집니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async update(
    teamId: number,
    updateData: Partial<TeamCommunity>
  ): Promise<TeamCommunity> {
    const updatedCommunity = await prisma.teamCommunity.update({
      where: { teamId: teamId },
      data: updateData,
    });
    return updatedCommunity;
  }

  // NOTE: updateDetails 메서드는 서비스 계층에서 직접 호출되지 않고,
  // update 메서드를 통해 필요한 업데이트가 처리되므로 이 레포지토리에서 제거합니다.
  // public async updateDetails(
  //   teamId: number,
  //   updateData: {
  //     title?: string;
  //     content?: string;
  //     maxMembers?: number;
  //     recruiting?: boolean;
  //   }
  // ): Promise<TeamCommunity> {
  //   // ... (기존 로직) ...
  // }

  /**
   * 특정 도서 ISBN13으로 커뮤니티 목록을 조회합니다.
   * @param bookIsbn13 - 도서 ISBN13
   * @param query - 조회 옵션 { size }
   * @returns TeamCommunity 배열
   * @remarks 해당 `bookIsbn13`에 대한 커뮤니티가 없으면 빈 배열을 반환합니다.
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
   * 특정 커뮤니티 ID로 커뮤니티를 조회합니다.
   * @param teamId - 조회할 커뮤니티 ID
   * @returns TeamCommunity 객체 또는 null (커뮤니티를 찾을 수 없는 경우)
   */
  public async findById(teamId: number): Promise<TeamCommunity | null> {
    const community = await prisma.teamCommunity.findUnique({
      where: { teamId: teamId },
    });
    return community;
  }

  /**
   * 특정 커뮤니티를 삭제합니다.
   * @param teamId - 삭제할 커뮤니티 ID
   * @returns 삭제된 레코드의 수 (0 또는 1)
   * @remarks `deleteMany`는 삭제된 레코드 수를 반환하며, 해당 ID의 레코드가 없어도 에러를 던지지 않고 0을 반환합니다.
   * 이 반환 값은 서비스 계층에서 확인하여 처리됩니다.
   * Prisma의 `deleteMany`는 해당 `teamId`에 맞는 레코드가 없어도 에러를 던지지 않으므로, `try...catch`는 일반적인 DB 오류를 위함입니다.
   */
  public async delete(teamId: number): Promise<number> {
    try {
      const result = await prisma.teamCommunity.deleteMany({
        where: { teamId: teamId },
      });
      return result.count;
    } catch (error) {
      console.error(`Error deleting community ${teamId}:`, error);
      // Prisma 에러를 포함하여 상위 계층으로 다시 던집니다.
      throw error;
    }
  }
}
