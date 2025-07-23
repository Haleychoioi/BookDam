export interface Post {
  id: string;
  title: string;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  type: "community" | "general"; // 'community' 또는 'general'
}

export interface Comment {
  id: string;
  author: string; // 표시되는 작성자 이름
  authorId: string; // ✨ 작성자 고유 ID 추가 ✨
  createdAt: string;
  content: string;
  isEdited?: boolean; // 수정되었는지 여부 (선택 사항)
  postId: string; // ✨ 추가: 댓글이 달린 게시물 ID ✨
  postTitle: string; // ✨ 추가: 댓글이 달린 게시물 제목 ✨
  postType: "community" | "general"; // ✨ 추가: 게시물 타입 ('community' 또는 'general') ✨
  communityId?: string; // ✨ 추가: communityId (선택적) ✨
}

export interface Community {
  id: string; // id를 string으로 통일
  title: string;
  description: string;
  hostName?: string; // BookCommunity에만 있는 필드일 경우 선택사항으로
  currentMembers?: number;
  maxMembers?: number;
}

export interface RecruitableCommunity {
  id: string;
  title: string;
  description: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
  status: "모집중" | "모집종료";
}

export interface Applicant {
  id: string;
  nickname: string; // 신청자 닉네임
  appliedAt: string; // 신청일시 (ISO 8601 string)
  applicationMessage: string; // ✨ 신청 메시지 추가 ✨
}

export interface ApplicantWithStatus extends Applicant {
  status: "pending" | "accepted" | "rejected";
}

export interface CommunityHistoryEntry {
  communityId: string;
  communityName: string;
  role: "호스트" | "멤버";
  startDate: string; // 참여 시작일 (YYYY-MM-DD)
  endDate: string | null; // 참여 종료일 (YYYY-MM-DD), 현재 참여중이면 null
  status: "활동중" | "종료됨";
}

export interface AppliedCommunity {
  id: string;
  title: string;
  description: string;
  hostName: string;
  currentMembers?: number; // 모집 중인 커뮤니티에서만 의미 있을 수 있으므로 선택 사항
  maxMembers?: number; // 모집 중인 커뮤니티에서만 의미 있을 수 있으므로 선택 사항
  status: "pending" | "accepted" | "rejected"; // 신청 상태
}

export interface Book {
  id: string;
  coverImage: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  averageRating: number;
  description: string;
  genre: string;
  summary: string;
}

// ✨ BookDetailHeroSectionProps 인터페이스 추가 (또는 BookDetailProps로 더 일반적으로) ✨
export interface BookDetailHeroSectionProps {
  book: Book; // 여기서 위에 정의된 Book 인터페이스를 사용합니다.
  onCreateCommunityClick: (bookId: string) => void;
}
export interface MyLibraryBook extends Book {
  status: "reading" | "read" | "to-read"; // 책의 독서 상태
  myRating?: number;
}
