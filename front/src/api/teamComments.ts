// src/api/teamComments.ts

import apiClient from "./apiClient";
import type { TeamComment } from "../types";

// =========================================================
// 팀 게시물 댓글 관련 API
// =========================================================
export const fetchTeamComments = async (
  communityId: string,
  teamPostId: number
) => {
  try {
    // 백엔드 라우트 형식에 맞춰 URL 변경: communityId와 teamPostId를 경로 파라미터로 사용
    const response = await apiClient.get(
      `/mypage/communities/team-posts/${teamPostId}/comments?communityId=${communityId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching team comments for community ${communityId}, post ${teamPostId}:`,
      error
    );
    throw error;
  }
};

export const createTeamComment = async (
  communityId: string,
  teamPostId: number,
  userId: number,
  content: string,
  parentId: number | null // ✨ 수정: parentId 타입을 number | null로 변경 ✨
): Promise<TeamComment> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: TeamComment;
      teamCommentId: number;
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

export const updateTeamComment = async (
  // ✨ export 추가 ✨
  communityId: string,
  teamCommentId: number,
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

export const deleteTeamComment = async (
  // ✨ export 추가 ✨
  communityId: string,
  teamPostId: number,
  teamCommentId: number,
  userId: number
): Promise<void> => {
  try {
    await apiClient.delete(
      `/team-comments/${teamCommentId}?communityId=${communityId}&teamPostId=${teamPostId}`,
      { data: { userId } }
    );
  } catch (error) {
    console.error("Failed to delete team comment:", error);
    throw error;
  }
};
