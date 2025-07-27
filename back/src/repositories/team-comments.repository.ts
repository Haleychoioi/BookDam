// src/repositories/team-comments.repository.ts

import prisma from "../utils/prisma";
import { TeamComment, Prisma } from "@prisma/client";

export class TeamCommentRepository {
  /**
   * 특정 팀 게시물 ID에 해당하는 댓글 목록을 조회합니다.
   * 서비스 계층의 findCommentsByTeamPostId에 맞춰 findByTeamPostId로 변경하고 query 파라미터 제거
   * @param teamPostId - 팀 게시물 ID
   * @returns TeamComment 배열 (최상위 댓글 및 1단계 대댓글 포함)
   */
  public async findByTeamPostId(
    // 메서드 이름 변경: findManyByTeamPostId -> findByTeamPostId
    teamPostId: number
    // query 파라미터 제거 (서비스 계층에서 전달하지 않음)
  ): Promise<TeamComment[]> {
    const findManyOptions: Prisma.TeamCommentFindManyArgs = {
      where: {
        teamPostId: teamPostId,
        parentId: null, // 최상위 댓글만 가져오고, 대댓글은 include로 가져옵니다.
      },
      include: {
        user: {
          select: { nickname: true }, // 댓글 작성자 닉네임 포함
        },
        replies: {
          // 대댓글 포함 (1단계만)
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" }, // 최상위 댓글 정렬 (기본값)
    };

    // 서비스 계층에서 정렬 옵션을 전달하지 않으므로, 여기서는 기본 정렬 유지
    // if (sort === "latest") {
    //   findManyOptions.orderBy = { createdAt: "desc" };
    // } else if (sort === "oldest") {
    //   findManyOptions.orderBy = { createdAt: "asc" };
    // }

    const teamComments = await prisma.teamComment.findMany(findManyOptions);
    return teamComments;
  }

  /**
   * 새로운 팀 댓글을 생성합니다.
   * 서비스 계층의 createComment에 맞춰 단일 commentData 객체를 받도록 변경
   * @param commentData - 생성할 댓글 데이터 { teamPostId, userId, content, parentId? }
   * @returns 생성된 TeamComment 객체
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
   * 서비스 계층의 updateComment에 맞춰 content만 받도록 변경
   * @param teamCommentId - 업데이트할 팀 댓글 ID
   * @param content - 업데이트할 내용
   * @returns 업데이트된 TeamComment 객체
   */
  public async update(
    teamCommentId: number,
    content: string // Partial<TeamComment> 대신 content만 받음
  ): Promise<TeamComment> {
    const updatedTeamComment = await prisma.teamComment.update({
      where: { teamCommentId: teamCommentId },
      data: { content: content, updatedAt: new Date() }, // updatedAt 자동 업데이트
    });
    return updatedTeamComment;
  }

  /**
   * 특정 팀 댓글을 삭제합니다.
   * @param teamCommentId - 삭제할 팀 댓글 ID
   */
  public async delete(teamCommentId: number): Promise<void> {
    await prisma.teamComment.delete({
      where: { teamCommentId: teamCommentId },
    });
  }

  /**
   * 특정 팀 댓글 ID로 댓글을 조회합니다.
   * @param teamCommentId - 조회할 팀 댓글 ID
   * @returns TeamComment 객체 또는 null
   */
  public async findById(teamCommentId: number): Promise<TeamComment | null> {
    const teamComment = await prisma.teamComment.findUnique({
      where: { teamCommentId: teamCommentId },
      include: { user: { select: { nickname: true } } },
    });
    return teamComment;
  }
}
