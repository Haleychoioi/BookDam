// src/types/index.ts

// =========================================================
// 1. 핵심 엔티티 타입 (Core Entities)
// 백엔드 Prisma 모델 및 API 응답에 최대한 맞춰 재정의
// =========================================================

// 1.0 Community 인터페이스 (프론트엔드에서 사용될 커뮤니티 공통 타입)
export interface Community {
  id: string; // 커뮤니티 ID (백엔드의 teamId를 string으로 매핑)
  title: string; // 커뮤니티 제목 (백엔드의 postTitle)
  description: string; // 커뮤니티 설명 (백엔드의 postContent)
  hostName: string; // 커뮤니티 호스트 닉네임 (백엔드의 postAuthor)
  currentMembers: number; // 현재 멤버 수 (백엔드에서 직접 제공하지 않으면 프론트엔드에서 계산 또는 임시값)
  maxMembers: number; // 최대 멤버 수 (백엔드에서 직접 제공하지 않으면 프론트엔드에서 임시값)
  role: "host" | "member"; // 현재 사용자의 커뮤니티 내 역할 (로그인된 사용자 기준)
  status: "모집중" | "모집종료"; // 프론트엔드에서 표시할 모집 상태 (백엔드의 status 매핑)
}

// 1.1 사용자 프로필 타입
export interface UserProfile {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImage: string | null;
  introduction: string | null;
  role: string; // UserRole enum 대신 string으로 일반화
  createdAt: string;
  updatedAt: string;
}

// 1.2 도서 기본 타입 (DB에 저장되는 Book 모델 기준)
export interface BookEntity {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  description: string | null;
  cover: string | null;
  category: string | null;
  pageCount: number | null;
  toc: string | null; // Table of Contents
  story: string | null; // Plot/Story
  createdAt: string;
}

// 1.3 TeamPostType Enum (팀 게시물 타입)
export enum TeamPostType { // as const 제거, export enum으로 변경
  DISCUSSION = "DISCUSSION",
  NOTICE = "NOTICE",
}

// 1.4 TeamPost 인터페이스 (팀 게시물 모델)
export interface TeamPost {
  teamPostId: number;
  teamId: number;
  userId: number;
  title: string;
  content: string;
  type: TeamPostType;
  createdAt: string;
  updatedAt: string; // 통일된 string 타입
  user: {
    nickname: string;
    profileImage?: string | null; // 백엔드 include에 따라 없을 수도 있음
  };
  _count?: {
    comments: number;
  };
}

// 1.5 TeamCommunity 인터페이스 (팀 커뮤니티 모델)
export interface TeamCommunity {
  teamId: number;
  postId: number;
  isbn13: string;
  status: string; // CommunityStatus enum (예: 'RECRUITING', 'ACTIVE', 'COMPLETED')
  postTitle: string;
  postContent: string;
  postAuthor: string; // User의 nickname
  createdAt: string;
  updatedAt: string; // 통일된 string 타입
  maxMembers?: number; // Post에서 가져오는 최대 인원수
}

// 1.6 PostType Enum (일반 게시물 타입)
export enum PostType { // as const 제거, export enum으로 변경
  GENERAL = "GENERAL",
  RECRUITMENT = "RECRUITMENT",
}

// 1.7 Post 인터페이스 (일반 게시물 모델)
export interface Post {
  postId: number; // id -> postId (백엔드와 일치)
  userId: number;
  title: string;
  content: string;
  type: PostType;
  createdAt: string;
  updatedAt: string; // 통일된 string 타입
  user: {
    nickname: string;
    profileImage: string | null;
  };
  _count?: {
    comments: number;
  };
  book?: {
    title: string;
    author: string;
    cover: string | null;
    isbn13: string;
    toc?: string | null;
    story?: string | null;
  } | null;
  recruitmentStatus?: string; // RecruitmentStatus (string으로 일반화)
  maxMembers?: number; // 모집글일 경우 최대 인원
}

// 1.8 Comment 인터페이스 (일반 게시물 댓글 모델)
export interface Comment {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  user: {
    nickname: string;
    profileImage: string | null;
  };
  replies?: (Comment | TeamComment)[]; // ✨ 수정: replies 타입 유연화 ✨
  depth?: number;
  postTitle?: string;
  postType?: string;
  communityId?: string;
}

// 1.9 TeamComment 인터페이스 (팀 게시물 댓글 모델)
export interface TeamComment {
  teamCommentId: number;
  teamPostId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  user: {
    nickname: string;
    profileImage?: string | null;
  };
  replies?: (Comment | TeamComment)[]; // ✨ 수정: replies 타입 유연화 ✨
  depth?: number;
  postTitle?: string;
  postType?: string;
  communityId?: string;
}
// 1.10 JWT Payload 타입
export interface JWTPayload {
  userId: number;
  email: string;
  role: string; // UserRole enum 대신 string으로 일반화
  iat?: number;
  exp?: number;
}

// =========================================================
// 2. 알라딘 API 관련 Enum (as const 제거, 일반 enum으로 선언)
// =========================================================

export enum AladinQueryType { // as const 제거
  KEYWORD = "Keyword",
  TITLE = "Title",
  AUTHOR = "Author",
  PUBLISHER = "Publisher",
}

export enum AladinSearchTarget { // as const 제거
  BOOK = "Book",
  FOREIGN = "Foreign",
  EBOOK = "eBook",
  ALL = "All",
}

export enum AladinSortType { // as const 제거
  ACCURACY = "Accuracy",
  PUBLISH_TIME = "PublishTime",
  TITLE = "Title",
  SALES_POINT = "SalesPoint",
  CUSTOMER_RATING = "CustomerRating",
  MY_REVIEW_COUNT = "MyReviewCount",
}

export enum AladinListType { // as const 제거
  NEW_ALL = "ItemNewAll",
  NEW_SPECIAL = "ItemNewSpecial",
  EDITOR_CHOICE = "ItemEditorChoice",
  BESTSELLER = "Bestseller",
  BLOG_BEST = "BlogBest",
}

export enum AladinCoverSize { // as const 제거
  BIG = "Big",
  MID_BIG = "MidBig",
  MID = "Mid",
  SMALL = "Small",
  MINI = "Mini",
  NONE = "None",
}

export enum AladinOutputType { // as const 제거
  XML = "XML",
  JS = "JS",
}

export enum AladinItemIdType { // as const 제거
  ISBN = "ISBN",
  ISBN13 = "ISBN13",
  ITEM_ID = "ItemId",
}

// =========================================================
// 3. 알라딘 API 응답 관련 타입들
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
// 4. 클라이언트 응답 및 요청용 확장 타입들
// =========================================================

// 4.1 책 요약 정보 (검색 결과용) - BookEntity에서 필요한 필드만 가져와 클라이언트에 표시
export interface BookSummary {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null; // publicationDate -> pubDate
  cover: string | null; // coverImage -> cover
  category: string | null; // genre -> category
  description: string | null;
}

// 4.2 개인 도서관 도서 타입 (MyLibrary API 응답에 맞춰 재정의)
export interface MyLibraryBook {
  libraryId: number;
  status: string; // ReadingStatus Enum 대신 string으로 일반화
  myRating: number | null;
  updatedAt: string;

  book: {
    // 중첩된 book 객체
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
}

// 4.3 마이페이지 - 커뮤니티 신청자 타입
export interface ApplicantWithStatus {
  id: string; // 프론트엔드용 ID, applicationId를 string으로 변환하여 사용
  applicationId: number; // 백엔드 응답 필드
  userId: number; // 백엔드 응답 필드
  nickname: string;
  appliedAt: string;
  applicationMessage: string;
  status: "pending" | "accepted" | "rejected";
}
// 4.4 마이페이지 - 커뮤니티 참여 이력 타입 (현재 불필요한 필드 제거)
// 백엔드 명세서에 명확한 API가 없으므로 프론트엔드 목업에 기반
export interface CommunityHistoryEntry {
  communityName: string;
  role: string; // "host" | "member"
  startDate: string;
  endDate?: string;
  status: string; // "활동중" | "활동종료"
}

// 4.5 마이페이지 - 내가 신청한 커뮤니티 타입 (TeamCommunity를 확장)
export interface AppliedCommunity extends Community {
  // TeamCommunity 대신 Community 확장
  myApplicationStatus: string; // "pending" | "accepted" | "rejected"
  // id, title, description, hostName, currentMembers, maxMembers, role, status 등은 Community에서 상속받음
}

// 4.6 회원가입 요청 DTO
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

// 4.7 사용자 정보 수정 요청 DTO
export interface UpdateUserData {
  nickname?: string;
  introduction?: string;
  profileImage?: string; // 파일 URL 또는 'true' (기본 이미지로 변경)
  deleteProfileImage?: string; // 'true'일 경우 기본 이미지로 변경
}

// 4.8 로그인 요청 DTO
export interface LoginRequest {
  email: string;
  password: string;
}

// 4.9 비밀번호 변경 요청 DTO
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// 4.10 위시리스트 추가 요청 DTO
export interface AddWishListRequest {
  isbn13: string;
}

// 4.11 위시리스트 응답 타입
export interface WishListResponse {
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
}

// 4.12 마이페이지 읽은 책 취향 분석 결과
export interface CategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
  percentage: number;
}

export interface AuthorStats {
  author: string;
  count: number;
  averageRating: number;
}

export interface PublisherStats {
  publisher: string;
  count: number;
  averageRating: number;
}

export interface FullCategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
}

export interface LibraryStats {
  totalBooks: number;
  overallAverageRating: number;
  preferredCategories: CategoryStats[];
  allCategoryStats: FullCategoryStats[];
  preferredAuthors: AuthorStats[];
  preferredPublishers: PublisherStats[];
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

// 4.13 개인 서재 책 추가/수정 요청 DTO
export interface UpsertMyLibraryRequest {
  isbn13: string;
  status: string; // ReadingStatus Enum (WANT_TO_READ, READING, COMPLETED)
  myRating?: number | null;
}

// =========================================================
// 사용자 정의 에러 타입
// =========================================================

export class AuthRequiredError extends Error {
  constructor(message: string = "로그인 후 이용 가능합니다.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}
