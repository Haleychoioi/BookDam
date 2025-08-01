// src/api/comments.ts

import apiClient from "./apiClient";
import type { Comment } from "../types";

// =========================================================
// 일반 게시물 댓글 관련 API
// =========================================================

export const fetchCommentsByPost = async (
  // ✨ export 추가 ✨
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
  commentData: { userId: number; content: string; parentId: number | null } // ✨ 수정: parentId 타입을 number | null로 변경 ✨
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
  // ✨ export 추가 ✨
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
  // ✨ export 추가 ✨
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
