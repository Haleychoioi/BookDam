// src/components/comments/CommentList.tsx

import React, { memo } from "react";
import CommentItem from "./CommentItem";
import type { Comment, TeamComment } from "../../types";

interface CommentListProps {
  comments: (Comment | TeamComment)[];
  depth?: number;
  currentUserId: number;
  onAddReply: (parentId: number, content: string) => Promise<void>;
  onEditComment: (commentId: number, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

const CommentList: React.FC<CommentListProps> = memo(
  ({
    comments,
    depth = 0,
    onAddReply,
    currentUserId,
    onEditComment,
    onDeleteComment,
  }) => {
    const commentsToRender = comments;

    // ✨ 여기: 컴포넌트가 렌더링될 때마다 이 로그가 찍힙니다. ✨
    console.log(
      `[CommentList Render] Depth: ${depth}, Comments count: ${comments.length}`
    );

    return (
      <div>
        {commentsToRender.length === 0 && depth === 0 ? (
          <p className="text-center text-gray-500 py-4">
            아직 댓글이 없습니다.
          </p>
        ) : (
          commentsToRender.map((comment) => (
            <CommentItem
              key={
                "commentId" in comment
                  ? comment.commentId
                  : comment.teamCommentId
              }
              comment={comment}
              onAddReply={onAddReply}
              currentUserId={currentUserId}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))
        )}
      </div>
    );
  }
);

export default CommentList;
