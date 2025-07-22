// front/src/components/comments/CommentList.tsx

import React from "react";
import CommentItem from "./CommentItem";
import type { Comment } from "../../types";

interface CommentListProps {
  comments: Comment[];
  onUpdateComment: (commentId: string, newContent: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string; // ✨ currentUserId 추가 ✨
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onUpdateComment,
  onDeleteComment,
  currentUserId, // ✨ 프롭스 받기 ✨
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            currentUserId={currentUserId} // ✨ CommentItem에 전달 ✨
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
