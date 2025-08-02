// src/services/team-comments.service.ts

import { TeamCommentRepository } from "../repositories/team-comments.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { TeamComment, TeamRole } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

export class TeamCommentService {
  private teamCommentRepository: TeamCommentRepository;
  private teamPostRepository: TeamPostRepository;
  private teamMemberRepository: TeamMemberRepository;

  constructor() {
    this.teamCommentRepository = new TeamCommentRepository();
    this.teamPostRepository = new TeamPostRepository();
    this.teamMemberRepository = new TeamMemberRepository();
  }

  /**
   * 새 팀 댓글 생성 (대댓글 포함)
   * @param communityId
   * @param teamPostId
   * @param userId
   * @param content
   * @param parentId
   * @returns
   * @throws
   */
  public async createTeamComment(
    communityId: number,
    teamPostId: number,
    userId: number,
    content: string,
    parentId?: number
  ): Promise<TeamComment> {
    // 1. 팀 게시물 존재 여부 확인 및 커뮤니티 소속 확인
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost || teamPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 2. 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId
    );
    if (!teamMember) {
      throw new CustomError(
        403,
        "Unauthorized: You are not a member of this team."
      );
    }

    // 3. 부모 댓글이 지정된 경우, 부모 댓글이 존재하는지 확인 및 해당 게시물에 속하는지 확인
    if (parentId) {
      const parentComment = await this.teamCommentRepository.findById(parentId);
      if (!parentComment || parentComment.teamPostId !== teamPostId) {
        throw new CustomError(
          400,
          "Parent comment not found or does not belong to this post."
        );
      }
    }

    const newComment = await this.teamCommentRepository.create({
      teamPostId,
      userId,
      content,
      parentId,
    });

    return newComment;
  }

  /**
   * 특정 팀 게시물의 댓글 목록 조회 (최상위 댓글 및 1단계 대댓글 포함)
   * @param communityId
   * @param teamPostId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async findTeamComments(
    communityId: number,
    teamPostId: number,
    requestingUserId: number
  ): Promise<
    (TeamComment & {
      user: { nickname: string } | null;
      replies: (TeamComment & { user: { nickname: string } | null })[];
    })[]
  > {
    // 1. 팀 게시물 존재 여부 확인 및 커뮤니티 소속 확인
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost || teamPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 2. 요청하는 사용자가 해당 팀의 멤버인지 확인
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

    // 레포지토리에서 닉네임과 대댓글을 포함하여 가져오므로, 반환 타입 업데이트
    const comments = await this.teamCommentRepository.findByTeamPostId(
      teamPostId
    );
    return comments;
  }

  /**
   * 특정 팀 댓글 수정
   * @param communityId
   * @param teamCommentId
   * @param userId
   * @param content
   * @returns
   * @throws
   */
  public async updateTeamComment(
    communityId: number,
    teamCommentId: number,
    userId: number,
    content: string
  ): Promise<TeamComment> {
    // 1. 댓글 존재 여부 확인
    const existingComment = await this.teamCommentRepository.findById(
      teamCommentId
    );

    if (!existingComment) {
      throw new CustomError(404, "Comment not found.");
    }

    // 2. 댓글이 속한 게시물 확인 및 커뮤니티 소속 확인
    const teamPost = await this.teamPostRepository.findById(
      existingComment.teamPostId
    );
    // teamPost가 null이거나 teamId(communityId)가 일치하지 않으면 에러
    if (!teamPost || teamPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Associated team post not found or does not belong to this community."
      );
    }

    // 3. 수정 권한 확인: 요청하는 userId가 댓글 작성자이거나 팀장인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId
    );

    if (
      !teamMember ||
      (existingComment.userId !== userId && teamMember.role !== TeamRole.LEADER)
    ) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own comments or be a team leader."
      );
    }

    const updatedComment = await this.teamCommentRepository.update(
      teamCommentId,
      content
    );
    return updatedComment;
  }

  /**
   * 특정 팀 댓글 삭제
   * @param communityId
   * @param teamPostId
   * @param teamCommentId
   * @param userId
   * @returns
   * @throws
   */
  public async deleteTeamComment(
    communityId: number,
    teamPostId: number,
    teamCommentId: number,
    userId: number
  ): Promise<number> {
    // 1. 댓글 존재 여부 확인
    const existingComment = await this.teamCommentRepository.findById(
      teamCommentId
    );

    if (!existingComment) {
      throw new CustomError(404, "Comment not found.");
    }

    // 2. 댓글이 속한 팀 게시물 존재 여부 및 커뮤니티/게시물 소속 확인
    // 컨트롤러에서 받은 teamPostId와 댓글의 teamPostId가 일치하는지 확인
    if (existingComment.teamPostId !== teamPostId) {
      throw new CustomError(
        400,
        "Comment does not belong to the specified team post."
      );
    }

    const teamPost = await this.teamPostRepository.findById(
      existingComment.teamPostId
    );
    if (!teamPost || teamPost.teamId !== communityId) {
      throw new CustomError(
        404,
        "Associated team post not found or does not belong to this community/post."
      );
    }

    // 3. 삭제 권한 확인: 요청하는 userId가 댓글 작성자이거나 팀장인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId
    );

    if (
      !teamMember ||
      (existingComment.userId !== userId && teamMember.role !== TeamRole.LEADER)
    ) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own comments or be a team leader."
      );
    }

    // 4. 레포지토리의 delete 메서드가 삭제된 레코드 수를 반환하도록 변경되었으므로, 그 값을 그대로 반환합니다.
    const deletedCount = await this.teamCommentRepository.delete(teamCommentId);

    if (deletedCount === 0) {
      throw new CustomError(
        404,
        "Failed to delete comment: Comment not found or already deleted."
      );
    }

    return deletedCount;
  }
}
