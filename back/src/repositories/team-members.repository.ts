// src/repositories/team-members.repository.ts

import prisma from "../utils/prisma";
import { TeamMember, TeamRole } from "@prisma/client";

export class TeamMemberRepository {
  /**
   * 새로운 팀 멤버 생성
   * @param data
   * @returns
   * @remarks
   */
  public async create(data: {
    userId: number;
    teamId: number;
    role: TeamRole;
  }): Promise<TeamMember> {
    const newTeamMember = await prisma.teamMember.create({
      data,
    });
    return newTeamMember;
  }

  /**
   * 특정 사용자 ID와 팀 ID로 팀 멤버 조회
   * @param userId
   * @param teamId
   * @returns
   */
  public async findByUserIdAndTeamId(
    userId: number,
    teamId: number
  ): Promise<TeamMember | null> {
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: teamId,
        },
      },
    });
    return teamMember;
  }

  /**
   * 특정 팀의 멤버 수 조회
   * @param teamId
   * @returns
   */
  public async countMembersByTeamId(teamId: number): Promise<number> {
    const count = await prisma.teamMember.count({
      where: { teamId: teamId },
    });
    return count;
  }

  /**
   * 특정 팀 멤버 삭제
   * @param userId
   * @param teamId
   * @returns
   * @remarks
   */
  public async delete(userId: number, teamId: number): Promise<void> {
    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: teamId,
        },
      },
    });
  }

  /**
   * 특정 팀의 모든 멤버 조회
   * @param teamId
   * @returns
   * @remarks
   */
  public async findManyByTeamId(teamId: number): Promise<TeamMember[]> {
    const members = await prisma.teamMember.findMany({
      where: { teamId: teamId },
      include: {
        user: {
          select: { nickname: true },
        },
      },
    });
    return members;
  }

  /**
   * 특정 팀 멤버 역할 업데이트
   * @param userId
   * @param teamId
   * @param newRole
   * @returns
   * @remarks
   */
  public async updateRole(
    userId: number,
    teamId: number,
    newRole: TeamRole
  ): Promise<TeamMember> {
    const updatedMember = await prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: teamId,
        },
      },
      data: {
        role: newRole,
      },
    });
    return updatedMember;
  }
}
