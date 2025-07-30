// src/repositories/team-members.repository.ts

import prisma from "../utils/prisma"; // 단일 PrismaClient 인스턴스를 import합니다.
import { TeamMember, TeamRole } from "@prisma/client"; // Prisma Client에서 필요한 타입 import

export class TeamMemberRepository {
  /**
   * 새로운 팀 멤버를 생성합니다.
   * @param data - 생성할 팀 멤버 데이터 { userId, teamId, role }
   * @returns 생성된 TeamMember 객체
   * @remarks Prisma의 `create`는 연결된 `userId`나 `teamId`가 존재하지 않거나
   * `userId_teamId` 복합 Unique 키 제약 조건 위반 시 에러를 던질 수 있습니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * 특정 사용자 ID와 팀 ID로 팀 멤버를 조회합니다.
   * @param userId - 사용자 ID
   * @param teamId - 팀 ID
   * @returns TeamMember 객체 또는 null (찾을 수 없는 경우)
   */
  public async findByUserIdAndTeamId(
    userId: number,
    teamId: number
  ): Promise<TeamMember | null> {
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          // 복합 Unique 키 사용
          userId: userId,
          teamId: teamId,
        },
      },
    });
    return teamMember;
  }

  /**
   * 특정 팀의 멤버 수를 조회합니다.
   * @param teamId - 팀 ID
   * @returns 팀 멤버 수
   */
  public async countMembersByTeamId(teamId: number): Promise<number> {
    const count = await prisma.teamMember.count({
      where: { teamId: teamId },
    });
    return count;
  }

  /**
   * 특정 팀 멤버를 삭제합니다.
   * @param userId - 삭제할 사용자 ID
   * @param teamId - 삭제할 팀 ID
   * @returns void
   * @remarks Prisma의 `delete`는 `userId_teamId` 복합 Unique 키에 해당하는 레코드가 없으면
   * `RecordNotFound` 에러를 던집니다. 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async delete(userId: number, teamId: number): Promise<void> {
    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          // 복합 Unique 키 사용
          userId: userId,
          teamId: teamId,
        },
      },
    });
  }

  /**
   * 특정 팀의 모든 멤버를 조회합니다.
   * @param teamId - 팀 ID
   * @returns TeamMember 배열
   * @remarks 해당 `teamId`에 대한 멤버가 없으면 빈 배열을 반환합니다.
   */
  public async findManyByTeamId(teamId: number): Promise<TeamMember[]> {
    const members = await prisma.teamMember.findMany({
      where: { teamId: teamId },
      include: {
        user: {
          select: { nickname: true }, // 멤버의 닉네임 포함
        },
      },
    });
    return members;
  }

  /**
   * 특정 팀 멤버의 역할을 업데이트합니다.
   * @param userId - 업데이트할 사용자 ID
   * @param teamId - 업데이트할 팀 ID
   * @param newRole - 새로운 역할 (예: MEMBER, LEADER)
   * @returns 업데이트된 TeamMember 객체
   * @remarks Prisma의 `update`는 `userId_teamId` 복합 Unique 키에 해당하는 레코드가 없으면
   * `RecordNotFound` 에러를 던집니다. 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
