// src/zip/services/communities.service.ts

import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import userRepository from "../repositories/user.repository";
import { ApplicationService } from "./applications.service";
import { BookRepository } from "../repositories/book.repository"; // ✨ BookRepository 임포트 추가 ✨

import {
  TeamCommunity,
  CommunityStatus,
  PostType,
  TeamRole,
  RecruitmentStatus,
  ApplicationStatus,
  TeamApplication, // ✨ TeamApplication 임포트 추가 ✨
} from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

// CommunityWithMemberInfo 인터페이스를 이 파일 내부에 정의합니다.
interface CommunityWithMemberInfo extends TeamCommunity {
  currentMembers: number;
  maxMembers: number;
  hostId: number;
  hasApplied?: boolean;
  pendingApplicantCount?: number;
}

// CommunityRepository에서 반환하는 타입과 일치시킵니다.
type CommunityWithApplicationStatus = TeamCommunity & {
  hasApplied?: boolean;
  recruitmentPost?: {
    applications?: { applicationId: number }[];
    _count?: { applications: number };
  } | null;
};

// ✨ 새로 추가: TeamCommunity에 책 제목이 포함된 타입 ✨
export interface TeamCommunityWithBookTitle extends TeamCommunity {
  bookTitle: string | null;
}

export class CommunityService {
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private teamMemberRepository: TeamMemberRepository;
  private userRepository = userRepository;
  private applicationService: ApplicationService;
  private bookRepository: BookRepository; // ✨ BookRepository 인스턴스 추가 ✨

  constructor() {
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
    this.userRepository = userRepository;
    this.applicationService = new ApplicationService();
    this.bookRepository = new BookRepository(); // ✨ BookRepository 초기화 ✨
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
    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  public async getMyParticipatingCommunities(
    userId: number
  ): Promise<CommunityWithMemberInfo[]> {
    // findActiveByMemberId는 이제 CLOSED/COMPLETED도 포함하도록 아래에서 수정됩니다.
    const communities = await this.communityRepository.findActiveByMemberId(
      userId
    );

    console.log(
      "서비스에서 클라이언트로 전송될 내가 모집 중인 커뮤니티 데이터:",
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
    const communities = await this.communityRepository.findMany(query);

    if (communities.length === 0) {
      return { communities: [], totalResults: 0 };
    }

    const enrichedCommunities = await this.enrichCommunitiesWithMemberInfo(
      communities as TeamCommunity[]
    );

    return {
      communities: enrichedCommunities,
      totalResults: communities.length,
    };
  }

  /**
   * 새로운 커뮤니티 생성
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
    const communities = await this.communityRepository.findByBookIsbn13(
      bookIsbn13,
      query
    );
    if (communities.length === 0) {
      return [];
    }

    return this.enrichCommunitiesWithMemberInfo(communities as TeamCommunity[]);
  }

  /**
   * 특정 커뮤니티의 상세 정보 조회 (책 제목 포함)
   * @param communityId
   * @returns TeamCommunityWithBookTitle
   * @throws
   */
  public async findCommunityById(
    communityId: number
  ): Promise<TeamCommunityWithBookTitle> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    let bookTitle: string | null = null;
    if (community.isbn13) {
      const book = await this.bookRepository.findByIsbn(community.isbn13);
      bookTitle = book ? book.title : null;
    }

    return {
      ...community,
      bookTitle: bookTitle,
    };
  }

  /**
   * 커뮤니티 상태 업데이트 (일반적인 상태 변경용)
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
   * 특정 커뮤니티의 상세 정보 업데이트 (제목, 내용, 모집 인원 등)
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
   * 모집 종료 로직: 최소 멤버 수 확인 및 상태 변경
   * PATCH /api/mypage/communities/:communityId/end-recruitment 호출 시
   * @param communityId
   * @param requestingUserId
   * @returns
   * @throws CustomError 모집 인원 부족 시
   */
  public async endCommunityRecruitment(
    communityId: number,
    requestingUserId: number
  ): Promise<TeamCommunity> {
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
        "Unauthorized: Only the team leader can end recruitment."
      );
    }

    // 모집글 정보 가져오기 (maxMembers 확인용)
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

    // ✨ 최소 멤버 수 확인 로직 ✨
    if (currentMembersCount < 2) {
      throw new CustomError(
        400,
        `모집 인원이 최소 2명 이상이어야 모집 종료할 수 있습니다. (현재 ${currentMembersCount}명)`
      );
    }

    // ✨ 상태를 ACTIVE로 변경 (모집 성공적으로 완료) ✨
    const updatedCommunity = await this.communityRepository.update(
      communityId,
      { status: CommunityStatus.ACTIVE }
    );

    // 모집글 상태도 업데이트 (선택 사항: CLOSED로 변경하여 더 이상 노출되지 않도록)
    await this.postRepository.update(community.postId, {
      recruitmentStatus: RecruitmentStatus.CLOSED,
    });

    return updatedCommunity;
  }

  public async findEndedCommunitiesByHostId(
    hostId: number
  ): Promise<CommunityWithMemberInfo[]> {
    const communities = await this.communityRepository.findEndedByHostId(
      hostId
    );
    return this.enrichCommunitiesWithMemberInfo(communities);
  }

  /**
   * 헬퍼 함수: 커뮤니티 목록에 maxMembers, currentMembers, pendingApplicantCount 정보 추가
   * @param communities - CommunityRepository에서 가져온 TeamCommunity 배열 (applications 정보 포함 가능)
   * @returns CommunityWithMemberInfo[]
   */
  private async enrichCommunitiesWithMemberInfo(
    communities: (TeamCommunity & {
      recruitmentPost?: {
        applications: TeamApplication[];
      } | null;
    })[]
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

        const pendingApplicantCount =
          community.recruitmentPost?.applications?.filter(
            (app) => app.status === ApplicationStatus.PENDING
          ).length || 0;

        return {
          ...community,
          maxMembers,
          currentMembers,
          hostId,
          pendingApplicantCount,
        };
      })
    );
    console.log("서비스에서 생성된 풍부한 커뮤니티 데이터:", enrichedResults);
    return enrichedResults;
  }
}
