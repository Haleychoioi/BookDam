// src/components/comments/CommentItem.tsx

import React, { useState, useRef, memo } from "react";
import { Link } from "react-router-dom";
import type { Comment, TeamComment } from "../../types";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import { formatKoreanDateTime } from "../../utils/dateFormatter";

// Helper function to safely get the comment ID
const getCommentIdentifier = (c: Comment | TeamComment): number => {
  if ("commentId" in c && typeof c.commentId === "number") {
    return c.commentId;
  }
  if ("teamCommentId" in c && typeof c.teamCommentId === "number") {
    return c.teamCommentId;
  }
  return 0;
};

interface CommentItemProps {
  comment: Comment | TeamComment;
  postLink?: string;
  onAddReply: (parentId: number, content: string) => Promise<void>;
  currentUserId: number;
  onEditComment: (commentId: number, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = memo(
  ({
    comment,
    postLink,
    onAddReply,
    currentUserId,
    onEditComment,
    onDeleteComment,
  }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [editedCommentContent, setEditedContent] = useState(comment.content);
    const isAuthor = comment.userId === currentUserId;

    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    console.log(
      `[CommentItem Render] ID: ${getCommentIdentifier(
        comment
      )}, isEditing: ${isEditingComment}`
    ); // 디버깅 로그 유지

    const handleReplyClick = () => {
      setShowReplyInput((prev) => {
        const newState = !prev;
        if (newState) {
          setTimeout(() => {
            replyInputRef.current?.focus();
          }, 0);
        }
        return newState;
      });
    };

    const handleReplySubmit = async (content: string) => {
      const commentActualId = getCommentIdentifier(comment);
      await onAddReply(commentActualId, content);
      setShowReplyInput(false);
    };

    const handleCancelReply = () => {
      setShowReplyInput(false);
    };

    const handleEditCommentClick = () => {
      if (comment.userId !== currentUserId) {
        alert("댓글 작성자만 수정할 수 있습니다.");
        return;
      }
      setIsEditingComment(true);
      setEditedContent(comment.content);

      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          const length = editedCommentContent.length;
          editInputRef.current.setSelectionRange(length, length);
          console.log(
            `[CommentItem Focus] ID: ${getCommentIdentifier(comment)}, Focused`
          ); // 디버깅 로그 유지
        }
      }, 0);
    };

    const handleSaveEditedComment = async () => {
      const trimmedContent = editedCommentContent.trim();
      if (!trimmedContent) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }
      if (trimmedContent === comment.content.trim()) {
        alert("수정된 내용이 없습니다.");
        setIsEditingComment(false);
        return;
      }

      const commentActualId = getCommentIdentifier(comment);
      await onEditComment(commentActualId, trimmedContent);
      setIsEditingComment(false);
    };

    const handleCancelEditComment = () => {
      setIsEditingComment(false);
      setEditedContent(comment.content);
    };

    const handleDeleteCommentClick = async () => {
      if (comment.userId !== currentUserId) {
        alert("댓글 작성자만 삭제할 수 있습니다.");
        return;
      }

      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        const commentActualId = getCommentIdentifier(comment);
        await onDeleteComment(commentActualId);
      }
    };

    const OuterWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => {
      if (postLink) {
        return (
          <Link to={postLink} className="block rounded-lg">
            {children}
          </Link>
        );
      }
      return <div className="block rounded-lg">{children}</div>;
    };

    const indentationClass = comment.depth ? `ml-${comment.depth * 8}` : "ml-0";
    const basePadding = "p-4";

    const canReply = (comment.depth || 0) < 1;

    const getProfileImageUrl = (): string => {
      if (comment.user?.profileImage) {
        return comment.user.profileImage;
      }
      const encodedNickname = encodeURIComponent(
        comment.user?.nickname || "Guest"
      );
      return `https://api.dicebear.com/8.x/identicon/svg?seed=${encodedNickname}`;
    };

    return (
      <OuterWrapper>
        <div className={`mb-2 ${basePadding} ${indentationClass}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <img
                src={getProfileImageUrl()}
                alt={comment.user?.nickname || "작성자"}
                className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-200"
              />
              <span className="font-semibold text-gray-700">
                {comment.user?.nickname || "작성자"}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              {comment.updatedAt && comment.updatedAt !== comment.createdAt
                ? "수정일: "
                : "게시일: "}
              {formatKoreanDateTime(
                comment.updatedAt && comment.updatedAt !== comment.createdAt
                  ? comment.updatedAt
                  : comment.createdAt
              )}
            </span>
          </div>

          {isEditingComment ? (
            <div key="edit-comment-input-container" className="mt-2">
              <textarea
                key={`edit-textarea-${getCommentIdentifier(comment)}`} // ✨ textarea에 고유한 key 추가 ✨
                ref={editInputRef}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-main"
                rows={3}
                value={editedCommentContent}
                onChange={(e) => {
                  setEditedContent(e.target.value);
                  console.log(
                    `[CommentItem Input] ID: ${getCommentIdentifier(
                      comment
                    )}, Value: ${e.target.value}`
                  ); // 디버깅 로그 유지
                }}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleSaveEditedComment}
                  className="px-4 py-2 bg-main text-white rounded-md hover:bg-main-dark transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={handleCancelEditComment}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p
              key="display-comment-content"
              className="text-gray-800 mb-2 whitespace-pre-wrap mt-2"
            >
              {comment.content}
            </p>
          )}

          <div className="flex text-sm text-gray-600 space-x-4">
            {!isEditingComment && canReply && (
              <button onClick={handleReplyClick} className="hover:text-main">
                답글
              </button>
            )}
            {!isEditingComment && isAuthor && (
              <>
                <button
                  onClick={handleEditCommentClick}
                  className="hover:text-main"
                >
                  수정
                </button>
                <button
                  onClick={handleDeleteCommentClick}
                  className="hover:text-main"
                >
                  삭제
                </button>
              </>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-4">
              <CommentInput
                ref={replyInputRef}
                onAddComment={handleReplySubmit}
                placeholder="답글을 작성하세요..."
                onCancel={handleCancelReply}
              />

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="mt-4">
              <CommentList
                comments={comment.replies as (Comment | TeamComment)[]}
                depth={(comment.depth || 0) + 1}
                onAddReply={onAddReply}
                currentUserId={currentUserId}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
              />
            </div>
          )}

          {postLink && comment.postTitle && (
            <p className="text-sm text-main mt-2">
              <span className="font-medium">원문:</span> {comment.postTitle}
            </p>
          )}
        </div>
      </OuterWrapper>
    );
  }
);

export default CommentItem;
