// src/repositories/applications.repository.ts

import prisma from "../utils/prisma";
import { ApplicationStatus, TeamApplication, Prisma } from "@prisma/client";

export class ApplicationRepository {
  /**
   * 새로운 팀 지원서를 생성합니다.
   * @param postId - 지원할 모집글 ID (스키마상 postId)
   * @param applicationData - 지원서 데이터 { userId, applicationMessage }
   * @returns 생성된 TeamApplication 객체
   */
  public async create(
    postId: number,
    applicationData: { userId: number; applicationMessage: string }
  ): Promise<TeamApplication> {
    const newApplication = await prisma.teamApplication.create({
      data: {
        postId: postId,
        ...applicationData,
        status: ApplicationStatus.PENDING, // 기본 상태는 PENDING
      },
    });
    return newApplication;
  }

  /**
   * 특정 모집글 ID에 해당하는 신청자 목록을 조회합니다.
   * @param postId - 모집글 ID
   * @returns TeamApplication 배열
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
            nickname: true, // 지원자 닉네임 포함
          },
        },
      },
      orderBy: { appliedAt: "asc" }, // 신청일시 기준 오름차순 정렬
    });
    return applicants;
  }

  /**
   * 특정 지원서의 상태를 업데이트합니다 (수락/거절).
   * @param postId - 모집글 ID
   * @param userId - 지원자 ID
   * @param status - 변경할 상태 (ACCEPTED 또는 REJECTED)
   * @returns 업데이트된 TeamApplication 객체
   */
  public async updateStatus(
    postId: number,
    userId: number,
    status: ApplicationStatus
  ): Promise<TeamApplication> {
    const updatedApplication = await prisma.teamApplication.update({
      where: {
        userId_postId: {
          // 복합 Unique 키 사용
          userId: userId,
          postId: postId,
        },
      },
      data: {
        status: status,
        processedAt: new Date(), // 처리일시 업데이트
      },
    });
    return updatedApplication;
  }

  /**
   * 특정 모집글과 관련된 모든 지원서를 삭제합니다.
   * @param postId - 모집글 ID
   */
  public async deleteRecruitment(postId: number): Promise<void> {
    await prisma.teamApplication.deleteMany({
      where: {
        postId: postId,
      },
    });
  }

  /**
   * 특정 지원서 ID로 지원서를 조회합니다.
   * @param applicationId - 지원서 ID
   * @returns TeamApplication 객체 또는 null
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
   * 특정 사용자 ID와 모집글 ID로 지원서를 조회합니다. (중복 지원 방지 등)
   * @param userId - 사용자 ID
   * @param postId - 모집글 ID
   * @returns TeamApplication 객체 또는 null
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
}
