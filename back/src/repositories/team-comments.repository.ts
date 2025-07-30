// src/repositories/team-comments.repository.ts

import prisma from "../utils/prisma";
import { TeamComment, Prisma } from "@prisma/client";

// Prisma의 findUnique/findMany 결과에 대한 타입을 명확히 정의합니다.
// TeamComment 모델에 user (nickname만 포함) 및 replies (TeamComment와 user 포함) 관계가 포함된 형태입니다.
type TeamCommentWithRelations = TeamComment & {
  user: { nickname: string } | null;
  replies: (TeamComment & { user: { nickname: string } | null })[];
};

export class TeamCommentRepository {
  /**
   * 특정 팀 게시물 ID에 해당하는 댓글 목록을 조회합니다.
   * 최상위 댓글과 그에 대한 1단계 대댓글을 포함합니다.
   * @param teamPostId - 팀 게시물 ID
   * @returns TeamComment 배열 (최상위 댓글 및 1단계 대댓글 포함, 작성자 닉네임 포함)
   * @remarks 해당 `teamPostId`에 대한 댓글이 없으면 빈 배열을 반환합니다.
   */
  public async findByTeamPostId(
    teamPostId: number
  ): Promise<TeamCommentWithRelations[]> {
    // 명확한 타입 사용
    const findManyOptions: Prisma.TeamCommentFindManyArgs = {
      where: {
        teamPostId: teamPostId,
        parentId: null, // 최상위 댓글만 가져옵니다.
      },
      include: {
        user: {
          select: { nickname: true }, // 댓글 작성자 닉네임 포함
        },
        replies: {
          // 대댓글 포함 (1단계만)
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true } }, // 대댓글 작성자 닉네임 포함
          },
        },
      },
      orderBy: { createdAt: "asc" }, // 최상위 댓글 정렬 (생성일시 오름차순)
    };

    const teamComments = await prisma.teamComment.findMany(findManyOptions);
    // Prisma의 findMany 결과는 include 옵션에 따라 자동으로 타입이 추론됩니다.
    // 명시적 캐스팅을 통해 TypeScript에게 이 반환값이 정의된 타입과 일치함을 알려줍니다.
    return teamComments as TeamCommentWithRelations[];
  }

  /**
   * 새로운 팀 댓글을 생성합니다.
   * @param commentData - 생성할 댓글 데이터 { teamPostId, userId, content, parentId? }
   * @returns 생성된 TeamComment 객체
   * @remarks Prisma의 `create`는 연결된 `teamPostId`, `userId`, `parentId`에 해당하는 레코드가 없으면 에러를 던질 수 있습니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async create(commentData: {
    teamPostId: number;
    userId: number;
    content: string;
    parentId?: number;
  }): Promise<TeamComment> {
    const newTeamComment = await prisma.teamComment.create({
      data: {
        teamPost: {
          connect: { teamPostId: commentData.teamPostId },
        },
        user: {
          connect: { userId: commentData.userId },
        },
        content: commentData.content,
        // parentId가 제공되면 부모 댓글과 연결합니다.
        ...(commentData.parentId && {
          parent: {
            connect: { teamCommentId: commentData.parentId },
          },
        }),
      },
    });
    return newTeamComment;
  }

  /**
   * 특정 팀 댓글을 업데이트합니다.
   * @param teamCommentId - 업데이트할 팀 댓글 ID
   * @param content - 업데이트할 내용
   * @returns 업데이트된 TeamComment 객체
   * @remarks Prisma의 `update`는 `teamCommentId`에 해당하는 레코드가 없으면 `RecordNotFound` 에러를 던집니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async update(
    teamCommentId: number,
    content: string
  ): Promise<TeamComment> {
    const updatedTeamComment = await prisma.teamComment.update({
      where: { teamCommentId: teamCommentId },
      data: { content: content, updatedAt: new Date() }, // updatedAt 자동 업데이트
    });
    return updatedTeamComment;
  }

  /**
   * 특정 팀 댓글 ID로 댓글을 조회합니다.
   * @param teamCommentId - 조회할 팀 댓글 ID
   * @returns TeamComment 객체 또는 null (작성자 닉네임 포함)
   */
  public async findById(
    teamCommentId: number
  ): Promise<(TeamComment & { user: { nickname: string } | null }) | null> {
    const teamComment = await prisma.teamComment.findUnique({
      where: { teamCommentId: teamCommentId },
      include: { user: { select: { nickname: true } } }, // 작성자 닉네임 포함
    });
    return teamComment;
  }

  /**
   * 특정 팀 댓글을 삭제합니다.
   * (schema.prisma의 onDelete: SetNull 설정으로 대댓글의 parentId는 자동으로 null이 됩니다.)
   * @param teamCommentId - 삭제할 팀 댓글 ID
   * @returns 삭제된 레코드 수 (0 또는 1)
   * @remarks `deleteMany`는 삭제된 레코드 수를 반환하며, 해당 ID의 레코드가 없어도 에러를 던지지 않고 0을 반환합니다.
   * 이 반환 값은 서비스 계층에서 확인하여 CustomError로 처리됩니다.
   */
  public async delete(teamCommentId: number): Promise<number> {
    const result = await prisma.teamComment.deleteMany({
      where: { teamCommentId: teamCommentId },
    });
    return result.count;
  }

  /**
   * 특정 팀 게시물에 연결된 모든 댓글을 삭제합니다. (게시물 삭제 시 사용)
   * @param teamPostId - 팀 게시물 ID
   * @returns 삭제된 레코드 수
   * @remarks 이 메서드는 팀 게시물 삭제 시 관련된 모든 댓글을 정리하는 데 사용됩니다.
   * 삭제된 레코드 수를 반환하며, 해당 `teamPostId`의 댓글이 없어도 에러를 던지지 않고 0을 반환합니다.
   */
  public async deleteManyByTeamPostId(teamPostId: number): Promise<number> {
    const result = await prisma.teamComment.deleteMany({
      where: { teamPostId: teamPostId },
    });
    return result.count;
  }
}
