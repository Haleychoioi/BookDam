// src/api/comments.ts (수정된 전체 코드)

import apiClient from "./apiClient";
import type { Comment } from "../types"; // Comment 타입 임포트

// =========================================================
// 일반 게시물 댓글 관련 API
// =========================================================

export const fetchCommentsByPost = async (
  postId: number,
  page?: number,
  size?: number,
  sort?: string
): Promise<Comment[]> => {
  try {
    let url = `/posts/${postId}/comments`;
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (size) params.append("size", size.toString());
    if (sort) params.append("sort", sort);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiClient.get<{
      message: string;
      data: Comment[];
    }>(url);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch comments by post:", error);
    throw error;
  }
};

export const createComment = async (
  postId: number,
  commentData: { userId: number; content: string; parentId: number | null }
): Promise<Comment> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      commentId: number;
    }>(`/posts/${postId}/comments`, commentData);

    const fetchedComment = await apiClient.get<{
      status: string;
      message: string;
      data: Comment;
    }>(`/comments/${response.data.commentId}`);
    return fetchedComment.data.data;
  } catch (error) {
    console.error("Failed to create comment:", error);
    throw error;
  }
};

export const updateComment = async (
  commentId: number,
  updateData: { content: string; userId: number }
): Promise<void> => {
  try {
    await apiClient.put(`/comments/${commentId}`, updateData);
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw error;
  }
};

export const deleteComment = async (
  commentId: number,
  userId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/comments/${commentId}`, { data: { userId } });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};

// =========================================================
// 마이페이지 - 내가 작성한 댓글 관련 API (✨ 새로 추가 ✨)
// =========================================================

export interface MyCommentsResponse {
  // ✨ 새로 추가 ✨
  comments: Comment[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const fetchMyComments = async (
  // ✨ 새로 추가 ✨
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<MyCommentsResponse> => {
  try {
    const response = await apiClient.get<MyCommentsResponse>(
      `/mypage/my-comments`,
      {
        params: { page, size: pageSize, sort },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my comments:", error);
    throw error;
  }
};
