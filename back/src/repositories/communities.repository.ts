// src/repositories/communities.repository.ts

import prisma from "../utils/prisma";
import { TeamCommunity, CommunityStatus, Prisma } from "@prisma/client";

export class CommunityRepository {
  /**
   * 모든 커뮤니티를 조회합니다.
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns TeamCommunity 배열
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
    }

    const communities = await prisma.teamCommunity.findMany(findManyOptions);
    return communities;
  }

  /**
   * 새로운 커뮤니티를 생성합니다.
   * @param communityData - 생성할 커뮤니티 데이터 { postId, isbn13?, status, postTitle, postContent, postAuthor }
   * @returns 생성된 TeamCommunity 객체
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

  /**
   * 특정 커뮤니티의 상세 정보를 업데이트합니다.
   * @param teamId - 업데이트할 커뮤니티 ID
   * @param updateData - 업데이트할 데이터 (title, content, recruiting 등)
   * @returns 업데이트된 TeamCommunity 객체
   */
  public async updateDetails(
    teamId: number,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruiting?: boolean;
    }
  ): Promise<TeamCommunity> {
    const dataToUpdate: Prisma.TeamCommunityUpdateInput = {};

    if (updateData.title !== undefined) {
      dataToUpdate.postTitle = updateData.title;
    }
    if (updateData.content !== undefined) {
      dataToUpdate.postContent = updateData.content;
    }

    // recruiting 필드는 CommunityStatus로 변환하여 업데이트합니다.
    if (updateData.recruiting !== undefined) {
      // recruiting이 false일 때 CommunityStatus.ACTIVE로 변경
      dataToUpdate.status = updateData.recruiting
        ? CommunityStatus.RECRUITING
        : CommunityStatus.ACTIVE; // <-- 이 부분을 수정했습니다.
    }

    const updatedCommunity = await prisma.teamCommunity.update({
      where: { teamId: teamId },
      data: dataToUpdate,
    });
    return updatedCommunity;
  }

  /**
   * 특정 도서 ISBN13으로 커뮤니티 목록을 조회합니다.
   * @param bookIsbn13 - 도서 ISBN13
   * @param query - 조회 옵션 { size }
   * @returns TeamCommunity 배열
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
   * @returns TeamCommunity 객체 또는 null
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
}
