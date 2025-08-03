// src/api/mypage.ts

import apiClient from "./apiClient";
import type { Post, Comment, CommunityHistoryEntry } from "../types"; // ✨ CommunityHistoryEntry 임포트 추가 ✨

// 위시리스트 응답 타입 (실제 백엔드 응답에 맞춰 수정)
interface WishlistResponseData {
  data: {
    wishListId: number;
    addedAt: string;
    book: {
      isbn13: string;
      title: string;
      cover: string | null;
    };
    user: {
      nickname: string;
    };
  }[];
}

// 내 서재 응답 타입 (실제 백엔드 응답에 맞춰 수정)
interface MyLibraryResponseData {
  data: {
    libraryId: number;
    status: "WANT_TO_READ" | "READING" | "COMPLETED";
    myRating: number | null;
    updatedAt: string;
    book: {
      isbn13: string;
      title: string;
      author: string;
      publisher: string;
      cover: string | null;
      category: string | null;
    };
    user: {
      nickname: string;
    };
  }[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

// 도서 상세에서 '서재 추가' 시 필요한 요청 바디
interface UpsertMyLibraryRequest {
  isbn13: string;
  status: "WANT_TO_READ" | "READING" | "COMPLETED";
  myRating?: number | null;
}

// 기존 fetchMyPosts, fetchMyComments 함수는 유지

export const fetchMyPosts = async (
  page: number,
  size: number
): Promise<{ posts: Post[]; total: number }> => {
  try {
    const response = await apiClient.get<{ posts: Post[]; total: number }>(
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
): Promise<{ comments: Comment[]; total: number }> => {
  try {
    const response = await apiClient.get<{
      comments: Comment[];
      total: number;
    }>(`/mypage/my-comments?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my comments:", error);
    throw error;
  }
};

// 1. 위시리스트 조회
export const fetchWishlist = async (): Promise<
  WishlistResponseData["data"]
> => {
  try {
    const response = await apiClient.get<WishlistResponseData>(
      `/mypage/wishlist`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    throw error;
  }
};

// 2. 위시리스트 추가
export const addWish = async (isbn13: string) => {
  try {
    const response = await apiClient.post(`/mypage/wishlist`, { isbn13 });
    return response.data;
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
};

// 3. 위시리스트 삭제
export const removeWish = async (isbn13: string) => {
  try {
    const response = await apiClient.delete(`/mypage/wishlist/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
};

// 4. 내 서재 목록 조회
export const fetchMyLibrary = async (
  page: number,
  limit: number,
  status?: "WANT_TO_READ" | "READING" | "COMPLETED"
): Promise<MyLibraryResponseData> => {
  try {
    let url = `/mypage/my-library?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get<MyLibraryResponseData>(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch my library:", error);
    throw error;
  }
};

// 5. 내 서재에 도서 추가/수정 (Upsert)
export const upsertBookToMyLibrary = async (
  isbn13: string,
  status: "WANT_TO_READ" | "READING" | "COMPLETED",
  myRating?: number | null
) => {
  try {
    const requestBody: UpsertMyLibraryRequest = { isbn13, status };
    if (myRating !== undefined) {
      requestBody.myRating = myRating;
    }
    const response = await apiClient.post(`/mypage/my-library`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to upsert book to my library:", error);
    throw error;
  }
};

// 6. 내 서재에서 도서 삭제
export const deleteBookFromMyLibrary = async (isbn13: string) => {
  try {
    const response = await apiClient.delete(`/mypage/my-library/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete book from my library:", error);
    throw error;
  }
};

// ✨ 새로 추가: 특정 사용자의 커뮤니티 참여 이력 조회 ✨
export const fetchCommunityHistory = async (
  userId: string // API는 userId를 string으로 받음
): Promise<CommunityHistoryEntry[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: CommunityHistoryEntry[];
    }>(`/mypage/users/${userId}/community-history`); // 백엔드 라우트에 맞춤
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch community history:", error);
    throw error;
  }
};
