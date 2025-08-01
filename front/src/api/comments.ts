// src/api/comments.ts

import apiClient from "./apiClient";
import type { Comment } from "../types"; // Comment 타입 임포트

// =========================================================
// 일반 게시물 댓글 관련 API
// =========================================================

/**
 * 특정 게시물의 댓글 목록을 조회합니다.
 * GET /api/posts/:postId/comments
 * @param postId - 게시물 ID
 * @param page - 페이지 번호 (선택 사항)
 * @param size - 페이지당 항목 수 (선택 사항)
 * @param sort - 정렬 기준 (선택 사항)
 * @returns 댓글 목록 배열
 */
export const fetchCommentsByPost = async (
  postId: string,
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

/**
 * 특정 게시물에 댓글 또는 대댓글을 작성합니다.
 * POST /api/posts/:postId/comments
 * @param postId - 게시물 ID
 * @param commentData - 댓글 데이터 { userId, content, parentId? }
 * @returns 생성된 댓글 객체
 */
export const createComment = async (
  postId: string,
  commentData: { userId: number; content: string; parentId: number | null } // ✨ 수정: parentId 타입을 number | null로 변경 ✨
): Promise<Comment> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      commentId: number;
    }>(`/posts/${postId}/comments`, commentData);

    // 생성 후 다시 조회하여 완전한 Comment 객체 반환
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
/**
 * 특정 댓글을 수정합니다.
 * PUT /api/comments/:commentId
 * @param commentId - 수정할 댓글 ID
 * @param updateData - 업데이트할 데이터 { content, userId }
 * @returns void (성공 여부만 반환)
 */
export const updateComment = async (
  commentId: string,
  updateData: { content: string; userId: number }
): Promise<void> => {
  try {
    await apiClient.put(`/comments/${commentId}`, updateData);
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw error;
  }
};

/**
 * 특정 댓글을 삭제합니다.
 * DELETE /api/comments/:commentId
 * @param commentId - 삭제할 댓글 ID
 * @param userId - 삭제를 요청하는 사용자 ID (권한 확인용)
 * @returns void (성공 여부만 반환)
 */
export const deleteComment = async (
  commentId: string,
  userId: number
): Promise<void> => {
  try {
    // 백엔드가 userId를 쿼리 파라미터나 바디로 받지 않는다면, 인증 미들웨어를 통해 userId를 확인합니다.
    // 현재 백엔드 deleteComment 컨트롤러는 userId를 받습니다.
    await apiClient.delete(`/comments/${commentId}`, { data: { userId } }); // DELETE 요청에 body 전달
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};
