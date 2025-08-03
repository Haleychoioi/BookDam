// src/types/index.ts

// =========================================================
// 1. 핵심 엔티티 타입 (Core Entities)
// 백엔드 Prisma 모델 및 API 응답에 최대한 맞춰 재정의
// =========================================================

export interface Community {
  id: string; // 커뮤니티 ID (백엔드의 teamId를 string으로 매핑)
  title: string; // 커뮤니티 제목 (백엔드의 postTitle)
  description: string; // 커뮤니티 설명 (백엔드의 postContent)
  hostName: string; // 커뮤니티 호스트 닉네임 (백엔드의 postAuthor)
  hostId: number; // ✨ 새로 추가: 커뮤니티 호스트(팀장)의 userId ✨
  currentMembers: number; // 현재 멤버 수
  maxMembers: number; // 최대 멤버 수
  role: "host" | "member"; // 현재 사용자의 커뮤니티 내 역할 (로그인된 사용자 기준)
  status: "모집중" | "모집종료"; // 프론트엔드에서 표시할 모집 상태
  createdAt: string; // ✨ 추가: 생성일시 ✨
  hasApplied?: boolean; // ✨ 이 줄을 추가합니다: hasApplied 필드 추가 ✨
}

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
  toc: string | null;
  story: string | null;
  createdAt: string;
  // 다음 두 속성을 추가합니다.
  bestRank: number | null;
  seriesInfo: {
    seriesId: number;
    seriesName: string;
  } | null;
}

// 1.3 TeamPostType Enum (팀 게시물 타입)
enum TeamPostType { // 'export' 키워드 제거
  DISCUSSION = "DISCUSSION",
  NOTICE = "NOTICE",
}

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

export interface TeamApplication {
  applicationId: number;
  userId: number;
  postId: number;
  applicationMessage: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  processedAt: string | null;
}

export interface CommunityWithMemberInfo extends TeamCommunity {
  currentMembers: number; // 현재 멤버 수 (필수)
  maxMembers: number; // 최대 멤버 수 (필수)
}

export interface TeamCommunityWithBookTitle extends TeamCommunity {
  bookTitle: string | null;
}

// 1.6 PostType Enum (일반 게시물 타입)
enum PostType { // 'export' 키워드 제거
  GENERAL = "GENERAL",
  RECRUITMENT = "RECRUITMENT",
}

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
  replies?: (Comment | TeamComment)[];
  depth?: number;
  postTitle?: string;
  postType?: string;
  communityId?: string;
}

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
  replies?: (Comment | TeamComment)[];
  depth?: number;
  postTitle?: string;
  postType?: string;
  communityId?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string; // UserRole enum 대신 string으로 일반화
  iat?: number;
  exp?: number;
}

// =========================================================
// 2. 알라딘 API 관련 Enum (as const 제거, 일반 enum으로 선언)
// 'export' 키워드 제거
// =========================================================

enum AladinQueryType { // 'export' 키워드 제거
  KEYWORD = "Keyword",
  TITLE = "Title",
  AUTHOR = "Author",
  PUBLISHER = "Publisher",
}

enum AladinSearchTarget { // 'export' 키워드 제거
  BOOK = "Book",
  FOREIGN = "Foreign",
  EBOOK = "eBook",
  ALL = "All",
}

enum AladinSortType { // 'export' 키워드 제거
  ACCURACY = "Accuracy",
  PUBLISH_TIME = "PublishTime",
  TITLE = "Title",
  SALES_POINT = "SalesPoint",
  CUSTOMER_RATING = "CustomerRating",
  MY_REVIEW_COUNT = "MyReviewCount",
}

enum AladinListType { // 'export' 키워드 제거
  NEW_ALL = "ItemNewAll",
  NEW_SPECIAL = "ItemNewSpecial",
  EDITOR_CHOICE = "ItemEditorChoice",
  BESTSELLER = "Bestseller",
  BLOG_BEST = "BlogBest",
}

enum AladinCoverSize { // 'export' 키워드 제거
  BIG = "Big",
  MID_BIG = "MidBig",
  MID = "Mid",
  SMALL = "Small",
  MINI = "Mini",
  NONE = "None",
}

enum AladinOutputType { // 'export' 키워드 제거
  XML = "XML",
  JS = "JS",
}

enum AladinItemIdType { // 'export' 키워드 제거
  ISBN = "ISBN",
  ISBN13 = "ISBN13",
  ITEM_ID = "ItemId",
}

// =========================================================
// 3. 알라딘 API 응답 관련 타입들
// =========================================================

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

  seriesInfo?: {
    seriesId: number;
    seriesLink: string;
    seriesName: string;
  };

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

export interface BookSummary {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  cover: string | null;
  category: string | null;
  description: string | null;
}

export interface BookDetail extends BookSummary {
  pageCount: number | null;
  toc: string[] | null; // 목차
  fullDescription: string | null; // 상세 설명
  bestRank: number | null; // 베스트셀러 순위
  seriesInfo: {
    seriesId: number;
    seriesName: string;
  } | null;
  isWished: boolean; // 이 줄을 추가합니다. (찜하기 여부)
}

export interface MyLibraryBook {
  libraryId: number;
  status: string; // ReadingStatus Enum 대신 string으로 일반화
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
}

export interface ApplicantWithStatus {
  id: string; // 프론트엔드용 ID, applicationId를 string으로 변환하여 사용
  applicationId: number; // 백엔드 응답 필드
  userId: number; // 백엔드 응답 필드
  nickname: string;
  appliedAt: string;
  applicationMessage: string;
  status: "pending" | "accepted" | "rejected";
}

export interface CommunityHistoryEntry {
  communityName: string;
  role: string; // "host" | "member"
  startDate: string;
  endDate?: string;
  status: string; // "활동중" | "활동종료"
}

export interface AppliedCommunity extends Community {
  myApplicationStatus: string; // "pending" | "accepted" | "rejected"
}

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

export interface UpdateUserData {
  nickname?: string;
  introduction?: string;
  profileImage?: string; // 파일 URL 또는 'true' (기본 이미지로 변경)
  deleteProfileImage?: string; // 'true'일 경우 기본 이미지로 변경
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AddWishListRequest {
  isbn13: string;
}

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

// 파일 하단에 모든 enum들을 한 번에 내보냅니다.
export {
  TeamPostType,
  PostType,
  AladinQueryType,
  AladinSearchTarget,
  AladinSortType,
  AladinListType,
  AladinCoverSize,
  AladinOutputType,
  AladinItemIdType,
};
