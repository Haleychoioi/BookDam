// src/components/comments/CommentItem.tsx

import { Link } from "react-router-dom";
import type { Comment, TeamComment } from "../../types";
import { useState } from "react";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList"; // 재귀적으로 CommentList 사용
import { formatKoreanDateTime } from "../../utils/dateFormatter"; // ✨ 추가: formatKoreanDateTime 임포트 ✨

interface CommentItemProps {
  comment: Comment | TeamComment;
  postLink?: string;
  onAddReply: (parentId: number, content: string) => Promise<void>;
  currentUserId: number;
  onEditComment: (commentId: number, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postLink,
  onAddReply,
  currentUserId,
  onEditComment,
  onDeleteComment,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedCommentContent, setEditedCommentContent] = useState(
    comment.content
  );
  const isAuthor = comment.userId === currentUserId;

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
  };

  const handleReplySubmit = async (content: string) => {
    const commentActualId =
      "commentId" in comment ? comment.commentId : comment.teamCommentId;
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
    setEditedCommentContent(comment.content);
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

    const commentActualId =
      "commentId" in comment ? comment.commentId : comment.teamCommentId;
    await onEditComment(commentActualId, trimmedContent);
    setIsEditingComment(false);
  };

  const handleCancelEditComment = () => {
    setIsEditingComment(false);
    setEditedCommentContent(comment.content);
  };

  const handleDeleteCommentClick = async () => {
    if (comment.userId !== currentUserId) {
      alert("댓글 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      const commentActualId =
        "commentId" in comment ? comment.commentId : comment.teamCommentId;
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

  // 들여쓰기를 위한 margin-left와 padding-left를 조합
  // depth가 0일 때 (최상위)는 ml-0, p-4. depth가 1일 때 (대댓글)는 ml-8, p-4
  const indentationClass = comment.depth ? `ml-${comment.depth * 8}` : "ml-0"; // Tailwind ml-8, ml-16 등
  const basePadding = "p-4"; // 기본 패딩은 유지

  const canReply = (comment.depth || 0) < 1; // ✨ 추가: canReply 변수 정의 ✨

  const DEFAULT_AVATAR_URL = "https://via.placeholder.com/40?text=User";

  return (
    <OuterWrapper>
      <div className={`mb-2 ${basePadding} ${indentationClass}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <img
              src={comment.user?.profileImage || DEFAULT_AVATAR_URL}
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
          <div className="mt-2">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-main"
              rows={3}
              value={editedCommentContent}
              onChange={(e) => setEditedCommentContent(e.target.value)}
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
          <p className="text-gray-800 mb-2 whitespace-pre-wrap mt-2">
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
              onAddComment={handleReplySubmit}
              placeholder="답글을 작성하세요..."
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

        {/* 대댓글 목록은 CommentList가 받도록 유지 */}
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
};

export default CommentItem;
