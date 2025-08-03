// src/repositories/team-comments.repository.ts

import prisma from "../utils/prisma";
import { TeamComment, Prisma } from "@prisma/client";

// Prisma의 findUnique/findMany 타입
// TeamComment 모델에 user (nickname만 포함), replies (TeamComment와 user 포함) 관계가 포함된 형태
type TeamCommentWithRelations = TeamComment & {
  user: { nickname: string } | null;
  replies: (TeamComment & { user: { nickname: string } | null })[];
};

export class TeamCommentRepository {
  public async findByUserId(userId: number): Promise<TeamComment[]> {
    return prisma.teamComment.findMany({
      where: { userId: userId },
      include: {
        teamPost: {
          select: {
            teamPostId: true,
            title: true,
          },
        },
        user: {
          // ✨ 이 부분에 user include 추가 ✨
          select: { nickname: true, profileImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 특정 팀 게시물 ID에 해당하는 댓글 목록 조회
   * @param teamPostId
   * @returns
   * @remarks
   */
  public async findByTeamPostId(
    teamPostId: number
  ): Promise<TeamCommentWithRelations[]> {
    const findManyOptions: Prisma.TeamCommentFindManyArgs = {
      where: {
        teamPostId: teamPostId,
        parentId: null, // 최상위 댓글만
      },
      include: {
        user: {
          select: { nickname: true, profileImage: true }, // profileImage 추가됨
        },
        replies: {
          // 대댓글 포함 (1단계만)
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true, profileImage: true } }, // 대댓글에도 profileImage 추가됨
          },
        },
      },
      orderBy: { createdAt: "asc" },
    };

    const teamComments = await prisma.teamComment.findMany(findManyOptions);

    return teamComments as TeamCommentWithRelations[];
  }

  /**
   * 새로운 팀 댓글 생성
   * @param commentData
   * @returns
   * @remarks
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
        // parentId가 제공되면 부모 댓글과 연결
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
   * 특정 팀 댓글 업데이트
   * @param teamCommentId
   * @param content
   * @returns
   * @remarks
   */
  public async update(
    teamCommentId: number,
    content: string
  ): Promise<TeamComment> {
    const updatedTeamComment = await prisma.teamComment.update({
      where: { teamCommentId: teamCommentId },
      data: { content: content, updatedAt: new Date() },
    });
    return updatedTeamComment;
  }

  /**
   * 특정 팀 댓글 ID로 댓글 조회
   * @param teamCommentId
   * @returns
   */
  public async findById(
    teamCommentId: number
  ): Promise<
    | (TeamComment & {
        user: { nickname: string; profileImage: string | null };
      })
    | null
  > {
    const teamComment = await prisma.teamComment.findUnique({
      where: { teamCommentId: teamCommentId },
      include: { user: { select: { nickname: true, profileImage: true } } }, // profileImage 추가됨
    });
    return teamComment;
  }

  /**
   * 특정 팀 댓글 삭제
   * @param teamCommentId
   * @returns
   * @remarks
   */
  public async delete(teamCommentId: number): Promise<number> {
    const result = await prisma.teamComment.deleteMany({
      where: { teamCommentId: teamCommentId },
    });
    return result.count;
  }

  /**
   * 특정 팀 게시물에 연결된 모든 댓글 삭제(게시물 삭제 시 사용)
   * @param teamPostId
   * @returns
   * @remarks
   */
  public async deleteManyByTeamPostId(teamPostId: number): Promise<number> {
    const result = await prisma.teamComment.deleteMany({
      where: { teamPostId: teamPostId },
    });
    return result.count;
  }
}
