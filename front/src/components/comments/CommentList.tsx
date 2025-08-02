// src/components/comments/CommentList.tsx

import CommentItem from "./CommentItem";
// Comment 대신 (Comment | TeamComment)를 임포트
import type { Comment, TeamComment } from "../../types";

interface CommentListProps {
  comments: (Comment | TeamComment)[]; // ✨ 수정: Comment[] 대신 (Comment | TeamComment)[] ✨
  depth?: number;
  currentUserId: number;
  // onAddReply 시그니처를 PostDetailPage와 일치시킵니다.
  onAddReply: (parentId: number, content: string) => Promise<void>; // ✨ 수정: parentId를 number로, Promise<void> 반환 ✨
  onEditComment: (commentId: number, newContent: string) => Promise<void>; // ✨ 추가: 댓글 수정 핸들러 ✨
  onDeleteComment: (commentId: number) => Promise<void>; // ✨ 추가: 댓글 삭제 핸들러 ✨
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  depth = 0,
  onAddReply,
  currentUserId,
  onEditComment, // ✨ 추가: props로 받기 ✨
  onDeleteComment, // ✨ 추가: props로 받기 ✨
}) => {
  const commentsToRender = comments;

  return (
    <div>
      {commentsToRender.length === 0 && depth === 0 ? (
        <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
      ) : (
        commentsToRender.map((comment) => (
          <CommentItem
            key={
              "commentId" in comment ? comment.commentId : comment.teamCommentId
            } // ✨ 수정: commentId 또는 teamCommentId 사용 ✨
            comment={comment}
            onAddReply={onAddReply}
            currentUserId={currentUserId}
            onEditComment={onEditComment} // ✨ 추가: 전달 ✨
            onDeleteComment={onDeleteComment} // ✨ 추가: 전달 ✨
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
