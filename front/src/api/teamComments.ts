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
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: TeamComment[];
    }>(
      `/mypage/communities/team-posts/${teamPostId}/comments?communityId=${communityId}`
    );
    return response.data.data;
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
  parentId: number | null
): Promise<TeamComment> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: TeamComment;
      teamCommentId: number;
    }>(
      `/mypage/communities/team-posts/${teamPostId}/comments?communityId=${communityId}`,
      {
        userId,
        content,
        parentId,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to create team comment:", error);
    throw error;
  }
};

export const updateTeamComment = async (
  communityId: string,
  teamCommentId: number,
  content: string
): Promise<void> => {
  try {
    await apiClient.put(
      `/mypage/communities/team-comments/${teamCommentId}?communityId=${communityId}`,
      { content }
    );
  } catch (error) {
    console.error("Failed to update team comment:", error);
    throw error;
  }
};

export const deleteTeamComment = async (
  communityId: string,
  teamPostId: number,
  teamCommentId: number,
  userId: number
): Promise<void> => {
  try {
    await apiClient.delete(
      `/mypage/communities/team-comments/${teamCommentId}?communityId=${communityId}&teamPostId=${teamPostId}`,
      { data: { userId } }
    );
  } catch (error) {
    console.error("Failed to delete team comment:", error);
    throw error;
  }
};
