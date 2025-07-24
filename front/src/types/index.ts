// =========================================================
// 1. 기본 엔티티 타입 (Core Entities)
// =========================================================

// 1.1 사용자 프로필 타입 (기본 사용자 정보)
export interface UserProfile {
  nickname: string;
  introduction: string;
}

// 1.2 도서 기본 타입
export interface Book {
  id: string;
  coverImage: string; // 필수
  title: string;
  author: string;
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
  authorId: string; // 게시물 작성자 ID
  content: string; // 게시물 본문 내용
}

// 1.4 댓글 기본 타입
export interface Comment {
  id: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  content: string;
  isEdited?: boolean;
  postId: string; // 댓글이 달린 게시물 ID
  postTitle: string; // 댓글이 달린 게시물 제목
  postType: "community" | "general"; // 게시물 타입 ('community' 또는 'general')
  communityId?: string; // 커뮤니티 게시물인 경우 커뮤니티 ID (선택적)
}

// =========================================================
// 2. 기본 엔티티의 상세/확장 타입 (Extended Entities)
// =========================================================

// 2.1 도서 상세 정보 타입 (Book을 확장)
export interface BookDetail extends Book {
  publisher: string;
  publicationDate: string; // "YYYY-MM-DD" 형식
  description: string;
  communityCount: number;
  isWished: boolean;
  genre: string;
  summary: string;
  tableOfContents: string[];
  commentaryContent: string;
  averageRating: number;
  recommendedBooks?: Book[]; // optional (있을 수도 없을 수도 있음)
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
