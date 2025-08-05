import { ApplicationStatus, TeamApplication, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";

export type ApplicationWithPostInfo = TeamApplication & {
  post: {
    postId: number;
    title: string;
    userId: number;
    maxMembers: number;
    team: {
      teamId: number;
      status: string;
      postTitle: string;
      postContent: string;
      postAuthor: string;
      currentMembers?: number;
      maxMembers?: number;
    } | null;
  } | null;
  user: { nickname: string } | null;
};

export class ApplicationRepository {
  public async deleteById(applicationId: number): Promise<void> {
    await prisma.teamApplication.delete({
      where: { applicationId: applicationId },
    });
  }

  public async findManyByUserId(
    userId: number
  ): Promise<ApplicationWithPostInfo[]> {
    const applications = await prisma.teamApplication.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: {
          select: {
            postId: true,
            title: true,
            userId: true, // Post 작성자 (호스트 ID) 포함
            maxMembers: true, // Post에서 maxMembers를 직접 선택
            team: {
              // Post와 TeamCommunity 간의 관계 이름이 'team'이라고 가정
              select: {
                teamId: true,
                status: true,
                postTitle: true,
                postContent: true,
                postAuthor: true,
              },
            },
          },
        },
        user: {
          // 신청한 사용자 정보 (닉네임만)
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return applications as ApplicationWithPostInfo[];
  }

  /**
   * 새로운 팀 지원서 생성
   * @param postId
   * @param applicationData
   * @returns
   * @remarks
   */
  public async create(
    postId: number,
    applicationData: { userId: number; applicationMessage: string }
  ): Promise<TeamApplication> {
    const newApplication = await prisma.teamApplication.create({
      data: {
        postId: postId,
        ...applicationData,
        status: ApplicationStatus.PENDING,
      },
    });
    return newApplication;
  }

  /**
   * 특정 모집글 ID에 해당하는 신청자 목록 조회
   * @param postId
   * @returns
   * @remarks
   */
  public async findManyByCommunityId(
    postId: number
  ): Promise<TeamApplication[]> {
    const applicants = await prisma.teamApplication.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: { appliedAt: "asc" },
    });
    return applicants;
  }

  /**
   * 특정 지원서 상태 업데이트(수락/거절)
   * @param postId
   * @param userId
   * @param status - ACCEPTED/REJECTED
   * @returns
   * @remarks
   */
  public async updateStatus(
    postId: number,
    userId: number,
    status: ApplicationStatus
  ): Promise<TeamApplication> {
    const updatedApplication = await prisma.teamApplication.update({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
      data: {
        status: status,
        processedAt: new Date(),
      },
    });
    return updatedApplication;
  }

  /**
   * 특정 모집글과 관련된 모든 지원서 삭제
   * @param postId
   * @returns
   */
  public async deleteRecruitment(postId: number): Promise<number> {
    const result = await prisma.teamApplication.deleteMany({
      where: {
        postId: postId,
      },
    });
    return result.count; // 삭제된 레코드 수 반환
  }

  /**
   * 특정 지원서 ID로 지원서 조회
   * @param applicationId
   * @returns
   */
  public async findById(
    applicationId: number
  ): Promise<TeamApplication | null> {
    const application = await prisma.teamApplication.findUnique({
      where: { applicationId: applicationId },
    });
    return application;
  }

  /**
   * 특정 사용자 ID와 모집글 ID로 지원서 조회
   * @param userId
   * @param postId
   * @returns
   *
   */
  public async findByUserIdAndPostId(
    userId: number,
    postId: number
  ): Promise<TeamApplication | null> {
    const application = await prisma.teamApplication.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });
    return application;
  }

  public async countApplicationsByPostId(postId: number): Promise<number> {
    const count = await prisma.teamApplication.count({
      where: { postId: postId },
    });
    return count;
  }
}
