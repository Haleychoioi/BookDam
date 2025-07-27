// src/services/team-comments.service.ts

import { TeamCommentRepository } from "../repositories/team-comments.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository"; // 실제 TeamMemberRepository를 import합니다.
import { TeamComment, TeamRole } from "@prisma/client";

export class TeamCommentService {
  private teamCommentRepository: TeamCommentRepository;
  private teamPostRepository: TeamPostRepository;
  private teamMemberRepository: TeamMemberRepository; // 실제 레포지토리 사용

  constructor() {
    this.teamCommentRepository = new TeamCommentRepository();
    this.teamPostRepository = new TeamPostRepository();
    this.teamMemberRepository = new TeamMemberRepository(); // 실제 레포지토리 인스턴스 생성
  }

  /**
   * 새 댓글을 생성합니다.
   * @param commentData - 댓글 데이터 { teamPostId, userId, content, parentId? }
   * @returns 생성된 TeamComment 객체
   * @throws Error 게시물을 찾을 수 없을 때, 사용자가 팀 멤버가 아닐 때, 부모 댓글을 찾을 수 없을 때
   */
  public async createComment(commentData: {
    // 메서드 이름 변경: createTeamComment -> createComment
    teamPostId: number; // 컨트롤러에서 객체 안에 teamPostId를 포함하여 전달하므로, 여기에 명시
    userId: number;
    content: string;
    parentId?: number;
  }): Promise<TeamComment> {
    const { teamPostId, userId, content, parentId } = commentData; // 객체에서 직접 구조 분해 할당

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

    // 3. 부모 댓글이 지정된 경우, 부모 댓글이 존재하는지 확인
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
      parentId,
    });

    return newComment;
  }

  /**
   * 특정 팀 게시물의 댓글 목록을 조회합니다.
   * @param teamPostId - 팀 게시물 ID
   * @returns TeamComment 배열
   * @throws Error 게시물을 찾을 수 없을 때
   */
  public async findCommentsByTeamPostId(
    // 메서드 이름 변경: findTeamCommentsByTeamPost -> findCommentsByTeamPostId
    teamPostId: number
    // 컨트롤러에서 query 및 requestingUserId를 전달하지 않으므로, 서비스 시그니처에서 제거
    // 만약 권한 확인이 필요하다면, 컨트롤러에서 requestingUserId를 전달하도록 수정해야 함
  ): Promise<TeamComment[]> {
    const teamPost = await this.teamPostRepository.findById(teamPostId);
    if (!teamPost) {
      throw new Error("Team Post not found.");
    }

    // NOTE: 댓글 목록 조회 시 권한 확인 로직은 현재 컨트롤러에서 requestingUserId를 전달하지 않으므로,
    // 필요하다면 컨트롤러에서 teamPost.teamId를 사용하여 팀 멤버 여부를 확인 후 호출해야 합니다.
    // 현재는 게시물 존재 여부만 확인합니다.

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
    // 메서드 이름 변경: updateTeamComment -> updateComment
    teamCommentId: number,
    userId: number, // updateData 객체 대신 userId와 content를 직접 받음
    content: string
  ): Promise<TeamComment> {
    const existingComment = await this.teamCommentRepository.findById(
      teamCommentId
    );

    if (!existingComment) {
      throw new Error("Comment not found.");
    }

    // 수정 권한 확인: 요청하는 userId가 댓글 작성자이거나 팀장인지 확인
    // 팀 게시물 ID를 통해 팀 ID를 가져와서 팀 멤버 역할을 확인
    const teamPost = await this.teamPostRepository.findById(
      existingComment.teamPostId
    );
    if (!teamPost) {
      // 이 경우는 거의 없겠지만, 데이터 불일치 시를 대비
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
    // 메서드 이름 변경: deleteTeamComment -> deleteComment, 반환 타입 Promise<void> -> Promise<number>
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

    await this.teamCommentRepository.delete(teamCommentId);
    return 1; // 성공적으로 삭제되었음을 의미하는 1 반환
  }
}
