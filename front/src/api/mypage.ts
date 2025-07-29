import apiClient from "./apiClient";
import type { Post, Comment } from "../types";

// API 응답 타입 정의 (백엔드 응답 형태에 맞춰야 함)
interface MyPostsResponse {
  posts: Post[];
  total: number;
}

interface MyCommentsResponse {
  comments: Comment[];
  total: number;
}

export const fetchMyPosts = async (
  page: number,
  size: number
): Promise<MyPostsResponse> => {
  try {
    const response = await apiClient.get<MyPostsResponse>(
      `/mypage/my-posts?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my posts:", error);
    throw error;
  }
};

export const fetchMyComments = async (
  page: number,
  size: number
): Promise<MyCommentsResponse> => {
  try {
    const response = await apiClient.get<MyCommentsResponse>(
      `/mypage/my-comments?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my comments:", error);
    throw error;
  }
};
