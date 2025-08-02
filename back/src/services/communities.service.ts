// src/services/communities.service.ts

import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import userRepository from "../repositories/user.repository";
import { ApplicationService } from "./applications.service"; // ✨ ApplicationService 임포트 ✨
import {
  TeamCommunity,
  CommunityStatus,
  PostType,
  TeamRole,
  RecruitmentStatus,
  TeamApplication,
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

// CommunityWithMemberInfo 인터페이스를 이 파일 내부에 정의합니다.
interface CommunityWithMemberInfo extends TeamCommunity {
  currentMembers: number;
  maxMembers: number;
  hostId: number; // ✨ CommunityWithMemberInfo에 hostId 추가 ✨
}

type CommunityWithRecruitingInfo = TeamCommunity & {
  recruitmentPost: {
    applications: (TeamApplication & {
      user: {
        userId: number;
        nickname: string;
      };
    })[];
  };
};

export class CommunityService {
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;
  private userRepository = userRepository;
  private applicationService: ApplicationService; // ✨ ApplicationService 속성 추가 ✨

  constructor() {
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
    this.userRepository = userRepository;
    this.applicationService = new ApplicationService(); // ✨ ApplicationService 초기화 ✨
  }

  public async getMyRecruitingCommunities(
    hostId: number
  ): Promise<CommunityWithMemberInfo[]> {
    const communities = await this.communityRepository.findRecruitingByHostId(
      hostId
    );

    if (communities.length === 0) {
      return [];
    }
    return this.enrichCommunitiesWithMemberInfo(communities as TeamCommunity[]);
  }

  public async getMyParticipatingCommunities(
    userId: number
  ): Promise<CommunityWithMemberInfo[]> {
    const communities = await this.communityRepository.findActiveByMemberId(
      userId
    );

    console.log(
      "컨트롤러에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터:",
      communities
    );

    if (communities.length === 0) {
      return [];
    }
    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  public async leaveOrDeleteCommunity(
    userId: number,
    teamId: number
  ): Promise<string> {
    const membership = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamId
    );

    if (!membership) {
      throw new CustomError(404, "가입되지 않은 커뮤니티입니다.");
    }

    if (membership.role === TeamRole.LEADER) {
      // 팀장이면 커뮤니티 및 관련 게시물/지원서 삭제
      const community = await this.communityRepository.findById(teamId);
      if (community) {
        // ✨ ApplicationService를 통해 모집 취소(지원서 삭제) 기능 호출 ✨
        // await this.applicationService.cancelRecruitment(community.teamId, userId); // communityId와 userId 필요
        // 이 메서드는 `applicationRepository.deleteRecruitment`와 `postRepository.delete`를 직접 호출하므로,
        // 이곳에서는 직접 해당 리포지토리 메서드를 사용하거나, ApplicationService에 적절한 래퍼 메서드를 추가해야 합니다.
        // 현재 CommunityService의 leaveOrDeleteCommunity는 커뮤니티 삭제와 멤버십 삭제를 함께 다루므로,
        // 여기서는 applicationRepository와 postRepository를 직접 호출하는 기존 방식을 유지하되,
        // 해당 리포지토리들이 CommunityService의 속성으로 선언되어 있지 않음을 인지해야 합니다.
        // 이 문제를 해결하기 위해, applicationRepository와 postRepository를 CommunityService의 속성으로 추가해야 합니다.

        // ✨ CommunityService에 applicationRepository와 postRepository를 추가합니다. ✨
        // 이는 이미 constructor에 있지만, 명시적으로 다시 확인합니다.
        // this.applicationRepository = new ApplicationRepository(); // constructor에 이미 존재
        // this.postRepository = new PostRepository(); // constructor에 이미 존재

        await this.applicationService.cancelRecruitment(
          community.teamId, // communityId는 teamId
          userId // userId
        );
      }
      await this.communityRepository.delete(teamId);
      return "커뮤니티가 성공적으로 삭제되었습니다.";
    } else {
      await this.teamMemberRepository.delete(userId, teamId);
      return "커뮤니티에서 성공적으로 탈퇴했습니다.";
    }
  }

  /**
   * 커뮤니티 목록 조회
   * @param query
   * @returns CommunityWithMemberInfo[]
   * @throws
   */
  public async findAllCommunities(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<CommunityWithMemberInfo[]> {
    const communities = await this.communityRepository.findMany(query);

    if (communities.length === 0) {
      throw new CustomError(404, "No communities found");
    }

    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  /**
   * 도서 기반 커뮤니티 생성
   * @param communityData
   * @returns TeamCommunity
   * @throws
   */
  public async createCommunity(communityData: {
    userId: number;
    isbn13: string;
    title: string;
    content: string;
    maxMembers: number;
  }): Promise<TeamCommunity> {
    const user = await this.userRepository.findById(communityData.userId);
    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    const recruitmentPost = await this.postRepository.create({
      userId: communityData.userId,
      title: communityData.title,
      content: communityData.content,
      type: PostType.RECRUITMENT,
      maxMembers: communityData.maxMembers,
      recruitmentStatus: RecruitmentStatus.RECRUITING,

      isbn13: communityData.isbn13,
    });

    const newCommunity = await this.communityRepository.create({
      postId: recruitmentPost.postId,
      isbn13: communityData.isbn13,
      status: CommunityStatus.RECRUITING,
      postTitle: recruitmentPost.title,
      postContent: recruitmentPost.content,
      postAuthor: user.nickname,
    });

    await this.teamMemberRepository.create({
      userId: communityData.userId,
      teamId: newCommunity.teamId,
      role: TeamRole.LEADER,
    });

    return newCommunity;
  }

  /**
   * 특정 도서 관련 커뮤니티 목록 조회
   * @param bookIsbn13
   * @param query
   * @returns CommunityWithMemberInfo[]
   * @throws
   */
  public async findCommunitiesByBook(
    bookIsbn13: string,
    query: { size?: number }
  ): Promise<CommunityWithMemberInfo[]> {
    const communities = await this.communityRepository.findByBookIsbn13(
      bookIsbn13,
      query
    );
    if (communities.length === 0) {
      throw new CustomError(404, "No communities found for this book.");
    }

    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  /**
   * 특정 커뮤니티의 상세 정보 조회
   * @param communityId
   * @returns TeamCommunity
   * @throws
   */
  public async findCommunityById(communityId: number): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }
    return community;
  }

  /**
   * 커뮤니티 상태 업데이트
   * @param communityId
   * @param newStatus
   * @param requestingUserId
   * @returns TeamCommunity
   * @throws
   */
  public async updateCommunityStatus(
    communityId: number,
    newStatus: CommunityStatus,
    requestingUserId: number
  ): Promise<TeamCommunity> {
    // TeamCommunity 반환 타입 추가
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
        "Unauthorized: Only the team leader can update community status."
      );
    }

    const updatedCommunity = await this.communityRepository.update(
      // 이 update 메서드는 status 업데이트도 가능해야 함
      communityId,
      { status: newStatus }
    );
    return updatedCommunity;
  }

  /**
   * 특정 커뮤니티의 상세 정보 업데이트
   * @param communityId
   * @param requestingUserId
   * @param updateData
   * @returns
   * @throws
   */
  public async updateCommunityDetails(
    communityId: number,
    requestingUserId: number,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruiting?: boolean;
    }
  ): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found.");
    }

    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember || teamMember.role !== TeamRole.LEADER) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can update community details."
      );
    }

    const postUpdateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruitmentStatus?: RecruitmentStatus;
    } = {};

    if (updateData.title !== undefined) {
      postUpdateData.title = updateData.title;
    }
    if (updateData.content !== undefined) {
      postUpdateData.content = updateData.content;
    }
    if (updateData.maxMembers !== undefined) {
      postUpdateData.maxMembers = updateData.maxMembers;
    }
    if (updateData.recruiting !== undefined) {
      postUpdateData.recruitmentStatus = updateData.recruiting
        ? RecruitmentStatus.RECRUITING
        : RecruitmentStatus.CLOSED;
    }

    if (community.postId && Object.keys(postUpdateData).length > 0) {
      await this.postRepository.update(community.postId, postUpdateData);
    }

    const communityUpdateData: {
      postTitle?: string;
      postContent?: string;
      status?: CommunityStatus;
    } = {};

    if (updateData.title !== undefined) {
      communityUpdateData.postTitle = updateData.title;
    }
    if (updateData.content !== undefined) {
      communityUpdateData.postContent = updateData.content;
    }
    if (updateData.recruiting !== undefined) {
      communityUpdateData.status = updateData.recruiting
        ? CommunityStatus.RECRUITING
        : CommunityStatus.ACTIVE;
    }

    const updatedCommunity = await this.communityRepository.update(
      communityId,
      communityUpdateData
    );
    return updatedCommunity;
  }

  /**
   * 커뮤니티 삭제(DELETE /api/communities/:communityId)
   * @param communityId
   * @param requestingUserId
   * @returns
   * @throws CustomError 커뮤니티를 찾을 수 없을 때, 팀장이 아닐 때, 삭제 실패 시
   */
  public async deleteCommunity(
    communityId: number,
    requestingUserId: number
  ): Promise<void> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found.");
    }

    const teamLeader = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );

    if (!teamLeader || teamLeader.role !== TeamRole.LEADER) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can delete the community."
      );
    }

    try {
      await this.communityRepository.delete(communityId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 헬퍼 함수: 커뮤니티 목록에 maxMembers 및 currentMembers 정보 추가
   * @param communities
   * @returns
   */
  private async enrichCommunitiesWithMemberInfo(
    communities: TeamCommunity[]
  ): Promise<CommunityWithMemberInfo[]> {
    const enrichedResults = await Promise.all(
      communities.map(async (community) => {
        const post = await this.postRepository.findById(community.postId);
        const maxMembers = post?.maxMembers || 0;
        const hostId = post?.userId || 0; // ✨ Post의 userId를 hostId로 사용, 없으면 0 ✨

        const currentMembers =
          await this.teamMemberRepository.countMembersByTeamId(
            community.teamId
          );

        return {
          ...community,
          maxMembers,
          currentMembers,
          hostId,
        };
      })
    );
    // ✨ 새로 추가할 로그: 서비스에서 생성된 최종 객체 확인 ✨
    console.log("서비스에서 생성된 풍부한 커뮤니티 데이터:", enrichedResults);
    return enrichedResults;
  }

  public async findEndedCommunitiesByHostId(
    hostId: number
  ): Promise<TeamCommunity[]> {
    const communities = await this.communityRepository.findEndedByHostId(
      hostId
    );
    return this.enrichCommunitiesWithMemberInfo(communities); // 멤버 정보를 포함하여 반환
  }
}
