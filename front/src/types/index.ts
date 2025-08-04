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

// 1.2 도서 기본 타입
export interface Book {
  isbn13: string;
  coverImage: string | null;
  title: string;
  author: string;
  publisher: string;
  publicationDate: string | null;
  description: string | null;
  genre: string | null;
}

// 1.3 게시물 기본 타입 (상세 정보 포함)
export interface Post {
  id: string;
  title: string;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  type: "community" | "general"; // 'community' 또는 'general' 게시물 타입
  author: string; // 게시물 작성자 이름
  authorId: number; // 게시물 작성자 ID
  content: string; // 게시물 본문 내용
}

// 1.4 댓글 기본 타입
export interface Comment {
  id: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt?: string;
  content: string;
  isEdited?: boolean;
  postId: string; // 댓글이 달린 게시물 ID
  postTitle: string; // 댓글이 달린 게시물 제목
  postType: "community" | "general"; // 게시물 타입 ('community' 또는 'general')
  communityId?: string; // 커뮤니티 게시물인 경우 커뮤니티 ID (선택적)
  parentId?: string; // 이 댓글이 대댓글인 경우 부모 댓글의 ID
  replies?: Comment[]; // 자식 댓글 목록
  depth?: number; // 댓글의 깊이
}

// =========================================================
// 2. 기본 엔티티의 상세/확장 타입 (Extended Entities)
// =========================================================

// 2.1 도서 상세 정보 타입 (Book을 확장)
export interface BookDetail extends Book {
  communityCount: number;
  isWished: boolean;
  summary: string | null;
  tableOfContents: string[] | null;
  commentaryContent: string | null;
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
  role: "host" | "member"; // 사용자의 커뮤니티 역할 (필수)
  status: "모집중" | "모집종료"; // 커뮤니티 자체의 모집 상태 (필수)
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

// 4.1 마이페이지 - 내 서재 도서 타입 (Book을 확장)
export interface MyLibraryBook extends Book {
  publisher: string; // BookDetail에서 가져옴
  pubDate: string; // MyLibraryBook에만 있는 필드 (BookDetail의 publicationDate와 별개로 존재할 수 있음)
  averageRating: number;
  description: string; // BookDetail에서 가져옴
  genre: string; // BookDetail에서 가져옴
  summary: string; // BookDetail에서 가져옴
  status: "reading" | "read" | "to-read"; // 서재 내 도서 상태
  myRating?: number; // 내가 매긴 별점
}

// 4.2 마이페이지 - 커뮤니티 신청자 타입
export interface ApplicantWithStatus {
  id: string; // 신청자 ID (userId)
  nickname: string;
  appliedAt: string; // 신청 일시 (ISO String)
  applicationMessage: string; // 신청 메시지
  status: "pending" | "accepted" | "rejected"; // 신청 상태
}

// 4.3 마이페이지 - 커뮤니티 참여 이력 타입
export interface CommunityHistoryEntry {
  communityName: string; // 참여 커뮤니티 이름
  role: "host" | "member"; // 역할 (호스트/멤버)
  startDate: string; // 활동 시작일 (예: "YYYY-MM-DD" 형식의 문자열)
  endDate?: string; // 활동 종료일 (현재 활동 중이면 없을 수 있으므로 선택적)
  status: "활동중" | "활동종료"; // 활동 상태
}

// 4.4 마이페이지 - 내가 신청한 커뮤니티 타입 (Community를 확장)
export interface AppliedCommunity extends Community {
  myApplicationStatus: "pending" | "accepted" | "rejected"; // 사용자의 신청 상태 (Community의 status와 다름)
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
  version: string; // API 버전
  title: string; // API 결과 제목
  link: string; // 관련 알라딘 페이지 URL
  pubDate: string; // API 출력일
  totalResults: number; // 총 결과 수
  startIndex: number; // 시작 인덱스
  itemsPerPage: number; // 페이지당 항목 수
  query?: string; // 검색 쿼리
  searchCategoryId?: number; // 검색 카테고리 ID
  searchCategoryName?: string; // 검색 카테고리명
  item: T[]; // 상품 목록
}

// 알라딘 책 정보 (API 응답에서 그대로 오는 형태)
export interface AladinBookItem {
  title: string; // 상품명
  link: string; // 상품 링크 URL
  author: string; // 저자/아티스트
  pubDate: string; // 출간일
  description: string; // 상품 설명 (요약)
  isbn: string; // 10자리 ISBN
  isbn13: string; // 13자리 ISBN
  itemId: number; // 알라딘 상품 ID
  cover: string; // 표지 이미지 URL
  publisher: string; // 출판사
  adult: boolean; // 성인 등급 여부
  bestDuration?: string; // 베스트셀러 기간 정보
  bestRank?: number; // 베스트셀러 순위
  categoryName: string; // 카테고리명

  // 시리즈 정보
  seriesInfo?: {
    seriesId: number;
    seriesLink: string;
    seriesName: string;
  };

  // 부가 정보
  subInfo?: {
    subTitle?: string; // 부제
    originalTitle?: string; // 원제
    itemPage?: number; // 페이지 수
    fullDescription?: string; // 상세 설명
    fullDescription2?: string; // 출판사 제공 설명
    toc?: string; // 목차
    story?: string; // 줄거리
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
