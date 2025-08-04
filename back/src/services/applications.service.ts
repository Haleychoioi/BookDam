// src/services/applications.service.ts

import { ApplicationRepository } from "../repositories/applications.repository";
import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import {
  ApplicationStatus,
  CommunityStatus,
  PostType,
  TeamApplication,
  TeamRole,
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

// ApplicationService의 CustomError 문제를 임시로 해결하기 위한 타입 단언 (최후의 수단)
// import * as ErrorMiddleware from "../middleware/error-handing-middleware";
// const CustomError = ErrorMiddleware.CustomError;

type ApplicationWithPostInfo = TeamApplication & {
  post: {
    postId: number;
    title: string;
  };
};

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
  }

  public async getMyApplications(
    userId: number
  ): Promise<ApplicationWithPostInfo[]> {
    const applications = await this.applicationRepository.findManyByUserId(
      userId
    );
    return applications;
  }

  public async cancelApplication(applicationId: number, userId: number) {
    const application = await this.applicationRepository.findById(
      applicationId
    );

    if (!application) {
      throw new CustomError(404, "지원 내역을 찾을 수 없습니다.");
    }
    if (application.userId !== userId) {
      throw new CustomError(403, "자신의 지원만 취소할 수 있습니다.");
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new CustomError(400, "대기 중인 지원서만 취소할 수 있습니다.");
    }

    await this.applicationRepository.deleteById(applicationId);
  }

  /**
   * 커뮤니티 가입 신청
   * @param communityId
   * @param applicationData
   * @returns
   * @throws CustomError 커뮤니티를 찾을 수 없을 때, 모집 중이 아닐 때, 중복 신청일 때, 모집 인원 초과일 때
   */
  public async createApplication(
    communityId: number,
    applicationData: { userId: number; applicationMessage: string }
  ): Promise<boolean> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }
    // ✨ 커뮤니티 상태 로그 추가 ✨
    console.log(
      `ApplicationService: Community ID ${communityId} status is ${community.status}`
    );

    if (community.status !== CommunityStatus.RECRUITING) {
      throw new CustomError(400, "This community is not currently recruiting.");
    }

    // 중복 신청 방지
    const existingApplication =
      await this.applicationRepository.findByUserIdAndPostId(
        applicationData.userId,
        community.postId
      );
    if (existingApplication) {
      throw new CustomError(409, "You have already applied to this community.");
    }

    // 모집 인원 초과 여부 확인
    const recruitmentPost = await this.postRepository.findById(
      community.postId
    );
    if (!recruitmentPost || recruitmentPost.type !== PostType.RECRUITMENT) {
      throw new CustomError(
        404,
        "Associated recruitment post not found or invalid."
      );
    }
    const currentMembersCount =
      await this.teamMemberRepository.countMembersByTeamId(communityId); // 현재 멤버 수
    if (
      recruitmentPost.maxMembers &&
      currentMembersCount >= recruitmentPost.maxMembers
    ) {
      throw new CustomError(
        409,
        "The community has reached its maximum number of members."
      );
    }

    await this.applicationRepository.create(community.postId, applicationData);
    return true;
  }

  /**
   * 특정 모집 커뮤니티의 신청자 목록 상세 조회
   * @param communityId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async findApplicantsByCommunity(
    communityId: number,
    requestingUserId: number
  ): Promise<any[]> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    // 요청 userId가 해당 커뮤니티의 팀장인지 확인 (권한 검증)
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember || teamMember.role !== TeamRole.LEADER) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can view applicants."
      );
    }

    const applicants = await this.applicationRepository.findManyByCommunityId(
      community.postId
    );
    // 신청자가 없는 경우 빈 배열 반환 (에러 아님)
    if (!applicants || applicants.length === 0) {
      return [];
    }
    return applicants;
  }

  /**
   * 신청 수락/거절
   * @param communityId
   * @param applicantUserId
   * @param newStatus - ACCEPTED/REJECTED
   * @param requestingUserId
   * @returns
   * @throws CustomError 커뮤니티를 찾을 수 없을 때, 권한이 없을 때, 지원서를 찾을 수 없을 때, 상태 변경이 유효하지 않을 때
   */
  public async updateApplicationStatus(
    communityId: number,
    applicantUserId: number,
    newStatus: ApplicationStatus,
    requestingUserId: number
  ): Promise<boolean> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    // 요청 userId가 해당 커뮤니티의 팀장인지 확인 (권한 검증)
    const teamLeader = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamLeader || teamLeader.role !== TeamRole.LEADER) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can process applications."
      );
    }

    const application = await this.applicationRepository.findByUserIdAndPostId(
      applicantUserId,
      community.postId
    );
    if (!application) {
      throw new CustomError(404, "Application not found.");
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new CustomError(
        400,
        "Application is not in PENDING status and cannot be processed."
      );
    }

    await this.applicationRepository.updateStatus(
      community.postId,
      applicantUserId,
      newStatus
    );

    // 지원이 수락된 경우, TeamMember 테이블에 추가
    if (newStatus === ApplicationStatus.ACCEPTED) {
      const existingTeamMember =
        await this.teamMemberRepository.findByUserIdAndTeamId(
          applicantUserId,
          communityId
        );
      if (existingTeamMember) {
        throw new CustomError(409, "Applicant is already a team member.");
      }
      await this.teamMemberRepository.create({
        userId: applicantUserId,
        teamId: communityId,
        role: TeamRole.MEMBER,
      });

      // 모집 인원이 꽉 찼다면 커뮤니티 상태를 ACTIVE로 변경
      const recruitmentPost = await this.postRepository.findById(
        community.postId
      );
      if (recruitmentPost && recruitmentPost.maxMembers) {
        const currentMembersCount =
          await this.teamMemberRepository.countMembersByTeamId(communityId);
        if (currentMembersCount >= recruitmentPost.maxMembers) {
          await this.communityRepository.update(communityId, {
            status: CommunityStatus.ACTIVE,
          });
        }
      }
    }
    return true;
  }

  /**
   * 모집 취소 (팀장이 모집글 및 관련 커뮤니티/지원서 삭제)
   * @param communityId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async cancelRecruitment(
    communityId: number,
    requestingUserId: number
  ): Promise<boolean> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    // 요청 userId가 해당 커뮤니티의 팀장인지 확인 (권한 검증)
    const teamLeader = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamLeader || teamLeader.role !== TeamRole.LEADER) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can cancel recruitment."
      );
    }

    // 해당 모집글과 관련된 모든 지원서 삭제
    await this.applicationRepository.deleteRecruitment(community.postId);
    await this.postRepository.delete(community.postId);
    await this.communityRepository.delete(communityId);

    return true;
  }
}
