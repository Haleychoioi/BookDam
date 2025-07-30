// src/services/team-posts.service.ts

import { TeamPostRepository } from "../repositories/team-posts.repository";
import { CommunityRepository } from "../repositories/communities.repository"; // 커뮤니티 존재 여부 확인
import { TeamMemberRepository } from "../repositories/team-members.repository"; // 실제 TeamMemberRepository를 import합니다.
import { TeamPost, TeamPostType, TeamRole } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

export class TeamPostService {
  private teamPostRepository: TeamPostRepository;
  private communityRepository: CommunityRepository;
  private teamMemberRepository: TeamMemberRepository; // 실제 레포지토리 사용

  constructor() {
    this.teamPostRepository = new TeamPostRepository();
    this.communityRepository = new CommunityRepository();
    this.teamMemberRepository = new TeamMemberRepository(); // 실제 레포지토리 인스턴스 생성
  }

  /**
   * 특정 커뮤니티의 게시물 목록을 조회합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param query - 페이지네이션 및 정렬 옵션
   * @param requestingUserId - 요청하는 사용자 ID (팀 멤버만 조회 가능)
   * @returns TeamPost 배열
   * @throws CustomError 커뮤니티를 찾을 수 없을 때, 권한이 없을 때, 게시물이 없을 때
   */
  public async findAllTeamPosts(
    communityId: number,
    query: { page?: number; pageSize?: number; sort?: string },
    requestingUserId: number
  ): Promise<TeamPost[]> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    // 조회 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember) {
      throw new CustomError(
        403,
        "Unauthorized: You are not a member of this team."
      );
    }

    const teamPosts = await this.teamPostRepository.findManyByCommunityId(
      communityId,
      query
    );

    if (!teamPosts || teamPosts.length === 0) {
      // 게시물이 없는 경우 404 에러를 던지도록 변경
      throw new CustomError(404, "No team posts found for this community.");
    }

    return teamPosts;
  }

  /**
   * 특정 커뮤니티에 게시물을 작성합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param postData - 작성할 게시물 데이터 { userId, title, content, type? }
   * @returns 생성된 TeamPost 객체
   * @throws CustomError 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async createTeamPost(
    communityId: number,
    postData: {
      userId: number;
      title: string;
      content: string;
      type?: TeamPostType;
    }
  ): Promise<TeamPost> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new CustomError(404, "Community not found");
    }

    // 작성 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      postData.userId,
      communityId
    );
    if (!teamMember) {
      throw new CustomError(
        403,
        "Unauthorized: You are not a member of this team."
      );
    }

    // 공지(NOTICE) 타입 게시물은 팀장만 작성 가능
    if (
      postData.type === TeamPostType.NOTICE &&
      teamMember.role !== TeamRole.LEADER
    ) {
      throw new CustomError(
        403,
        "Unauthorized: Only the team leader can create notice posts."
      );
    }

    const newTeamPost = await this.teamPostRepository.create(
      communityId,
      postData
    );
    return newTeamPost;
  }

  /**
   * 특정 팀 게시물을 수정합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param teamPostId - 수정할 팀 게시물 ID
   * @param userId - 요청하는 사용자 ID (권한 확인용)
   * @param updateData - 업데이트할 데이터 { title?, content? }
   * @returns 업데이트된 TeamPost 객체
   * @throws CustomError 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateTeamPost(
    communityId: number,
    teamPostId: number,
    userId: number, // userId를 별도 인자로 받음
    updateData: { title?: string; content?: string } // updateData 타입 변경
  ): Promise<TeamPost> {
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    // 게시물이 없거나, 해당 커뮤니티에 속하지 않으면 에러
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자이거나 팀장인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId, // userId 인자 사용
      communityId
    );
    if (
      !teamMember ||
      (existingPost.userId !== userId && teamMember.role !== TeamRole.LEADER)
    ) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own team posts or be a team leader."
      );
    }

    // 레포지토리의 update 메서드에 updateData 객체 전달
    const updatedTeamPost = await this.teamPostRepository.update(
      communityId,
      teamPostId,
      updateData // 변경된 updateData 객체 전달
    );
    return updatedTeamPost;
  }

  /**
   * 특정 팀 게시물을 삭제합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param teamPostId - 삭제할 팀 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns void (성공 시 아무것도 반환하지 않음)
   * @throws CustomError 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deleteTeamPost(
    communityId: number,
    teamPostId: number,
    requestingUserId: number
  ): Promise<void> {
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    // 게시물이 없거나, 해당 커뮤니티에 속하지 않으면 에러
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 삭제 권한 확인: 요청하는 userId가 게시물 작성자이거나 팀장인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (
      !teamMember ||
      (existingPost.userId !== requestingUserId &&
        teamMember.role !== TeamRole.LEADER)
    ) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own team posts or be a team leader."
      );
    }

    // 레포지토리의 delete 메서드를 호출합니다.
    // Prisma의 delete는 해당 레코드를 찾을 수 없으면 NotFoundError를 던지므로,
    // 여기서 별도의 deletedCount 확인은 필요 없습니다.
    try {
      await this.teamPostRepository.delete(communityId, teamPostId);
    } catch (error) {
      // Prisma NotFoundError 등을 CustomError로 변환하여 던질 수 있습니다.
      // 여기서는 레포지토리에서 NotFoundError를 던질 경우를 대비하여 catch합니다.
      // (레포지토리의 delete 메서드에 where 절이 있으므로, 여기서 이미 검증된 상태입니다.)
      // 만약 레포지토리에서 다른 예상치 못한 에러가 발생하면 그대로 next로 전달합니다.
      throw error;
    }
    // 성공 시 아무것도 반환하지 않습니다 (void)
  }

  /**
   * 특정 팀 게시물의 상세 정보를 조회합니다.
   * @param communityId - 팀 커뮤니티 ID (게시물 소속 확인용)
   * @param teamPostId - 조회할 팀 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀 멤버만 조회 가능)
   * @returns TeamPost 객체
   * @throws CustomError 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async findTeamPostById(
    communityId: number, // communityId 인자 추가
    teamPostId: number,
    requestingUserId: number
  ): Promise<TeamPost> {
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    // 게시물이 없거나, 해당 커뮤니티에 속하지 않으면 에러
    if (!teamPost || teamPost.teamId !== communityId) {
      // communityId 검증 추가
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 조회 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      teamPost.teamId
    );
    if (!teamMember) {
      throw new CustomError(
        403,
        "Unauthorized: You are not a member of this team."
      );
    }

    return teamPost;
  }
}
