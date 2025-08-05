// src/api/posts.ts

import apiClient from "./apiClient";
import type { Post, TeamPost } from "../types";

// =========================================================
// 일반 게시물 관련 API
// =========================================================

export const createPost = async (postData: {
  title: string;
  content: string;
}): Promise<string> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      postId: number;
    }>(`/posts/write`, postData);
    return response.data.postId.toString();
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
 * @param type - 게시물 타입 필터 ('GENERAL', 'RECRUITMENT', 또는 undefined/null이면 전체)
 * @returns 게시물 목록 배열 및 총 결과 수
 */
export const fetchAllPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest",
  type?: "GENERAL" | "RECRUITMENT"
): Promise<{ posts: Post[]; totalResults: number }> => {
  try {
    let url = `/posts?page=${page}&pageSize=${pageSize}&sort=${sort}`;

    if (type) {
      url += `&type=${type}`;
    }

    const response = await apiClient.get<{
      message: string;
      data: Post[];
    }>(url);

    return {
      posts: response.data.data,
      totalResults: response.data.data.length,
    };
  } catch (error) {
    console.error("Failed to fetch all posts:", error);
    throw error;
  }
};

/**
 * 특정 일반 게시물 상세 정보를 조회합니다.
 * GET /api/posts/:postId
 * @param postId - 게시물 ID (number)
 * @returns Post 객체
 */
export const fetchPostById = async (postId: number): Promise<Post> => {
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
 * @param postId - 수정할 게시물 ID (number)
 * @param updateData - 업데이트할 데이터 { title?, content? }
 */
export const updatePost = async (
  postId: number,
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
 * @param postId - 삭제할 게시물 ID (number)
 * @param userId - 삭제를 요청하는 사용자 ID (권한 확인용)
 */
export const deletePost = async (
  postId: number,
  userId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/posts/${postId}`, { data: { userId } });
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
};

export interface MyPostsResponse {
  message: string;
  data: {
    posts: (Post | TeamPost)[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const fetchMyPosts = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<MyPostsResponse> => {
  const response = await apiClient.get<MyPostsResponse>(`/mypage/my-posts`, {
    params: { page, size: pageSize, sort },
  });
  return response.data;
};
