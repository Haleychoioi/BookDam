import { Link } from "react-router-dom";
import type { Comment } from "../../types";
import { useState } from "react";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

interface CommentItemProps {
  comment: Comment;
  postLink?: string;
  onAddReply: (parentId: string, content: string) => void;
  currentUserId: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postLink,
  onAddReply,
  currentUserId,
}) => {
  console.log(
    `[CommentItem] Rendering comment: ${comment.id}, depth: ${
      comment.depth
    }, parentId: ${comment.parentId || "none"}, has replies: ${
      comment.replies && comment.replies.length > 0
    }`
  );

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedCommentContent, setEditedCommentContent] = useState(
    comment.content
  );
  const isAuthor = comment.authorId === currentUserId;

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
  };

  const handleReplySubmit = (content: string) => {
    onAddReply(comment.id, content);
    setShowReplyInput(false);
  };

  const handleCancelReply = () => {
    setShowReplyInput(false);
  };

  const handleEditComment = () => {
    if (comment.authorId !== currentUserId) {
      alert("댓글 작성자만 수정할 수 있습니다.");
      return;
    }
    setIsEditingComment(true);
    setEditedCommentContent(comment.content);
  };

  const handleSaveEditedComment = () => {
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

    console.log(`댓글 ${comment.id} 수정 완료:`, trimmedContent);

    comment.content = trimmedContent;
    comment.isEdited = true;
    comment.updatedAt = new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setIsEditingComment(false);
  };

  const handleCancelEditComment = () => {
    setIsEditingComment(false);
    setEditedCommentContent(comment.content);
  };

  const handleDeleteComment = () => {
    if (comment.authorId !== currentUserId) {
      alert("댓글 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      console.log(`Delete comment ${comment.id}`);
      alert("댓글이 삭제되었습니다. (새로고침 시 반영)");
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

  const paddingLeft = comment.depth ? `${comment.depth * 20}px` : "0px";

  const canReply = (comment.depth || 0) < 1;

  const DEFAULT_AVATAR_URL = "https://via.placeholder.com/40?text=User";

  return (
    <OuterWrapper>
      <div
        className="mb-2 border-t border-gray-300 last:border-b-0 p-8"
        style={{ paddingLeft }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <img
              src={comment.authorProfileImage || DEFAULT_AVATAR_URL}
              alt={comment.author}
              className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-200"
            />
            <span className="font-semibold text-gray-700">
              {comment.author}
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            {comment.createdAt}
            {comment.isEdited && " (수정됨)"}
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
              <button onClick={handleEditComment} className="hover:text-main">
                수정
              </button>
              <button onClick={handleDeleteComment} className="hover:text-main">
                삭제
              </button>
            </>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-4 ml-6">
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

        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <div className="mt-4">
            <CommentList
              comments={comment.replies}
              depth={(comment.depth || 0) + 1}
              onAddReply={onAddReply}
              currentUserId={currentUserId}
            />
          </div>
        )}

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
