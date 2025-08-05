// src/api/books.ts

import apiClient from "./apiClient";

import type {
  BookSummary,
  BookDetail,
  AladinApiResponse,
  AladinBookItem,
  BookEntity,
} from "../types";

interface BookSearchResponse {
  books: BookSummary[];
  total: number;
}

const mapAladinItemToBookDetail = (aladinItem: AladinBookItem): BookDetail => {
  return {
    isbn13: aladinItem.isbn13,
    cover: aladinItem.cover,
    title: aladinItem.title,
    author: aladinItem.author,
    publisher: aladinItem.publisher,
    pubDate: aladinItem.pubDate || null,
    description: aladinItem.description || null,
    category: aladinItem.categoryName || null,
    toc: aladinItem.subInfo?.toc ? aladinItem.subInfo.toc.split("\n") : null,
    fullDescription:
      aladinItem.subInfo?.fullDescription ||
      aladinItem.subInfo?.fullDescription2 ||
      null,
    pageCount: aladinItem.subInfo?.itemPage || null,
    bestRank: aladinItem.bestRank || null,
    seriesInfo: aladinItem.seriesInfo || null,
    isWished: false,
  };
};

const mapBackendBookToBookDetail = (backendBook: BookEntity): BookDetail => {
  return {
    isbn13: backendBook.isbn13,
    cover: backendBook.cover,
    title: backendBook.title,
    author: backendBook.author,
    publisher: backendBook.publisher,
    pubDate: backendBook.pubDate || null,
    description: backendBook.description || null,
    category: backendBook.category || null,
    toc: backendBook.toc ? backendBook.toc.split("\n") : null,
    fullDescription: backendBook.story || null,
    pageCount: backendBook.pageCount || null,
    bestRank: backendBook.bestRank || null,
    seriesInfo: backendBook.seriesInfo || null,
    isWished: false,
  };
};

export const searchBooks = async (
  query: string,
  page: number,
  size: number,
  category: string | null = null
): Promise<BookSearchResponse> => {
  let url = `/books/search?keyword=${encodeURIComponent(query)}`;
  url += `&page=${page}`;
  url += `&size=${size}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  const response = await apiClient.get<{
    status: string;
    message: string;
    data: AladinApiResponse<AladinBookItem>;
  }>(url);

  const aladinResponse = response.data.data;

  return {
    books: aladinResponse.item.map((item) => mapAladinItemToBookDetail(item)),
    total: aladinResponse.totalResults,
  };
};

export const getBookDetail = async (itemId: string): Promise<BookDetail> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: BookEntity;
    }>(`/books/${itemId}`);

    const actualBackendResponseData = response.data.data;

    if (actualBackendResponseData) {
      return mapBackendBookToBookDetail(actualBackendResponseData);
    } else {
      throw new Error("도서 상세 정보를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Failed to fetch book detail:", error);
    throw error;
  }
};

export const fetchBestsellers = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/bestsellers?page=${page}&size=${size}${
        categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data.data.item.map((item) =>
      mapAladinItemToBookDetail(item)
    );
  } catch (error) {
    console.error("Failed to fetch bestsellers:", error);
    throw error;
  }
};

export const fetchNewBooks = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/newBooks?page=${page}&size=${size}${
        categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data.data.item.map((item) =>
      mapAladinItemToBookDetail(item)
    );
  } catch (error) {
    console.error("Failed to fetch new books:", error);
    throw error;
  }
};

export const fetchSpecialNewBooks = async (
  page: number = 1,
  size: number = 10,
  categoryId?: number
): Promise<BookSummary[]> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(
      `/books/specialNewBooks?page=${page}&size=${size}${
        categoryId ? `&categoryId=${categoryId}` : ""
      }`
    );
    return response.data.data.item.map((item) =>
      mapAladinItemToBookDetail(item)
    );
  } catch (error) {
    console.error("Failed to fetch special new books:", error);
    throw error;
  }
};
