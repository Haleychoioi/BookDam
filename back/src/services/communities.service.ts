// src/services/communities.service.ts

import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import userRepository from "../repositories/user.repository";
import { ApplicationService } from "./applications.service";
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
  hostId: number;
  hasApplied?: boolean; // ✨ 추가: hasApplied 필드도 포함될 수 있도록 ✨
}

// CommunityRepository에서 반환하는 타입과 일치시킵니다.
type CommunityWithApplicationStatus = TeamCommunity & {
  hasApplied?: boolean;
  recruitmentPost?: {
    applications?: { applicationId: number }[];
    _count?: { applications: number };
  } | null;
};

export class CommunityService {
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;
  private userRepository = userRepository;
  private applicationService: ApplicationService;

  constructor() {
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
    this.userRepository = userRepository;
    this.applicationService = new ApplicationService();
  }

  public async getMyRecruitingCommunities(
    hostId: number
  ): Promise<CommunityWithMemberInfo[]> {
    // ✨ 반환 타입 변경 ✨
    const communities = await this.communityRepository.findRecruitingByHostId(
      hostId
    );

    if (communities.length === 0) {
      return [];
    }
    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  public async getMyParticipatingCommunities(
    userId: number
  ): Promise<CommunityWithMemberInfo[]> {
    // ✨ 반환 타입 변경 ✨
    const communities = await this.communityRepository.findActiveByMemberId(
      userId
    );

    console.log(
      "서비스에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터:", // 로그 메시지 수정
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
      const community = await this.communityRepository.findById(teamId);
      if (community) {
        await this.applicationService.cancelRecruitment(
          community.teamId,
          userId
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
   * @returns Promise<{ communities: CommunityWithApplicationStatus[]; totalResults: number }>
   * @throws
   */
  public async findAllCommunities(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
    userId?: number;
  }): Promise<{
    communities: CommunityWithApplicationStatus[];
    totalResults: number;
  }> {
    // ✨ 반환 타입 변경 ✨
    const communities = await this.communityRepository.findMany(query);

    if (communities.length === 0) {
      // 이제 No communities found는 repository에서 직접 처리하지 않습니다.
      return { communities: [], totalResults: 0 }; // 빈 배열과 0 반환
    }

    // `findMany`는 이미 `hasApplied`를 포함하는 `CommunityWithApplicationStatus`를 반환합니다.
    // 여기서 `CommunityWithMemberInfo`로 한번 더 변환하는 대신, 이미 변환된 상태를 유지해야 합니다.
    // `enrichCommunitiesWithMemberInfo`는 TeamCommunity[]를 받으므로, 타입 단언이 필요합니다.
    const enrichedCommunities = await this.enrichCommunitiesWithMemberInfo(
      communities as TeamCommunity[]
    ); // ✨ 타입 단언 ✨

    // totalResults는 repository에서 반환되지 않으므로, 여기서 communities.length 사용
    return {
      communities: enrichedCommunities,
      totalResults: communities.length, // 현재 페이지의 결과 수
    };
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
   * @returns CommunityWithApplicationStatus[]
   * @throws
   */
  public async findCommunitiesByBook(
    bookIsbn13: string,
    query: { size?: number; userId?: number }
  ): Promise<CommunityWithApplicationStatus[]> {
    // ✨ 반환 타입 변경 ✨
    const communities = await this.communityRepository.findByBookIsbn13(
      bookIsbn13,
      query
    );
    if (communities.length === 0) {
      // No communities found for this book은 repository에서 직접 처리하지 않습니다.
      return []; // 빈 배열 반환
    }

    return this.enrichCommunitiesWithMemberInfo(communities as TeamCommunity[]); // ✨ 타입 단언 ✨
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
        const hostId = post?.userId || 0;

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
    console.log("서비스에서 생성된 풍부한 커뮤니티 데이터:", enrichedResults);
    return enrichedResults;
  }

  public async findEndedCommunitiesByHostId(
    hostId: number
  ): Promise<CommunityWithMemberInfo[]> {
    // ✨ 반환 타입 변경 ✨
    const communities = await this.communityRepository.findEndedByHostId(
      hostId
    );
    return this.enrichCommunitiesWithMemberInfo(communities);
  }
}
