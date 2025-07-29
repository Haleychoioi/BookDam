// src/services/team-comments.service.ts

import { TeamCommentRepository } from "../repositories/team-comments.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { TeamComment, TeamRole } from "@prisma/client";

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
   * 새 댓글을 생성합니다. (대댓글 포함)
   * @param commentData - 댓글 데이터 { teamPostId, userId, content, parentId? }
   * @returns 생성된 TeamComment 객체
   * @throws Error 게시물을 찾을 수 없을 때, 사용자가 팀 멤버가 아닐 때, 부모 댓글을 찾을 수 없을 때
   */
  public async createComment(commentData: {
    teamPostId: number;
    userId: number;
    content: string;
    parentId?: number; // 대댓글을 위한 parentId 필드
  }): Promise<TeamComment> {
    const { teamPostId, userId, content, parentId } = commentData;

    // 1. 팀 게시물 존재 여부 확인
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost) {
      throw new Error("Team Post not found.");
    }

    // 2. 사용자가 해당 팀의 멤버인지 확인
    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId // 게시물이 속한 팀 ID 사용
    );
    if (!teamMember) {
      throw new Error("Unauthorized: You are not a member of this team.");
    }

    // 3. 부모 댓글이 지정된 경우, 부모 댓글이 존재하는지 확인 및 해당 게시물에 속하는지 확인
    if (parentId) {
      const parentComment = await this.teamCommentRepository.findById(parentId);
      if (!parentComment || parentComment.teamPostId !== teamPostId) {
        throw new Error(
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
   * @param teamPostId - 팀 게시물 ID
   * @returns TeamComment 배열 (작성자 닉네임 및 대댓글 포함)
   * @throws Error 게시물을 찾을 수 없을 때
   */
  public async findCommentsByTeamPostId(
    teamPostId: number
  ): Promise<
    (TeamComment & {
      user: { nickname: string } | null;
      replies: (TeamComment & { user: { nickname: string } | null })[];
    })[]
  > {
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost) {
      throw new Error("Team Post not found.");
    }

    // 레포지토리에서 닉네임과 대댓글을 포함하여 가져오므로, 반환 타입 업데이트
    const comments = await this.teamCommentRepository.findByTeamPostId(
      teamPostId
    );
    return comments;
  }

  /**
   * 특정 댓글을 수정합니다.
   * @param teamCommentId - 업데이트할 팀 댓글 ID
   * @param userId - 요청하는 사용자 ID (권한 확인용)
   * @param content - 업데이트할 내용
   * @returns 업데이트된 TeamComment 객체
   * @throws Error 댓글을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updateComment(
    teamCommentId: number,
    userId: number,
    content: string
  ): Promise<TeamComment> {
    const existingComment = await this.teamCommentRepository.findById(
      teamCommentId
    );

    if (!existingComment) {
      throw new Error("Comment not found.");
    }

    // 수정 권한 확인: 요청하는 userId가 댓글 작성자이거나 팀장인지 확인
    const teamPost = await this.teamPostRepository.findById(
      existingComment.teamPostId
    );
    if (!teamPost) {
      throw new Error("Associated team post not found for this comment.");
    }

    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId
    );

    if (
      !teamMember ||
      (existingComment.userId !== userId && teamMember.role !== TeamRole.LEADER)
    ) {
      throw new Error(
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
   * 특정 댓글을 삭제합니다.
   * @param teamCommentId - 삭제할 팀 댓글 ID
   * @param userId - 요청하는 사용자 ID (권한 확인용)
   * @returns 삭제된 레코드의 수 (성공 시 1, 실패 시 0)
   * @throws Error 댓글을 찾을 수 없을 때, 권한이 없을 때
   */
  public async deleteComment(
    teamCommentId: number,
    userId: number
  ): Promise<number> {
    const existingComment = await this.teamCommentRepository.findById(
      teamCommentId
    );

    if (!existingComment) {
      throw new Error("Comment not found.");
    }

    // 삭제 권한 확인: 요청하는 userId가 댓글 작성자이거나 팀장인지 확인
    const teamPost = await this.teamPostRepository.findById(
      existingComment.teamPostId
    );
    if (!teamPost) {
      throw new Error("Associated team post not found for this comment.");
    }

    const teamMember = await this.teamMemberRepository.findByUserIdAndTeamId(
      userId,
      teamPost.teamId
    );

    if (
      !teamMember ||
      (existingComment.userId !== userId && teamMember.role !== TeamRole.LEADER)
    ) {
      throw new Error(
        "Unauthorized: You can only delete your own comments or be a team leader."
      );
    }

    // 레포지토리의 delete 메서드가 삭제된 레코드 수를 반환하도록 변경되었으므로, 그 값을 그대로 반환합니다.
    const deletedCount = await this.teamCommentRepository.delete(teamCommentId);
    return deletedCount;
  }
}
