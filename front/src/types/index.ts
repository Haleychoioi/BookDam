export interface Post {
  id: string;
  title: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  author: string; // 표시되는 작성자 이름
  authorId: string; // ✨ 작성자 고유 ID 추가 ✨
  createdAt: string;
  content: string;
  isEdited?: boolean; // 수정되었는지 여부 (선택 사항)
}

export interface Community {
  id: string; // id를 string으로 통일
  title: string;
  description: string;
  hostName?: string; // BookCommunity에만 있는 필드일 경우 선택사항으로
  currentMembers?: number;
  maxMembers?: number;
}
