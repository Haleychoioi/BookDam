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
   * 커뮤니티 목록을 조회합니다.
   * @param query - 페이지네이션 및 정렬 옵션
   * @returns TeamCommunity 배열
   */
  public async findAllCommunities(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<TeamCommunity[]> {
    const communities = await this.communityRepository.findMany(query);
    return communities;
  }

  /**
   * 도서 기반 커뮤니티를 생성합니다.
   * @param communityData - 생성할 커뮤니티 데이터 (userId, bookIsbn13?, title, content, maxMembers)
   * @returns 생성된 TeamCommunity 객체
   */
  public async createCommunity(communityData: {
    userId: number;
    bookIsbn13?: string;
    title: string;
    content: string;
    maxMembers: number;
  }): Promise<TeamCommunity> {
    // 사용자 닉네임 가져오기 (postAuthor 필드에 사용)
    const user = await this.userRepository.findById(communityData.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // 1. 모집글(Post) 먼저 생성
    const recruitmentPost = await this.postRepository.create({
      userId: communityData.userId,
      title: communityData.title,
      content: communityData.content,
      type: PostType.RECRUITMENT, // 모집글 타입으로 설정
      maxMembers: communityData.maxMembers,
      recruitmentStatus: RecruitmentStatus.RECRUITING, // 모집글 초기 상태: 모집중
      isbn13: communityData.bookIsbn13, // Post 모델의 isbn13 필드에 값 전달
    });

    // 2. 생성된 모집글의 postId를 사용하여 커뮤니티(TeamCommunity) 생성
    const newCommunity = await this.communityRepository.create({
      postId: recruitmentPost.postId,
      isbn13: communityData.bookIsbn13, // TeamCommunity 모델의 isbn13 필드에 값 전달
      status: CommunityStatus.RECRUITING, // 초기 상태: 모집중
      postTitle: recruitmentPost.title, // 모집글 제목 복사
      postContent: recruitmentPost.content, // 모집글 내용 복사
      postAuthor: user.nickname, // 모집글 작성자 닉네임 복사
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
   * 특정 도서 관련 커뮤니티 목록을 조회합니다.
   * @param bookIsbn13 - 도서 ISBN13
   * @param query - 조회 옵션
   * @returns TeamCommunity 배열
   */
  public async findCommunitiesByBook(
    bookIsbn13: string,
    query: { size?: number }
  ): Promise<TeamCommunity[]> {
    const communities = await this.communityRepository.findByBookIsbn13(
      bookIsbn13,
      query
    );
    return communities;
  }

  /**
   * 특정 커뮤니티의 상세 정보를 조회합니다.
   * @param communityId - 조회할 커뮤니티 ID
   * @returns TeamCommunity 객체
   * @throws Error 커뮤니티를 찾을 수 없을 때
   */
  public async findCommunityById(communityId: number): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }
    return community;
  }

  /**
   * 커뮤니티 상태를 업데이트합니다.
   * @param communityId - 업데이트할 커뮤니티 ID
   * @param newStatus - 변경할 새로운 상태
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns 업데이트된 TeamCommunity 객체
   * @throws Error 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateCommunityStatus(
    communityId: number,
    newStatus: CommunityStatus,
    requestingUserId: number
  ): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // 요청 사용자가 이 커뮤니티의 팀장인지 확인 (권한 검증)
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember || teamMember.role !== TeamRole.LEADER) {
      throw new Error(
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
   * 특정 커뮤니티의 상세 정보를 업데이트합니다. (recruiting, title, content, maxMembers 등)
   * @param communityId - 업데이트할 커뮤니티 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @param updateData - 업데이트할 데이터 (Partial<TeamCommunity> 타입)
   * @returns 업데이트된 TeamCommunity 객체
   * @throws Error 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateCommunityDetails(
    communityId: number,
    requestingUserId: number,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruiting?: boolean; // recruiting 필드 추가
    }
  ): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new Error("Community not found.");
    }

    // 요청 사용자가 이 커뮤니티의 팀장인지 확인 (권한 검증)
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember || teamMember.role !== TeamRole.LEADER) {
      throw new Error(
        "Unauthorized: Only the team leader can update community details."
      );
    }

    // Post 모델의 업데이트가 필요한 필드 처리
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
        : RecruitmentStatus.CLOSED; // RecruitmentStatus 사용
    }

    // 해당 커뮤니티의 postId를 사용하여 Post 업데이트
    if (community.postId && Object.keys(postUpdateData).length > 0) {
      await this.postRepository.update(community.postId, postUpdateData);
    }

    // TeamCommunity 업데이트
    // TeamCommunity의 postTitle, postContent, status 필드를 업데이트합니다.
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
      // recruiting이 false일 때 CommunityStatus.ACTIVE로 변경
      communityUpdateData.status = updateData.recruiting
        ? CommunityStatus.RECRUITING
        : CommunityStatus.ACTIVE; // <-- 이 부분을 수정했습니다.
    }

    const updatedCommunity = await this.communityRepository.update(
      communityId,
      communityUpdateData
    );
    return updatedCommunity;
  }

  /**
   * 커뮤니티를 삭제합니다. (DELETE /api/communities/:communityId)
   * @param communityId - 삭제할 커뮤니티 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀장만 삭제 가능)
   * @returns 삭제된 레코드의 수 (0 또는 1)
   * @throws Error 커뮤니티를 찾을 수 없을 때, 팀장이 아닐 때, 또는 삭제 실패 시
   */
  public async deleteCommunity(
    communityId: number,
    requestingUserId: number
  ): Promise<number> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new Error("Community not found.");
    }

    // 요청하는 사용자가 해당 커뮤니티의 팀장인지 확인
    const teamLeader = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );

    if (!teamLeader || teamLeader.role !== TeamRole.LEADER) {
      throw new Error(
        "Unauthorized: Only the team leader can delete the community."
      );
    }

    // 커뮤니티 삭제
    const deletedCount = await this.communityRepository.delete(communityId);

    if (deletedCount === 0) {
      throw new Error(
        "Failed to delete community: Community not found or already deleted."
      );
    }

    // TODO: 관련 신청 정보도 삭제 (필요하다면 ApplicationRepository에 추가)
    // await this.applicationRepository.deleteManyByCommunityId(communityId);

    return deletedCount; // 삭제된 레코드 수 반환
  }
}
