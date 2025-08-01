// src/api/teamComments.ts

import apiClient from "./apiClient";
import type { TeamComment } from "../types"; // TeamComment 타입 임포트

// =========================================================
// 팀 게시물 댓글 관련 API
// =========================================================

/**
 * 특정 팀 게시물의 댓글 목록을 조회합니다.
 * GET /api/team-posts/:teamPostId/comments
 * @param communityId - 댓글이 속한 커뮤니티 ID (쿼리 파라미터)
 * @param teamPostId - 팀 게시물 ID (URL 파라미터)
 * @returns 팀 댓글 목록 배열
 */
export const fetchTeamComments = async (
  communityId: string,
  teamPostId: string
): Promise<TeamComment[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: TeamComment[];
    }>(`/team-posts/${teamPostId}/comments?communityId=${communityId}`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch team comments:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물에 댓글 또는 대댓글을 작성합니다.
 * POST /api/team-posts/:teamPostId/comments
 * @param communityId - 댓글이 속한 커뮤니티 ID (쿼리 파라미터)
 * @param teamPostId - 팀 게시물 ID
 * @param userId - 작성자 사용자 ID
 * @param content - 댓글 내용
 * @param parentId - 부모 댓글 ID (대댓글인 경우)
 * @returns 생성된 팀 댓글 객체
 */
export const createTeamComment = async (
  communityId: string,
  teamPostId: string,
  userId: number,
  content: string,
  parentId: number | null // ✨ 수정: parentId 타입을 number | null로 변경 ✨
): Promise<TeamComment> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: TeamComment;
      teamCommentId: number; // 혹시 몰라 추가 (백엔드가 data에 객체를 직접 반환하면 필요 없음)
    }>(`/team-posts/${teamPostId}/comments?communityId=${communityId}`, {
      userId,
      content,
      parentId,
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create team comment:", error);
    throw error;
  }
};

/**
 * 특정 팀 댓글을 수정합니다.
 * PUT /api/team-comments/:teamCommentId
 * @param communityId - 댓글이 속한 커뮤니티 ID (쿼리 파라미터)
 * @param teamCommentId - 수정할 팀 댓글 ID
 * @param content - 업데이트할 댓글 내용
 * @returns void (성공 여부만 반환)
 */
export const updateTeamComment = async (
  communityId: string,
  teamCommentId: string,
  content: string
): Promise<void> => {
  try {
    await apiClient.put(
      `/team-comments/${teamCommentId}?communityId=${communityId}`,
      { content }
    );
  } catch (error) {
    console.error("Failed to update team comment:", error);
    throw error;
  }
};

/**
 * 특정 팀 댓글을 삭제합니다.
 * DELETE /api/team-comments/:teamCommentId
 * @param communityId - 댓글이 속한 커뮤니티 ID (쿼리 파라미터)
 * @param teamPostId - 댓글이 속한 팀 게시물 ID (쿼리 파라미터, 백엔드 로직에 따라 필요)
 * @param teamCommentId - 삭제할 팀 댓글 ID
 * @param userId - 삭제를 요청하는 사용자 ID (권한 확인용)
 * @returns void (성공 여부만 반환)
 */
export const deleteTeamComment = async (
  communityId: string,
  teamPostId: string, // 백엔드에서 필요로 함
  teamCommentId: number, // 백엔드 API 명세서에 따르면 number
  userId: number // 백엔드에서 필요로 함
): Promise<void> => {
  try {
    await apiClient.delete(
      `/team-comments/${teamCommentId}?communityId=${communityId}&teamPostId=${teamPostId}`,
      { data: { userId } } // DELETE 요청에 body 전달
    );
  } catch (error) {
    console.error("Failed to delete team comment:", error);
    throw error;
  }
};
