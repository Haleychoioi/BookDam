// src/repositories/applications.repository.ts

import prisma from "../utils/prisma";
import { ApplicationStatus, TeamApplication, Prisma } from "@prisma/client";

export class ApplicationRepository {
  /**
   * 새로운 팀 지원서를 생성합니다.
   * @param postId - 지원할 모집글 ID (스키마상 postId)
   * @param applicationData - 지원서 데이터 { userId, applicationMessage }
   * @returns 생성된 TeamApplication 객체
   * @remarks Prisma의 `create`는 연결된 `postId`나 `userId`가 존재하지 않을 경우 에러를 던질 수 있습니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async create(
    postId: number,
    applicationData: { userId: number; applicationMessage: string }
  ): Promise<TeamApplication> {
    const newApplication = await prisma.teamApplication.create({
      data: {
        postId: postId,
        ...applicationData,
        status: ApplicationStatus.PENDING, // 기본 상태는 PENDING으로 설정
      },
    });
    return newApplication;
  }

  /**
   * 특정 모집글 ID에 해당하는 신청자 목록을 조회합니다.
   * 이 메서드는 지원자의 닉네임을 포함하여 반환합니다.
   * @param postId - 모집글 ID (커뮤니티의 모집글과 연결됨)
   * @returns TeamApplication 배열 (지원자 닉네임 포함)
   * @remarks 해당 `postId`에 대한 신청자가 없으면 빈 배열을 반환합니다.
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
   * @param postId - 모집글 ID (지원서가 속한 모집글)
   * @param userId - 지원자 ID
   * @param status - 변경할 상태 (ACCEPTED 또는 REJECTED)
   * @returns 업데이트된 TeamApplication 객체
   * @remarks `userId_postId` 복합 Unique 키에 해당하는 레코드가 없으면 `RecordNotFound` 에러를 던집니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async updateStatus(
    postId: number,
    userId: number,
    status: ApplicationStatus
  ): Promise<TeamApplication> {
    const updatedApplication = await prisma.teamApplication.update({
      where: {
        userId_postId: {
          // 복합 Unique 키 (userId와 postId 조합) 사용
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
   * 이 메서드는 삭제된 레코드의 수를 반환하며, 해당 `postId`에 대한 지원서가 없어도 에러를 던지지 않고 0을 반환합니다.
   * @param postId - 모집글 ID
   * @returns 삭제된 레코드 수
   */
  public async deleteRecruitment(postId: number): Promise<number> {
    // 반환 타입을 number로 변경
    const result = await prisma.teamApplication.deleteMany({
      where: {
        postId: postId,
      },
    });
    return result.count; // 삭제된 레코드 수 반환
  }

  /**
   * 특정 지원서 ID로 지원서를 조회합니다.
   * @param applicationId - 조회할 지원서의 고유 ID
   * @returns TeamApplication 객체 또는 null (지원서를 찾을 수 없는 경우)
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
   * 특정 사용자 ID와 모집글 ID로 지원서를 조회합니다. (예: 중복 지원 방지)
   * @param userId - 조회할 사용자의 ID
   * @param postId - 조회할 모집글의 ID
   * @returns TeamApplication 객체 또는 null (지원서를 찾을 수 없는 경우)
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
