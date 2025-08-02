import apiClient from "./apiClient";

import type {
  BookSummary,
  BookDetail,
  AladinApiResponse,
  AladinBookItem,
  BookEntity,
} from "../types";

interface BookSearchResponse {
  books: BookSummary[]; // 백엔드 응답의 실제 키에 맞춰야 함
  total: number; // 백엔드 응답의 실제 키에 맞춰야 함
}

// 백엔드에서 받은 AladinApiResponse<AladinBookItem>를 프론트엔드의 BookDetail 타입으로 변환하는 헬퍼 함수
// 이 함수는 'coverImage' 대신 'cover'와 'publicationDate' 대신 'pubDate'를 사용하도록 이미 수정되었습니다.
const mapAladinItemToBookDetail = (aladinItem: AladinBookItem): BookDetail => {
  return {
    isbn13: aladinItem.isbn13,
    cover: aladinItem.cover,
    title: aladinItem.title,
    author: aladinItem.author,
    publisher: aladinItem.publisher,
    pubDate: aladinItem.pubDate || null, // 'publicationDate' 대신 'pubDate'
    description: aladinItem.description || null,
    category: aladinItem.categoryName || null,
    toc: aladinItem.subInfo?.toc // 'tableOfContents'를 'toc'로 변경합니다.
      ? aladinItem.subInfo.toc.split("\n")
      : null,
    fullDescription:
      aladinItem.subInfo?.fullDescription ||
      aladinItem.subInfo?.fullDescription2 ||
      null,
    pageCount: aladinItem.subInfo?.itemPage || null,
    bestRank: aladinItem.bestRank || null, // 이 줄을 추가합니다.
    seriesInfo: aladinItem.seriesInfo || null, // 이 줄을 추가합니다.
    isWished: false, // 이 줄을 추가합니다.
  };
};

// 백엔드 BookEntity를 프론트엔드의 BookDetail 타입으로 변환하는 헬퍼 함수
// 이 함수는 'coverImage' 대신 'cover'와 'publicationDate' 대신 'pubDate'를 사용하도록 수정합니다.
const mapBackendBookToBookDetail = (backendBook: BookEntity): BookDetail => {
  return {
    isbn13: backendBook.isbn13,
    cover: backendBook.cover, // 'coverImage'를 'cover'로 변경합니다.
    title: backendBook.title,
    author: backendBook.author,
    publisher: backendBook.publisher,
    pubDate: backendBook.pubDate || null, // 'publicationDate'를 'pubDate'로 변경합니다.
    description: backendBook.description || null,
    category: backendBook.category || null,
    toc: backendBook.toc // 'tableOfContents'를 'toc'로 변경합니다.
      ? backendBook.toc.split("\n")
      : null,
    fullDescription: backendBook.story || null,
    pageCount: backendBook.pageCount || null,
    bestRank: backendBook.bestRank || null, // 이 줄을 추가합니다.
    seriesInfo: backendBook.seriesInfo || null, // 이 줄을 추가합니다.
    isWished: false, // 이 줄을 추가합니다.
  };
};

// 1. 도서 검색 결과 조회 (BookSearchResultPage에서 사용)
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

// 2. 특정 도서 상세 정보 조회 (BookDetailPage에서 사용)
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

// 베스트셀러 목록 조회
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

// 신간 목록 조회
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

// 주목할 신간 목록 조회
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

// 3. 특정 도서 관련 커뮤니티 목록을 가져오는 함수 (백엔드 구현 시 사용)
// 현재 백엔드 controllers/book.controller.ts에 이 엔드포인트 구현이 없음.
// 백엔드에 구현된 후 사용 가능합니다.
// export const fetchBookCommunities = async (
//   itemId: string, // bookId 대신 itemId 사용
//   page: number = 1,
//   size: number = 10
// ): Promise<{ communities: Community[]; total: number }> => {
//   try {
//     const response = await apiClient.get<{ communities: Community[]; total: number }>(
//       `/books/${itemId}/communities?page=${page}&size=${size}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch book communities:", error);
//     throw error;
//   }
// };
