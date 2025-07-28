// src/services/team-posts.service.ts

import { TeamPostRepository } from "../repositories/team-posts.repository";
import { CommunityRepository } from "../repositories/communities.repository"; // 커뮤니티 존재 여부 확인
import { TeamMemberRepository } from "../repositories/team-members.repository"; // 실제 TeamMemberRepository를 import합니다.
import { TeamPost, TeamPostType, TeamRole } from "@prisma/client";

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
   * @throws Error 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async findAllTeamPosts(
    communityId: number,
    query: { page?: number; pageSize?: number; sort?: string },
    requestingUserId: number
  ): Promise<TeamPost[]> {
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    // 조회 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      communityId
    );
    if (!teamMember) {
      throw new Error("Unauthorized: You are not a member of this team.");
    }

    const teamPosts = await this.teamPostRepository.findManyByCommunityId(
      communityId,
      query
    );
    return teamPosts;
  }

  /**
   * 특정 커뮤니티에 게시물을 작성합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param postData - 작성할 게시물 데이터 { userId, title, content, type? }
   * @returns 생성된 TeamPost 객체
   * @throws Error 커뮤니티를 찾을 수 없을 때 또는 권한이 없을 때
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
      throw new Error("Community not found");
    }

    // 작성 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      postData.userId,
      communityId
    );
    if (!teamMember) {
      throw new Error("Unauthorized: You are not a member of this team.");
    }

    // 공지(NOTICE) 타입 게시물은 팀장만 작성 가능
    if (
      postData.type === TeamPostType.NOTICE &&
      teamMember.role !== TeamRole.LEADER
    ) {
      throw new Error(
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
   * @param updateData - 업데이트할 데이터 { title?, content?, userId } (userId는 권한 확인용)
   * @returns 업데이트된 TeamPost 객체
   * @throws Error 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateTeamPost(
    communityId: number,
    teamPostId: number,
    updateData: { title?: string; content?: string; userId: number }
  ): Promise<TeamPost> {
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new Error("Team Post not found in this community");
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자이거나 팀장인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      updateData.userId,
      communityId
    );
    if (
      !teamMember ||
      (existingPost.userId !== updateData.userId &&
        teamMember.role !== TeamRole.LEADER)
    ) {
      throw new Error(
        "Unauthorized: You can only update your own posts or be a team leader."
      );
    }

    const updatedTeamPost = await this.teamPostRepository.update(
      communityId,
      teamPostId,
      updateData
    );
    return updatedTeamPost;
  }

  /**
   * 특정 팀 게시물을 삭제합니다.
   * @param communityId - 팀 커뮤니티 ID
   * @param teamPostId - 삭제할 팀 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns 삭제된 레코드의 수 (성공 시 1, 실패 시 0)
   * @throws Error 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deleteTeamPost(
    communityId: number,
    teamPostId: number,
    requestingUserId: number
  ): Promise<number> {
    // 반환 타입을 Promise<number>로 변경
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new Error("Team Post not found in this community");
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
      throw new Error(
        "Unauthorized: You can only delete your own posts or be a team leader."
      );
    }

    // 레포지토리의 delete 메서드를 호출하고, 성공적으로 삭제되었다면 1을 반환
    await this.teamPostRepository.delete(communityId, teamPostId);
    return 1; // 성공적으로 삭제되었음을 의미하는 1 반환
  }

  /**
   * 특정 팀 게시물의 상세 정보를 조회합니다.
   * @param teamPostId - 조회할 팀 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀 멤버만 조회 가능)
   * @returns TeamPost 객체
   * @throws Error 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async findTeamPostById(
    teamPostId: number,
    requestingUserId: number
  ): Promise<TeamPost> {
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost) {
      throw new Error("Team Post not found");
    }

    // 조회 권한 확인: 요청하는 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      requestingUserId,
      teamPost.teamId
    );
    if (!teamMember) {
      throw new Error("Unauthorized: You are not a member of this team.");
    }

    return teamPost;
  }
}
