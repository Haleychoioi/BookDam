// src/post2/types.ts

import { 
  PostType, 
  RecruitmentStatus, 
  ApplicationStatus, 
  CommunityStatus, 
  TeamRole,
  TeamPostType
} from "@prisma/client";

// ============ 게시글 관련 타입 ============

// 게시글 생성 요청
export interface CreatePostRequest {
  userId: number;
  title: string;
  content: string;
  type?: PostType; // 기본값: GENERAL
  maxMembers?: number; // RECRUITMENT일 때만 필수
  isbn13?: string;
}

// 게시글 생성 응답
export interface CreatePostResponse {
  postId: number;
  type: PostType;
  recruitmentStatus?: RecruitmentStatus;
  maxMembers?: number;
  isbn13?: string;
}

// 게시글 목록 조회 쿼리
export interface GetPostsQuery extends PaginationOptions {
  boardType?: 'all' | 'general' | 'recruitment'; // 게시판 타입
  recruitmentStatus?: RecruitmentStatus; // 모집 상태 필터
  sort?: 'latest' | 'oldest';
}

// 게시글 상세 정보
export interface PostDetail {
  postId: number;
  userId: number;
  user: {
    nickname: string;
    profileImage?: string;
  };
  type: PostType;
  title: string;
  content: string;
  recruitmentStatus?: RecruitmentStatus;
  maxMembers?: number;
  isbn13?: string;
  book?: {
    title: string;
    author: string;
    cover?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  _count: {
    comments: number;
    applications: number; // 모집글인 경우
  };
  hasTeam?: boolean; // 팀이 생성되었는지 여부
}

// ============ 지원 관련 타입 ============

// 지원 요청
export interface ApplyToPostRequest {
  userId: number;
  applicationMessage: string;
}

// 지원 응답
export interface ApplyToPostResponse {
  applicationId: number;
  status: ApplicationStatus;
  appliedAt: Date;
}

// 지원자 정보
export interface ApplicantInfo {
  applicationId: number;
  userId: number;
  user: {
    nickname: string;
    profileImage?: string;
    introduction?: string;
  };
  applicationMessage: string;
  status: ApplicationStatus;
  appliedAt: Date;
  processedAt?: Date;
}

// 지원자 목록 조회 응답
export interface GetApplicantsResponse {
  applicants: ApplicantInfo[];
  totalCount: number;
  statusCounts: {
    pending: number;
    accepted: number;
    rejected: number;
  };
}

// 지원 처리 요청 (승인/거절)
export interface ProcessApplicationRequest {
  status: Extract<ApplicationStatus, 'ACCEPTED' | 'REJECTED'>;
  requestingUserId: number; // 모집글 작성자 권한 확인용
}

// 지원 처리 응답
export interface ProcessApplicationResponse {
  applicationId: number;
  status: ApplicationStatus;
  processedAt: Date;
}

// ============ 팀 생성 관련 타입 ============

// 팀 생성 요청
export interface CreateTeamRequest {
  requestingUserId: number; // 모집글 작성자 권한 확인용
  isbn13?: string; // 팀에서 읽을 책 (선택사항)
}

// 팀 생성 응답
export interface CreateTeamResponse {
  teamId: number;
  postId: number;
  status: CommunityStatus;
  memberCount: number;
  members: {
    userId: number;
    role: TeamRole;
    user: {
      nickname: string;
      profileImage?: string;
    };
  }[];
}

// ============ 팀 내부 게시글 관련 타입 ============

// 팀 게시글 생성 요청
export interface CreateTeamPostRequest {
  userId: number;
  teamId: number;
  title: string;
  content: string;
  type?: TeamPostType; // 기본값: DISCUSSION
}

// 팀 게시글 생성 응답
export interface CreateTeamPostResponse {
  teamPostId: number;
  type: TeamPostType;
  title: string;
  createdAt: Date;
}

// 팀 게시글 목록 조회 쿼리
export interface GetTeamPostsQuery extends PaginationOptions {
  type?: TeamPostType; // 게시글 타입 필터
  sort?: 'latest' | 'oldest';
  requestingUserId: number; // 권한 확인용
}

// ============ 서비스 내부 타입 ============

// 모집글 생성 데이터
export interface RecruitmentPostData {
  userId: number;
  title: string;
  content: string;
  maxMembers: number;
  isbn13?: string;
}

// 일반글 생성 데이터
export interface GeneralPostData {
  userId: number;
  title: string;
  content: string;
  isbn13?: string;
}

// 지원서 생성 데이터
export interface ApplicationData {
  userId: number;
  postId: number;
  applicationMessage: string;
}

// 팀 생성 데이터
export interface TeamCreationData {
  postId: number;
  isbn13?: string;
  status: CommunityStatus;
  postTitle: string;
  postContent: string;
  postAuthor: string;
  leaderUserId: number;
  memberUserIds: number[];
}

// ============ 쿼리 옵션 ============

// 페이지네이션
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

// 지원자 목록 쿼리
export interface GetApplicantsQuery extends PaginationOptions {
  status?: ApplicationStatus;
  sort?: 'latest' | 'oldest';
}

// 게시판 필터 옵션
export interface BoardFilterOptions {
  boardType: 'all' | 'general' | 'recruitment';
  recruitmentStatus?: RecruitmentStatus;
  hasTeam?: boolean; // 팀 생성 여부로 필터링
}

// ============ 통계 관련 타입 ============

// 모집글 통계
export interface RecruitmentStats {
  totalApplications: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  maxMembers: number;
  canCreateTeam: boolean; // 팀 생성 가능 여부
}

// 게시판 통계
export interface BoardStats {
  totalPosts: number;
  generalPosts: number;
  recruitmentPosts: number;
  recruitingPosts: number; // 모집중인 글
  completedTeams: number; // 완성된 팀
}