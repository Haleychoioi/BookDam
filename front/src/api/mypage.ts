// src/api/mypage.ts

import apiClient from "./apiClient";
import type { Post, Comment, CommunityHistoryEntry } from "../types";

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

export interface MyLibraryResponseData {
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

interface UpsertMyLibraryRequest {
  isbn13: string;
  status: "WANT_TO_READ" | "READING" | "COMPLETED";
  myRating?: number | null;
}

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

export const addWish = async (isbn13: string) => {
  try {
    const response = await apiClient.post(`/mypage/wishlist`, { isbn13 });
    return response.data;
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
};

export const removeWish = async (isbn13: string) => {
  try {
    const response = await apiClient.delete(`/mypage/wishlist/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
};

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

export const addRatingToMyLibrary = async (
  isbn13: string,
  myRating: number
) => {
  try {
    const requestBody = { isbn13, myRating };
    const response = await apiClient.post(`/mypage/my-library`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to add rating to my library:", error);
    throw error;
  }
};

export const deleteBookFromMyLibrary = async (isbn13: string) => {
  try {
    const response = await apiClient.delete(`/mypage/my-library/${isbn13}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete book from my library:", error);
    throw error;
  }
};

export const fetchCommunityHistory = async (
  userId: string
): Promise<CommunityHistoryEntry[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: CommunityHistoryEntry[];
    }>(`/mypage/users/${userId}/community-history`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch community history:", error);
    throw error;
  }
};
