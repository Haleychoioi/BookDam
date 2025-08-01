// src/services/communities.service.ts

import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import userRepository from "../repositories/user.repository";
import {
  TeamCommunity,
  CommunityStatus,
  PostType,
  TeamRole,
  RecruitmentStatus,
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

// 커뮤니티 목록 조회 시 필요한 추가 정보를 포함하는 인터페이스 정의
interface CommunityWithMemberInfo extends TeamCommunity {
  maxMembers: number;
  currentMembers: number;
}

export class CommunityService {
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;
  private userRepository = userRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
  }

  /**
   * 커뮤니티 목록 조회
   * @param query
   * @returns
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
   * @returns
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

    // 1. 모집글(Post) 먼저 생성
    const recruitmentPost = await this.postRepository.create({
      userId: communityData.userId,
      title: communityData.title,
      content: communityData.content,
      type: PostType.RECRUITMENT,
      maxMembers: communityData.maxMembers,
      recruitmentStatus: RecruitmentStatus.RECRUITING,

      isbn13: communityData.isbn13,
    });

    // 2. 생성된 모집글의 postId를 사용하여 커뮤니티(TeamCommunity) 생성
    const newCommunity = await this.communityRepository.create({
      postId: recruitmentPost.postId,
      isbn13: communityData.isbn13,
      status: CommunityStatus.RECRUITING,
      postTitle: recruitmentPost.title,
      postContent: recruitmentPost.content,
      postAuthor: user.nickname,
    });

    // 3. 커뮤니티 생성자를 팀장(LEADER)으로 TeamMember 테이블에 추가
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
   * @returns
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
   * @returns
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
   * @returns
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
    return Promise.all(
      communities.map(async (community) => {
        // Post에서 maxMembers 정보 가져오기
        const post = await this.postRepository.findById(community.postId);
        const maxMembers = post?.maxMembers || 0;

        // TeamMember에서 현재 멤버 수 세기
        const currentMembers =
          await this.teamMemberRepository.countMembersByTeamId(
            community.teamId
          );

        return {
          ...community,
          maxMembers,
          currentMembers,
        };
      })
    );
  }
}
