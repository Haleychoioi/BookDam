import prisma from "../utils/prisma";
import { TeamMember, TeamRole } from "@prisma/client";

export class TeamMemberRepository {
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

  public async countMembersByTeamId(teamId: number): Promise<number> {
    const count = await prisma.teamMember.count({
      where: { teamId: teamId },
    });
    return count;
  }

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

  public async findLeaderMembershipByUserId(
    userId: number
  ): Promise<TeamMember | null> {
    const leaderMembership = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        role: "LEADER",
      },
    });
    return leaderMembership;
  }

  public async findManyMembershipsByUserId(userId: number): Promise<
    (TeamMember & {
      team: {
        teamId: number;
        postTitle: string;
        createdAt: Date;
        status: string;
        postId: number;
      };
    })[]
  > {
    const memberships = await prisma.teamMember.findMany({
      where: { userId: userId },
      include: {
        team: {
          select: {
            teamId: true,
            postTitle: true,
            createdAt: true,
            status: true,
            postId: true,
          },
        },
      },
      orderBy: { teamId: "desc" },
    });
    return memberships as any;
  }

  public async deleteManyByTeamId(teamId: number): Promise<number> {
    const result = await prisma.teamMember.deleteMany({
      where: { teamId: teamId },
    });
    return result.count;
  }
}
