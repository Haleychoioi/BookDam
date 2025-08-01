// src/api/posts.ts

import apiClient from "./apiClient";
import type { Post } from "../types"; // Post 타입 임포트

// =========================================================
// 일반 게시물 관련 API
// =========================================================

/**
 * 새로운 일반 게시물을 생성합니다.
 * POST /api/posts/write
 * @param postData - 생성할 게시물 데이터 { title, content }
 * @returns 생성된 게시물 ID
 */
export const createPost = async (postData: {
  title: string;
  content: string;
}): Promise<string> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number; // 백엔드는 postId를 number로 반환
    }>(`/posts/write`, postData);
    return response.data.postId.toString(); // ID를 string으로 변환
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
};

/**
 * 모든 일반 게시물 목록을 조회합니다. (일반 게시판용)
 * GET /api/posts
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @returns 게시물 목록 배열 및 총 결과 수
 */
export const fetchAllPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<{ posts: Post[]; totalResults: number }> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: Post[]; // 백엔드 응답 타입 명확화
    }>(`/posts?page=${page}&pageSize=${pageSize}&sort=${sort}`);

    return {
      posts: response.data.data,
      totalResults: response.data.data.length, // 백엔드에서 totalResults를 받지 않으므로 임시
    };
  } catch (error) {
    console.error("Failed to fetch all posts:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물 상세 정보를 조회합니다.
 * GET /api/posts/:postId
 * @param postId - 게시물 ID
 * @returns Post 객체
 */
export const fetchPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get<{ message: string; data: Post }>(
      `/posts/${postId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch post by ID:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물을 수정합니다.
 * PUT /api/posts/:postId
 * @param postId - 수정할 게시물 ID
 * @param updateData - 업데이트할 데이터 { title?, content? }
 */
export const updatePost = async (
  postId: string,
  updateData: { title?: string; content?: string }
): Promise<void> => {
  try {
    await apiClient.put(`/posts/${postId}`, updateData);
  } catch (error) {
    console.error("Failed to update post:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물을 삭제합니다.
 * DELETE /api/posts/:postId
 * @param postId - 삭제할 게시물 ID
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/posts/${postId}`);
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
};
