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
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

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
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 (선택적)
   */
  public async findAllCommunities(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<TeamCommunity[]> {
    const communities = await this.communityRepository.findMany(query);
    // 커뮤니티가 없는 경우 404 에러를 던질지, 빈 배열을 반환할지는 API 정책에 따라 다릅니다.
    // 여기서는 "목록 조회"이므로 빈 배열 반환이 더 자연스러울 수 있습니다.
    // 하지만 일관된 404 에러 처리를 위해, 만약 "어떤 것도 찾을 수 없음"을 명확히 하고 싶다면 아래 주석을 해제하세요.
    // if (communities.length === 0) {
    //   throw new CustomError(404, "No communities found.");
    // }
    return communities;
  }

  /**
   * 도서 기반 커뮤니티를 생성합니다.
   * @param communityData - 생성할 커뮤니티 데이터 (userId, isbn13, title, content, maxMembers)
   * @returns 생성된 TeamCommunity 객체
   * @throws CustomError 사용자를 찾을 수 없을 때
   */
  public async createCommunity(communityData: {
    userId: number;
    // ⭐ 변경: bookIsbn13? -> isbn13 (물음표 제거하여 필수로 만듦)
    isbn13: string;
    title: string;
    content: string;
    maxMembers: number;
  }): Promise<TeamCommunity> {
    // 사용자 닉네임 가져오기 (postAuthor 필드에 사용)
    const user = await this.userRepository.findById(communityData.userId);
    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    // 1. 모집글(Post) 먼저 생성
    const recruitmentPost = await this.postRepository.create({
      userId: communityData.userId,
      title: communityData.title,
      content: communityData.content,
      type: PostType.RECRUITMENT, // 모집글 타입으로 설정
      maxMembers: communityData.maxMembers,
      recruitmentStatus: RecruitmentStatus.RECRUITING, // 모집글 초기 상태: 모집중
      // ⭐ 변경: communityData.bookIsbn13 -> communityData.isbn13
      isbn13: communityData.isbn13,
    });

    // 2. 생성된 모집글의 postId를 사용하여 커뮤니티(TeamCommunity) 생성
    const newCommunity = await this.communityRepository.create({
      postId: recruitmentPost.postId,
      // ⭐ 변경: communityData.bookIsbn13 -> communityData.isbn13
      isbn13: communityData.isbn13,
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
   * @throws CustomError 커뮤니티를 찾을 수 없을 때
   */
  public async findCommunitiesByBook(
    bookIsbn13: string,
    query: { size?: number }
  ): Promise<TeamCommunity[]> {
    const communities = await this.communityRepository.findByBookIsbn13(
      bookIsbn13,
      query
    );
    // 특정 도서에 대한 커뮤니티가 없는 경우 404 에러를 던지도록 변경
    if (communities.length === 0) {
      throw new CustomError(404, "No communities found for this book.");
    }
    return communities;
  }

  /**
   * 특정 커뮤니티의 상세 정보를 조회합니다.
   * @param communityId - 조회할 커뮤니티 ID
   * @returns TeamCommunity 객체
   * @throws CustomError 커뮤니티를 찾을 수 없을 때
   */
  public async findCommunityById(communityId: number): Promise<TeamCommunity> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }
    return community;
  }

  /**
   * 커뮤니티 상태를 업데이트합니다.
   * @param communityId - 업데이트할 커뮤니티 ID
   * @param newStatus - 변경할 새로운 상태
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns 업데이트된 TeamCommunity 객체
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
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

    // 요청 사용자가 이 커뮤니티의 팀장인지 확인 (권한 검증)
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
   * 특정 커뮤니티의 상세 정보를 업데이트합니다. (recruiting, title, content, maxMembers 등)
   * @param communityId - 업데이트할 커뮤니티 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @param updateData - 업데이트할 데이터 (Partial<TeamCommunity> 타입)
   * @returns 업데이트된 TeamCommunity 객체
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
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
      throw new CustomError(404, "Community not found.");
    }

    // 요청 사용자가 이 커뮤니티의 팀장인지 확인 (권한 검증)
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
      // postRepository.update는 postId와 updateData를 받습니다.
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
   * @returns void (성공 시 아무것도 반환하지 않음)
   * @throws CustomError 커뮤니티를 찾을 수 없을 때, 팀장이 아닐 때, 또는 삭제 실패 시
   */
  public async deleteCommunity(
    communityId: number,
    requestingUserId: number
  ): Promise<void> {
    // 반환 타입을 Promise<void>로 변경
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found.");
    }

    // 요청하는 사용자가 해당 커뮤니티의 팀장인지 확인
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

    // 커뮤니티 삭제 (레포지토리에서 삭제된 레코드 수를 반환하지 않는다고 가정)
    // 만약 레포지토리의 delete 메서드가 삭제된 레코드 수를 반환한다면,
    // 여기서 그 값을 확인하여 0일 경우 CustomError를 던질 수 있습니다.
    try {
      await this.communityRepository.delete(communityId);
    } catch (error) {
      // Prisma NotFoundError 등을 CustomError로 변환하여 던질 수 있습니다.
      // 여기서는 레포지토리에서 다른 예상치 못한 에러가 발생하면 그대로 next로 전달합니다.
      throw error;
    }

    // TODO: 관련 신청 정보도 삭제 (필요하다면 ApplicationRepository에 추가)
    // await this.applicationRepository.deleteManyByCommunityId(communityId);
    // 이 부분은 `applications.service.ts`의 `cancelRecruitment`에서 이미 처리되고 있습니다.
    // 만약 `deleteCommunity`가 `cancelRecruitment`의 일부가 아니라 독립적인 기능이라면,
    // 여기서도 `applicationRepository.deleteRecruitment(community.postId)`와
    // `postRepository.delete(community.postId)`를 호출해야 합니다.
    // 현재는 `cancelRecruitment`가 더 포괄적인 삭제를 수행하므로,
    // `deleteCommunity`는 `TeamCommunity`만 삭제하는 것으로 가정하고 `void`를 반환합니다.
    // 만약 `deleteCommunity`가 모든 관련 데이터를 삭제해야 한다면, `cancelRecruitment` 로직을 여기에 통합해야 합니다.
    // 현재는 `cancelRecruitment`와 중복될 수 있으므로, 여기서는 `TeamCommunity`만 삭제합니다.
  }
}
