// src/services/team-comments.service.ts

import { TeamCommentRepository } from "../repositories/team-comments.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { TeamComment, TeamRole } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

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
   * 새 팀 댓글을 생성합니다. (대댓글 포함)
   * @param communityId - 댓글이 속할 커뮤니티의 ID
   * @param teamPostId - 댓글이 속할 팀 게시물의 ID
   * @param userId - 댓글 작성자의 ID
   * @param content - 댓글 내용
   * @param parentId - 부모 댓글의 ID (대댓글인 경우)
   * @returns 생성된 TeamComment 객체
   * @throws CustomError 게시물을 찾을 수 없을 때, 사용자가 팀 멤버가 아닐 때, 부모 댓글을 찾을 수 없을 때
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
    // teamPost가 null이거나 teamId(communityId)가 일치하지 않으면 에러
    if (!teamPost || teamPost.teamId !== communityId) {
      // teamPost.communityId -> teamPost.teamId로 수정
      throw new CustomError(
        404,
        "Team Post not found or does not belong to this community."
      );
    }

    // 2. 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId // 게시물이 속한 팀 ID 사용
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
      parentId, // parentId를 레포지토리로 전달
    });

    return newComment;
  }

  /**
   * 특정 팀 게시물의 댓글 목록을 조회합니다. (최상위 댓글 및 1단계 대댓글 포함)
   * @param communityId - 커뮤니티 ID (게시물 소속 확인용)
   * @param teamPostId - 팀 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (팀 멤버십 확인용)
   * @returns TeamComment 배열 (작성자 닉네임 및 대댓글 포함)
   * @throws CustomError 게시물을 찾을 수 없을 때, 사용자가 팀 멤버가 아닐 때
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
    // teamPost가 null이거나 teamId(communityId)가 일치하지 않으면 에러
    if (!teamPost || teamPost.teamId !== communityId) {
      // teamPost.communityId -> teamPost.teamId로 수정
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
   * 특정 팀 댓글을 수정합니다.
   * @param communityId - 커뮤니티 ID (댓글이 속한 게시물의 커뮤니티 확인용)
   * @param teamCommentId - 업데이트할 팀 댓글 ID
   * @param userId - 요청하는 사용자 ID (권한 확인용)
   * @param content - 업데이트할 내용
   * @returns 업데이트된 TeamComment 객체
   * @throws CustomError 댓글을 찾을 수 없을 때 또는 권한이 없을 때
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
      // teamPost.communityId -> teamPost.teamId로 수정
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
   * 특정 팀 댓글을 삭제합니다.
   * @param communityId - 커뮤니티 ID (댓글이 속한 게시물의 커뮤니티 확인용)
   * @param teamPostId - 팀 게시물 ID (댓글이 해당 게시물에 속하는지 확인용)
   * @param teamCommentId - 삭제할 팀 댓글 ID
   * @param userId - 요청하는 사용자 ID (권한 확인용)
   * @returns 삭제된 레코드의 수 (성공 시 1, 실패 시 0)
   * @throws CustomError 댓글을 찾을 수 없을 때, 권한이 없을 때
   */
  public async deleteTeamComment(
    communityId: number,
    teamPostId: number, // 컨트롤러에서 body로 받은 teamPostId
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
    // teamPost가 null이거나 teamId(communityId)가 일치하지 않으면 에러
    if (!teamPost || teamPost.teamId !== communityId) {
      // teamPost.communityId -> teamPost.teamId로 수정
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

    // 삭제된 레코드가 0이면 (찾을 수 없거나 이미 삭제된 경우)
    if (deletedCount === 0) {
      throw new CustomError(
        404,
        "Failed to delete comment: Comment not found or already deleted."
      );
    }

    return deletedCount;
  }
}
