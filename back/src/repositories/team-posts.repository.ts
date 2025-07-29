// src/repositories/team-posts.repository.ts

import prisma from "../utils/prisma";
import { TeamPost, TeamPostType, Prisma } from "@prisma/client";

export class TeamPostRepository {
  /**
   * 특정 커뮤니티 ID에 해당하는 팀 게시물 목록을 조회합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns TeamPost 배열
   * @remarks 해당 조건에 맞는 게시물이 없으면 빈 배열을 반환합니다.
   */
  public async findManyByCommunityId(
    communityId: number,
    query: { page?: number; pageSize?: number; sort?: string }
  ): Promise<TeamPost[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.TeamPostFindManyArgs = {
      where: {
        teamId: communityId, // 특정 팀(커뮤니티)의 게시물만 필터링
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
    } else {
      findManyOptions.orderBy = { createdAt: "desc" }; // 기본 정렬 (최신순)
    }

    const teamPosts = await prisma.teamPost.findMany(findManyOptions);
    return teamPosts;
  }

  /**
   * 새로운 팀 게시물을 생성합니다.
   * @param communityId - 팀 커뮤니티 ID (게시물이 속할 팀의 ID)
   * @param postData - 생성할 게시물 데이터 { userId, title, content, type? }
   * @returns 생성된 TeamPost 객체
   * @remarks Prisma의 `create`는 연결된 `teamId`나 `userId`가 존재하지 않거나
   * 다른 제약 조건 위반 시 에러를 던질 수 있습니다. 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
        teamId: communityId, // 게시물이 속할 팀 ID 설정
        ...postData,
      },
    });
    return newTeamPost;
  }

  /**
   * 특정 팀 게시물을 업데이트합니다.
   * @param communityId - 팀 커뮤니티 ID (게시물이 해당 커뮤니티에 속하는지 확인용)
   * @param teamPostId - 업데이트할 팀 게시물 ID
   * @param updateData - 업데이트할 데이터 (Partial<TeamPost> 타입)
   * @returns 업데이트된 TeamPost 객체
   * @remarks Prisma의 `update`는 `teamPostId`와 `teamId` 복합 조건에 해당하는 레코드가 없으면
   * `RecordNotFound` 에러를 던집니다. 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * @param communityId - 팀 커뮤니티 ID (게시물이 해당 커뮤니티에 속하는지 확인용)
   * @param teamPostId - 삭제할 팀 게시물 ID
   * @returns void
   * @remarks Prisma의 `delete`는 `teamPostId`와 `teamId` 복합 조건에 해당하는 레코드가 없으면
   * `RecordNotFound` 에러를 던집니다. 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * @returns TeamPost 객체 또는 null (게시물을 찾을 수 없는 경우)
   * @remarks 이 메서드는 `teamPostId`만으로 게시물을 조회하며, `communityId`는 서비스 계층에서 추가로 검증합니다.
   */
  public async findById(teamPostId: number): Promise<TeamPost | null> {
    const teamPost = await prisma.teamPost.findUnique({
      where: { teamPostId: teamPostId },
      include: {
        user: {
          select: { nickname: true }, // 작성자 닉네임 포함
        },
        comments: {
          orderBy: { createdAt: "asc" }, // 댓글은 오래된 순으로 정렬
          include: {
            user: { select: { nickname: true } }, // 댓글 작성자 닉네임 포함
            replies: {
              // 대댓글 포함 (1단계만)
              include: { user: { select: { nickname: true } } }, // 대댓글 작성자 닉네임 포함
            },
          },
        },
      },
    });
    return teamPost;
  }
}
