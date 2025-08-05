import {
  ApplicationStatus,
  CommunityStatus,
  PostType,
  TeamApplication,
  TeamRole,
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

import { ApplicationWithPostInfo } from "../repositories/applications.repository";

import { ApplicationRepository } from "../repositories/applications.repository";
import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { TeamCommentRepository } from "../repositories/team-comments.repository";

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;
  private teamPostRepository: TeamPostRepository;
  private teamCommentRepository: TeamCommentRepository;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
    this.teamPostRepository = new TeamPostRepository();
    this.teamCommentRepository = new TeamCommentRepository();
  }

  public async getMyApplications(
    userId: number
  ): Promise<ApplicationWithPostInfo[]> {
    const applications = await this.applicationRepository.findManyByUserId(
      userId
    );

    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        if (app.post && app.post.team) {
          const communityId = app.post.team.teamId;
          const postId = app.post.postId;

          // 현재 멤버 수 조회
          const currentMembers =
            await this.teamMemberRepository.countMembersByTeamId(communityId);
          // 모집글 (Post)에서 maxMembers 조회
          const recruitmentPost = await this.postRepository.findById(postId);
          const maxMembers = recruitmentPost?.maxMembers || 0;

          return {
            ...app,
            post: {
              ...app.post,
              team: {
                ...app.post.team,
                currentMembers: currentMembers,
                maxMembers: maxMembers,
              },
            },
          };
        }
        return app;
      })
    );
    return enrichedApplications;
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

  public async createApplication(
    communityId: number,
    applicationData: { userId: number; applicationMessage: string }
  ): Promise<boolean> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }
    console.log(
      `ApplicationService: Community ID ${communityId} status is ${community.status}`
    );

    if (community.status !== CommunityStatus.RECRUITING) {
      throw new CustomError(400, "This community is not currently recruiting.");
    }

    const existingApplication =
      await this.applicationRepository.findByUserIdAndPostId(
        applicationData.userId,
        community.postId
      );
    if (existingApplication) {
      throw new CustomError(409, "You have already applied to this community.");
    }

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
      await this.teamMemberRepository.countMembersByTeamId(communityId);
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

  public async findApplicantsByCommunity(
    communityId: number,
    requestingUserId: number
  ): Promise<any[]> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

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
    if (!applicants || applicants.length === 0) {
      return [];
    }
    return applicants;
  }

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

    // 삭제 전 커뮤니티 존재 여부 확인 (나중에 성공 판단에 사용)
    const wasCommunityInitiallyPresent =
      (await this.communityRepository.countCommunitiesById(communityId)) > 0;
    console.log(
      `[ApplicationService.cancelRecruitment] Starting deletion for communityId: ${communityId}, postId: ${community.postId}. Initially present: ${wasCommunityInitiallyPresent}`
    );

    try {
      // 1. TeamComments 삭제
      const teamPostsInCommunity =
        await this.teamPostRepository.findManyByCommunityId(communityId, {});
      console.log(
        `[ApplicationService.cancelRecruitment] Found ${teamPostsInCommunity.length} team posts in community ${communityId} before comment deletion.`
      );

      for (const teamPost of teamPostsInCommunity) {
        const commentsDeleted =
          await this.teamCommentRepository.deleteManyByTeamPostId(
            teamPost.teamPostId
          );
        console.log(
          `[ApplicationService.cancelRecruitment] TeamComments deleted for teamPost ${teamPost.teamPostId}: ${commentsDeleted}`
        );
      }

      // 2. TeamPosts 삭제
      const initialTeamPostsCount =
        await this.teamPostRepository.countPostsByTeamId(communityId);
      console.log(
        `[ApplicationService.cancelRecruitment] Found ${initialTeamPostsCount} team posts in community ${communityId} before post deletion.`
      );
      const teamPostsDeletedCount =
        await this.teamPostRepository.deleteManyByTeamId(communityId);
      console.log(
        `[ApplicationService.cancelRecruitment] TeamPosts deleted count: ${teamPostsDeletedCount}`
      );

      // 3. TeamMembers 삭제
      const initialTeamMembersCount =
        await this.teamMemberRepository.countMembersByTeamId(communityId);
      console.log(
        `[ApplicationService.cancelRecruitment] Found ${initialTeamMembersCount} team members in community ${communityId} before member deletion.`
      );
      const teamMembersDeletedCount =
        await this.teamMemberRepository.deleteManyByTeamId(communityId);
      console.log(
        `[ApplicationService.cancelRecruitment] TeamMembers deleted count: ${teamMembersDeletedCount}`
      );

      // 4. TeamApplications 삭제
      const initialApplicationsCount =
        await this.applicationRepository.countApplicationsByPostId(
          community.postId
        );
      console.log(
        `[ApplicationService.cancelRecruitment] Found ${initialApplicationsCount} applications for postId ${community.postId} before deletion.`
      );
      const applicationsDeletedCount =
        await this.applicationRepository.deleteRecruitment(community.postId);
      console.log(
        `[ApplicationService.cancelRecruitment] Applications deleted count: ${applicationsDeletedCount}`
      );

      // 5. Post (모집글) 삭제
      await this.postRepository.delete(community.postId);
      console.log(
        `[ApplicationService.cancelRecruitment] Recruitment post deleted for postId: ${community.postId}`
      );

      // 6. TeamCommunity 삭제 (이전 로그에서 0 반환했던 부분)
      const initialCommunityCount =
        await this.communityRepository.countCommunitiesById(communityId);
      console.log(
        `[ApplicationService.cancelRecruitment] Found ${initialCommunityCount} community records for teamId ${communityId} before community deletion.`
      );
      const communityDeletedCount = await this.communityRepository.delete(
        communityId
      );
      console.log(
        `[ApplicationService.cancelRecruitment] Community deleted count: ${communityDeletedCount}`
      );

      const isCommunityNowGone =
        (await this.communityRepository.countCommunitiesById(communityId)) ===
        0;

      if (wasCommunityInitiallyPresent && isCommunityNowGone) {
        return true;
      } else if (communityDeletedCount > 0) {
        return true;
      } else {
        throw new CustomError(
          404,
          "모집 취소 실패: 커뮤니티 레코드를 삭제할 수 없습니다. (대상 없음 또는 다른 제약 조건)"
        );
      }
    } catch (error) {
      console.error(
        `[ApplicationService.cancelRecruitment] Error during full deletion for community ${communityId}:`,
        error
      );
      if (error instanceof CustomError) {
        throw error;
      } else if (error instanceof Error) {
        throw new CustomError(
          500,
          `모집 취소 중 예상치 못한 오류 발생: ${error.message}`
        );
      } else {
        throw new CustomError(500, "모집 취소 중 알 수 없는 오류 발생");
      }
    }
  }
}
