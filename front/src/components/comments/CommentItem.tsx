// front/src/components/comments/CommentItem.tsx

import React from "react"; // useState 제거
import type { Comment } from "../../types";
import { Link } from "react-router-dom"; // Link 임포트

interface CommentItemProps {
  comment: Comment;
  postLink?: string; // 댓글이 속한 게시물로 이동할 링크
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postLink }) => {
  // Link 컴포넌트로 감싸기 위한 Wrapper
  // ✨ postLink가 없어도 hover 효과를 주기 위한 div는 유지 ✨
  const OuterWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (postLink) {
      return (
        <Link
          to={postLink}
          className="block hover:bg-gray-50 transition-colors duration-200 rounded-lg"
        >
          {children}
        </Link>
      );
    }
    // postLink가 없을 경우, 단순히 div로 감싸지만, 클릭 가능하지는 않음
    return (
      <div className="block bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg">
        {children}
      </div>
    );
  };

  return (
    <OuterWrapper>
      <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 p-4">
        {/* padding 추가하여 클릭 영역 확보 */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-gray-700">{comment.author}</span>
          <span className="text-gray-500 text-sm">
            {comment.createdAt}
            {/* comment.isEdited && " (수정됨)" 제거 (수정 기능 없으므로) */}
          </span>
        </div>
        {/* ✨ 수정 모드 textarea 제거, 항상 p 태그만 렌더링 ✨ */}
        <p className="text-gray-800 mb-2 whitespace-pre-wrap">
          {comment.content}
        </p>
        {/* ✨ 게시물 제목 표시 (클릭 가능하도록) ✨ */}
        {postLink && (
          <p className="text-sm text-main mt-2">
            <span className="font-medium">원문:</span> {comment.postTitle}
          </p>
        )}
      </div>
    </OuterWrapper>
  );
};

export default CommentItem;
