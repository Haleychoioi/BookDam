import { PrismaClient, ApplicationStatus } from '@prisma/client';
import type {
  GeneralPostData,
  RecruitmentPostData,
  ApplicationData,
  TeamCreationData,
} from './post2.types';

const prisma = new PrismaClient();

export class PostRepository {
  
  public createPost = async (postData: GeneralPostData | RecruitmentPostData) => {
    return prisma.post.create({
      data: {
        ...postData,
        recruitmentStatus: 'maxMembers' in postData ? 'RECRUITING' : null,
      },
    });
  };


  public findPostById = async (postId: number) => {
    return prisma.post.findUnique({
      where: { postId },
      include: {
        user: { select: { userId: true, nickname: true } },
        book: { select: { title: true, author: true, cover: true } },
        team: true,
      },
    });
  };


  public createApplication = async (applicationData: ApplicationData) => {
    return prisma.teamApplication.create({
      data: applicationData,
    });
  };

  public findApplicationByUser = async (userId: number, postId: number) => {
    return prisma.teamApplication.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  };


  public findApplicationWithPostAuthor = async (applicationId: number) => {
    return prisma.teamApplication.findUnique({
      where: { applicationId },
      include: {
        post: {
          select: {
            userId: true, // 게시글 작성자 ID
          },
        },
      },
    });
  };


  public updateApplicationStatus = async (
    applicationId: number,
    status: Extract<ApplicationStatus, 'ACCEPTED' | 'REJECTED'>,
  ) => {
    return prisma.teamApplication.update({
      where: { applicationId },
      data: {
        status,
        processedAt: new Date(),
      },
    });
  };


  public findAcceptedApplicants = (postId: number) => {
    return prisma.teamApplication.findMany({
      where: {
        postId: postId,
        status: 'ACCEPTED',
      },
      select: { userId: true },
    });
  };


  public createTeamWithMembers = async (data: TeamCreationData) => {
    const { postId, leaderUserId, memberUserIds, ...teamData } = data;

    return prisma.$transaction(async (tx) => {
      const newTeam = await tx.teamCommunity.create({
        data: {
          ...teamData,
          postId: postId,
        },
      });

      await tx.post.update({
        where: { postId },
        data: { recruitmentStatus: 'CLOSED' },
      });

      const members = [
        { userId: leaderUserId, teamId: newTeam.teamId, role: 'LEADER' as const },
        ...memberUserIds.map((id) => ({
          userId: id,
          teamId: newTeam.teamId,
          role: 'MEMBER' as const,
        })),
      ];
      await tx.teamMember.createMany({ data: members });

      await tx.teamApplication.updateMany({
        where: {
          postId: postId,
          userId: { in: [leaderUserId, ...memberUserIds] },
        },
        data: { status: 'ACCEPTED', processedAt: new Date() },
      });

      return { ...newTeam, memberCount: members.length };
    });
  };
}