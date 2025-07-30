// src/services/applications.service.ts

import { ApplicationRepository } from "../repositories/applications.repository";
import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import {
  ApplicationStatus,
  CommunityStatus,
  PostType,
  TeamRole,
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

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

  /**
   * 커뮤니티 가입 신청
   * @param communityId - 지원할 커뮤니티 ID (모집글 ID와 연결됨)
   * @param applicationData - 지원서 데이터 { userId, applicationMessage }
   * @returns boolean - 신청 성공 여부
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
      throw new CustomError(409, "You have already applied to this community."); // Conflict
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
        409, // Conflict
        "The community has reached its maximum number of members."
      );
    }

    await this.applicationRepository.create(community.postId, applicationData);
    return true; // 성공 시 true 반환
  }

  /**
   * 특정 모집 커뮤니티의 신청자 목록 상세 조회
   * @param communityId - 모집 커뮤니티 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀장만 조회 가능)
   * @returns TeamApplication 배열 (지원자 정보 포함)
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
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
   * @param communityId - 모집 커뮤니티 ID
   * @param applicantUserId - 지원자 사용자 ID
   * @param newStatus - 변경할 상태 (ACCEPTED 또는 REJECTED)
   * @param requestingUserId - 요청하는 사용자 ID (팀장만 가능)
   * @returns boolean - 처리 성공 여부
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
        throw new CustomError(409, "Applicant is already a team member."); // Conflict
      }
      await this.teamMemberRepository.create({
        userId: applicantUserId,
        teamId: communityId,
        role: TeamRole.MEMBER, // 수락된 지원자는 팀원
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
   * 모집 취소 (팀장이 모집글 및 관련 커뮤니티/지원서 삭제).
   * @param communityId - 모집 커뮤니티 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀장만 가능)
   * @returns boolean - 처리 성공 여부
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
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
    // 해당 모집글(Post)도 삭제 (스키마에 cascade delete가 설정되어 있다면 불필요할 수 있음)
    await this.postRepository.delete(community.postId);
    // TeamCommunity 자체도 삭제
    await this.communityRepository.delete(communityId);

    return true;
  }
}
