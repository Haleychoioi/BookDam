import { TeamPostRepository } from "../repositories/team-posts.repository";
import { CommunityRepository } from "../repositories/communities.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { TeamPost, TeamPostType, TeamRole } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

export class TeamPostService {
  private teamPostRepository: TeamPostRepository;
  private communityRepository: CommunityRepository;
  private teamMemberRepository: TeamMemberRepository;

  constructor() {
    this.teamPostRepository = new TeamPostRepository();
    this.communityRepository = new CommunityRepository();
    this.teamMemberRepository = new TeamMemberRepository();
  }

  /**
   * 특정 커뮤니티의 게시물 목록 조회
   * @param communityId
   * @param query
   * @param requestingUserId
   * @returns
   * @throws
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
      return [];
    }

    return teamPosts;
  }

  /**
   * 특정 커뮤니티에 게시물 작성
   * @param communityId
   * @param postData
   * @returns
   * @throws
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
   * 특정 팀 게시물 수정
   * @param communityId
   * @param teamPostId
   * @param userId
   * @param updateData
   * @returns
   * @throws
   */
  public async updateTeamPost(
    communityId: number,
    teamPostId: number,
    userId: number,
    updateData: { title?: string; content?: string }
  ): Promise<TeamPost> {
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
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

    const updatedTeamPost = await this.teamPostRepository.update(
      communityId,
      teamPostId,
      updateData
    );
    return updatedTeamPost;
  }

  /**
   * 특정 팀 게시물 삭제
   * @param communityId
   * @param teamPostId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async deleteTeamPost(
    communityId: number,
    teamPostId: number,
    requestingUserId: number
  ): Promise<void> {
    const existingPost = await this.teamPostRepository.findById(teamPostId);
    if (!existingPost || existingPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

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

    try {
      await this.teamPostRepository.delete(communityId, teamPostId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 특정 팀 게시물의 상세 정보 조회
   * @param communityId
   * @param teamPostId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async findTeamPostById(
    communityId: number,
    teamPostId: number,
    requestingUserId: number
  ): Promise<TeamPost> {
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost || teamPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

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
