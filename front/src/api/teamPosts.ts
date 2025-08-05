// src/api/teamPosts.ts

import apiClient from "./apiClient";
import type { TeamPost } from "../types";

// =========================================================
// 팀 게시물 관련 API
// =========================================================

/**
 * 특정 커뮤니티의 팀 게시물 목록을 조회합니다.
 * GET /api/communities/:communityId/posts
 * @param communityId - 팀 커뮤니티 ID
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @returns 팀 게시물 목록 배열
 */
export const fetchTeamPosts = async (
  communityId: string,
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<{ posts: TeamPost[]; totalResults: number }> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: TeamPost[];
    }>(
      `/mypage/communities/${communityId}/posts?page=${page}&size=${pageSize}&sort=${sort}`
    );

    return {
      posts: response.data.data,
      totalResults: response.data.data.length,
    };
  } catch (error) {
    console.error("Failed to fetch team posts:", error);
    throw error;
  }
};

/**
 * 새로운 팀 게시물을 생성합니다.
 * POST /api/communities/:communityId/posts/write
 * @param communityId - 팀 커뮤니티 ID
 * @param postData - 생성할 게시물 데이터 { title, content, type? }
 * @returns 생성된 게시물 ID
 */
export const createTeamPost = async (
  communityId: string,
  postData: { title: string; content: string; type?: string }
): Promise<string> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number;
    }>(`/mypage/communities/${communityId}/posts/write`, postData);
    return response.data.postId.toString();
  } catch (error) {
    console.error("Failed to create team post:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물 상세 정보를 조회합니다.
 * GET /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 팀 게시물 ID (number)
 * @returns TeamPost 객체
 */
export const fetchTeamPostById = async (
  communityId: string,
  teamPostId: number
): Promise<TeamPost> => {
  try {
    const response = await apiClient.get<{ message: string; data: TeamPost }>(
      `/mypage/communities/${communityId}/posts/${teamPostId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch team post by ID:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물을 수정합니다.
 * PUT /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 수정할 팀 게시물 ID (number)
 * @param updateData - 업데이트할 데이터 { title?, content? }
 */
export const updateTeamPost = async (
  communityId: string,
  teamPostId: number,
  updateData: { title?: string; content?: string }
): Promise<void> => {
  try {
    await apiClient.put(
      `/mypage/communities/${communityId}/posts/${teamPostId}`,
      updateData
    );
  } catch (error) {
    console.error("Failed to update team post:", error);
    throw error;
  }
};

/**
 * 특정 팀 게시물을 삭제합니다.
 * DELETE /api/communities/:communityId/posts/:teamPostId
 * @param communityId - 팀 커뮤니티 ID
 * @param teamPostId - 삭제할 팀 게시물 ID (number)
 */
export const deleteTeamPost = async (
  communityId: string,
  teamPostId: number
): Promise<void> => {
  try {
    await apiClient.delete(
      `/mypage/communities/${communityId}/posts/${teamPostId}`
    );
  } catch (error) {
    console.error("Failed to delete team post:", error);
    throw error;
  }
};
