// src/types/index.ts

// =========================================================
// 1. 기본 엔티티 타입 (Core Entities)
// =========================================================

// 1.1 사용자 프로필 타입 (기본 사용자 정보)
export interface UserProfile {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImage?: string;
  introduction?: string;
  agreement: boolean;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

// 1.2 도서 기본 타입 (일반적인 도서 정보, 알라딘 API 등에서 올 수 있는 전체 정보)
export interface Book {
  isbn13: string;
  coverImage: string | null; // map from 'cover'
  title: string;
  author: string;
  publisher: string;
  publicationDate: string | null; // map from 'pubDate'
  description: string | null;
  genre: string | null; // map from 'categoryName' or 'category'
}

// 1.3 게시물 기본 타입 (상세 정보 포함)
export interface Post {
  id: string;
  title: string;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  type: "community" | "general";
  author: string;
  authorId: number;
  authorProfileImage?: string;
  content: string;
}

// 1.4 댓글 기본 타입
export interface Comment {
  id: string;
  author: string;
  authorId: number;
  authorProfileImage?: string;
  createdAt: string;
  updatedAt?: string;
  content: string;
  isEdited?: boolean;
  postId: string;
  postTitle: string;
  postType: "community" | "general";
  communityId?: string;
  parentId?: string;
  replies?: Comment[];
  depth?: number;
}

export interface BookEntity {
  // 백엔드 DB에 저장되는 최소한의 책 정보 (isbn13으로 조회 시 반환)
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  description: string | null;
  cover: string | null;
  category: string | null;
  pageCount: number | null;
  toc: string | null;
  story: string | null;
  createdAt: string;
}

// =========================================================
// 2. 기본 엔티티의 상세/확장 타입 (Extended Entities)
// =========================================================

// 2.1 도서 상세 정보 타입 (Book을 확장) - 알라딘 상세 조회 후 프론트엔드에서 사용
export interface BookDetail extends Book {
  communityCount: number;
  isWished: boolean;
  summary: string | null; // Aladin description 또는 subInfo.story에서 파싱
  tableOfContents: string[] | null; // Aladin subInfo.toc 파싱
  commentaryContent: string | null; // Aladin subInfo.fullDescription 등
  averageRating: number | null;
  recommendedBooks?: Book[];
  pageCount: number | null;
}

// =========================================================
// 3. 커뮤니티 관련 타입 (Community Related)
// =========================================================

// 3.1 커뮤니티 기본 정보 타입
export interface Community {
  id: string; // 커뮤니티 ID
  title: string;
  description: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
  role: "host" | "member";
  status: "모집중" | "모집종료";
}

// 3.2 마이페이지 커뮤니티 정보 타입 (CommunityBoardPage에서 사용)
export interface CommunityInfo {
  bookTitle: string;
  hostName: string;
  communityTopic: string;
}

// =========================================================
// 4. 사용자 활동 및 마이페이지 특정 타입 (User Activity & MyPage Specific)
// =========================================================

// 4.1 마이페이지 - 내 서재 도서 타입 (백엔드 MyLibrary ResponseData.data.book + MyLibrary item)
// MyLibrary API 응답에 맞춰 정확히 재정의. Book을 확장하지 않음.
export interface MyLibraryBook {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  coverImage: string | null; // 'book.cover'에서 매핑
  genre: string | null; // 'book.category'에서 매핑

  // MyLibrary 엔티티의 최상위 속성들
  libraryId: number; // libraryId 필드 추가
  status: "reading" | "read" | "to-read"; // 백엔드 Enum "WANT_TO_READ" | "READING" | "COMPLETED"에서 소문자로 매핑
  myRating: number | null; // myRating은 null 가능성도 있으므로 null 포함
  updatedAt: string; // updatedAt 필드 추가

  // UI에서 필요할 수 있지만 MyLibrary API 응답에 직접 포함되지 않는 필드는 optional 처리
  publicationDate?: string | null; // Book에서 오는 pubDate는 myLibrary 응답에 없음
  description?: string | null; // Book에서 오는 description은 myLibrary 응답에 없음
  summary?: string | null; // MyLibrary API 응답에 없음
  averageRating?: number | null; // MyLibrary API 응답에 없음
}

// 4.2 마이페이지 - 커뮤니티 신청자 타입
export interface ApplicantWithStatus {
  id: string;
  nickname: string;
  appliedAt: string;
  applicationMessage: string;
  status: "pending" | "accepted" | "rejected";
}

// 4.3 마이페이지 - 커뮤니티 참여 이력 타입
export interface CommunityHistoryEntry {
  communityName: string;
  role: "host" | "member";
  startDate: string;
  endDate?: string;
  status: "활동중" | "활동종료";
}

// 4.4 마이페이지 - 내가 신청한 커뮤니티 타입 (Community를 확장)
export interface AppliedCommunity extends Community {
  myApplicationStatus: "pending" | "accepted" | "rejected"; // 사용자의 신청 상태 (Community의 status와 다름)
}

// 4.5 회원가입 요청
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  agreement: boolean;
  profileImage?: string;
  introduction?: string;
}

// 4.6 사용자 정보 수정 요청 (ProfileEditPage에서 FormData로 전달되지만, DTO의 구조를 명시)
export interface UpdateUserData {
  nickname: string;
  introduction?: string;
  profileImage?: string; // 파일 URL 또는 'true' (기본 이미지로 변경)
  deleteProfileImage?: string; // 'true'일 경우 기본 이미지로 변경
}

// =========================================================
// 알라딘 API 관련 Enum
// =========================================================

// AladinQueryType
export const AladinQueryType = {
  KEYWORD: "Keyword",
  TITLE: "Title",
  AUTHOR: "Author",
  PUBLISHER: "Publisher",
} as const;
export type AladinQueryType =
  (typeof AladinQueryType)[keyof typeof AladinQueryType];

// AladinSearchTarget
export const AladinSearchTarget = {
  BOOK: "Book",
  FOREIGN: "Foreign",
  EBOOK: "eBook",
  ALL: "All",
} as const;
export type AladinSearchTarget =
  (typeof AladinSearchTarget)[keyof typeof AladinSearchTarget];

// AladinSortType
export const AladinSortType = {
  ACCURACY: "Accuracy",
  PUBLISH_TIME: "PublishTime",
  TITLE: "Title",
  SALES_POINT: "SalesPoint",
  CUSTOMER_RATING: "CustomerRating",
  MY_REVIEW_COUNT: "MyReviewCount",
} as const;
export type AladinSortType =
  (typeof AladinSortType)[keyof typeof AladinSortType];

// AladinListType
export const AladinListType = {
  NEW_ALL: "ItemNewAll",
  NEW_SPECIAL: "ItemNewSpecial",
  EDITOR_CHOICE: "ItemEditorChoice",
  BESTSELLER: "Bestseller",
  BLOG_BEST: "BlogBest",
} as const;
export type AladinListType =
  (typeof AladinListType)[keyof typeof AladinListType];

// AladinCoverSize
export const AladinCoverSize = {
  BIG: "Big",
  MID_BIG: "MidBig",
  MID: "Mid",
  SMALL: "Small",
  MINI: "Mini",
  NONE: "None",
} as const;
export type AladinCoverSize =
  (typeof AladinCoverSize)[keyof typeof AladinCoverSize];

// AladinOutputType
export const AladinOutputType = {
  XML: "XML",
  JS: "JS",
} as const;
export type AladinOutputType =
  (typeof AladinOutputType)[keyof typeof AladinOutputType];

// AladinItemIdType
export const AladinItemIdType = {
  ISBN: "ISBN",
  ISBN13: "ISBN13",
  ITEM_ID: "ItemId",
} as const;
export type AladinItemIdType =
  (typeof AladinItemIdType)[keyof typeof AladinItemIdType];

// =========================================================
// 알라딘 API 응답 관련 타입들
// =========================================================

// 알라딘 API 공통 응답 구조
export interface AladinApiResponse<T = AladinBookItem> {
  version: string;
  title: string;
  link: string;
  pubDate: string;
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  query?: string;
  searchCategoryId?: number;
  searchCategoryName?: string;
  item: T[];
}

// 알라딘 책 정보 (API 응답에서 그대로 오는 형태)
export interface AladinBookItem {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  cover: string;
  publisher: string;
  adult: boolean;
  bestDuration?: string;
  bestRank?: number;
  categoryName: string;

  // 시리즈 정보
  seriesInfo?: {
    seriesId: number;
    seriesLink: string;
    seriesName: string;
  };

  // 부가 정보
  subInfo?: {
    subTitle?: string;
    originalTitle?: string;
    itemPage?: number;
    fullDescription?: string;
    fullDescription2?: string;
    toc?: string;
    story?: string;
  };
}

// =========================================================
// 클라이언트 응답용 타입들 (searchBooks에서 사용)
// =========================================================

export interface BookSummary {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  publicationDate: string | null;
  coverImage: string | null;
  genre: string | null;
  description: string | null;
}
