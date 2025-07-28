import apiClient from "./apiClient";

import type {
  BookSummary,
  BookDetail,
  AladinApiResponse,
  AladinBookItem,
} from "../types";

interface BookSearchResponse {
  books: BookSummary[]; // 백엔드 응답의 실제 키에 맞춰야 함
  total: number; // 백엔드 응답의 실제 키에 맞춰야 함
}

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

  // ✨ Axios의 제네릭 타입을 백엔드 실제 응답 구조에 맞춰 지정 ✨
  const response = await apiClient.get<{
    status: string;
    message: string;
    data: AladinApiResponse<AladinBookItem>; // 백엔드가 보내는 data 필드의 실제 타입
  }>(url);

  // ✨ 백엔드 응답에서 필요한 데이터를 추출하여 프론트엔드 BookSearchResponse 형식으로 변환 ✨
  const aladinResponse = response.data.data; // 실제 알라딘 API 응답 데이터 (item, totalResults 포함)

  return {
    books: aladinResponse.item.map((item) => mapAladinItemToBookDetail(item)), // AladinBookItem을 BookSummary로 매핑
    total: aladinResponse.totalResults, // totalResults를 total로 매핑
  };
};

// 백엔드에서 받은 AladinApiResponse<AladinBookItem>를 프론트엔드의 BookDetail 타입으로 변환하는 헬퍼 함수
const mapAladinItemToBookDetail = (aladinItem: AladinBookItem): BookDetail => {
  return {
    isbn13: aladinItem.isbn13,
    coverImage: aladinItem.cover,
    title: aladinItem.title,
    author: aladinItem.author,
    publisher: aladinItem.publisher,
    publicationDate: aladinItem.pubDate || null,
    description: aladinItem.description || null,
    genre: aladinItem.categoryName || null,
    // 아래 필드들은 Aladin API 응답에 직접 포함되지 않음 => 확인 필요
    summary: aladinItem.description || null,
    tableOfContents: aladinItem.subInfo?.toc
      ? aladinItem.subInfo.toc.split("\n")
      : null, // ✨ 수정 ✨
    commentaryContent:
      aladinItem.subInfo?.fullDescription ||
      aladinItem.subInfo?.fullDescription2 ||
      null, // ✨ 수정 ✨
    averageRating: null,
    communityCount: 0,
    isWished: false,
    recommendedBooks: [],
    pageCount: aladinItem.subInfo?.itemPage || null,
  };
};

// 2. 특정 도서 상세 정보 조회 (BookDetailPage에서 사용)
export const getBookDetail = async (itemId: string): Promise<BookDetail> => {
  try {
    const response = await apiClient.get<{
      status: string;
      message: string;
      data: AladinApiResponse<AladinBookItem>;
    }>(`/books/detail/${itemId}`);

    if (response.data.data.item && response.data.data.item.length > 0) {
      return mapAladinItemToBookDetail(response.data.data.item[0]);
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

    // 백엔드는 AladinApiResponse를 data 필드에 담아 주므로, item 배열을 바로 반환
    return response.data.data.item.map((item) =>
      mapAladinItemToBookDetail(item)
    ); // AladinBookItem을 BookDetail/BookSummary로 변환
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
