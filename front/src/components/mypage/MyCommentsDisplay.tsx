// front/src/components/mypage/MyCommentsDisplay.tsx

import React from "react";
import Pagination from "../common/Pagination";
import CommentItem from "../comments/CommentItem";
import type { Comment } from "../../types"; // Comment 타입 임포트

interface MyCommentsDisplayProps {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // ✨ onUpdateComment, onDeleteComment, currentUserId 프롭스 정의 제거 ✨
  // currentUserId: string;
  // onUpdateComment: (commentId: string, newContent: string) => void;
  // onDeleteComment: (commentId: string) => void;
}

const MyCommentsDisplay: React.FC<MyCommentsDisplayProps> = ({
  comments,
  currentPage,
  totalPages,
  onPageChange,
  // ✨ 프롭스 구조 분해 할당에서 제거 ✨
  // currentUserId,
  // onUpdateComment,
  // onDeleteComment,
}) => {
  // 각 댓글에 대한 게시물 링크 생성 함수
  const getPostLink = (comment: Comment) => {
    // API 명세에 따라 postType을 사용하여 올바른 경로 생성
    // comment.communityId는 Comment 타입에 있을 수 있도록 types/index.ts에 추가됨
    if (comment.postType === "community" && comment.communityId) {
      return `/communities/${comment.communityId}/posts/${comment.postId}`;
    } else {
      return `/posts/${comment.postId}`;
    }
  };

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          작성한 댓글이 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postLink={getPostLink(comment)}
            />
          ))}
        </div>
      )}

      {comments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default MyCommentsDisplay;
