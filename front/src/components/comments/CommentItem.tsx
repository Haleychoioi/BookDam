import React, { useState } from "react"; // ✨ KeyboardEvent는 React에서 바로 가져옵니다. ✨
import Button from "../common/Button";
import type { Comment } from "../../types";

interface CommentItemProps {
  comment: Comment;
  onUpdateComment: (commentId: string, newContent: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const isCommentAuthor = comment.authorId === currentUserId;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(comment.content); // 원본 내용으로 복원
  };

  const handleSaveClick = () => {
    const trimmedEditedContent = editedContent.trim();
    const trimmedOriginalContent = comment.content.trim();

    // 1. 내용이 완전히 비어있을 경우
    if (!trimmedEditedContent) {
      alert("댓글 내용을 입력해주세요.");
      return; // 저장 로직 중단
    }

    // ✨ 2. 수정 내용이 원본과 동일할 경우 ✨
    if (trimmedEditedContent === trimmedOriginalContent) {
      setIsEditing(false); // 수정 모드 종료 (변화 없으므로 저장할 필요 없음)
      return; // 저장 로직 중단
    }

    // 3. 내용이 변경되었고 유효할 경우에만 업데이트 호출
    onUpdateComment(comment.id, trimmedEditedContent);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      onDeleteComment(comment.id);
    }
  };

  // ✨ KeyboardEvent 타입 사용 시, React.KeyboardEvent<HTMLTextAreaElement> ✨
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveClick();
    } else if (e.key === "Escape") {
      handleCancelClick();
    }
  };

  return (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-gray-700">{comment.author}</span>
        <span className="text-gray-500 text-sm">
          {comment.createdAt}
          {comment.isEdited && " (수정됨)"}
        </span>
      </div>
      {isEditing ? (
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent mb-2"
          rows={3}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        ></textarea>
      ) : (
        <p className="text-gray-800 mb-2 whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      {/* ✨ isCommentAuthor 조건에 따라 버튼 렌더링 ✨ */}
      {isCommentAuthor && (
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSaveClick}
                bgColor="bg-blue-500"
                textColor="text-white"
                hoverBgColor="hover:bg-blue-600"
                className="px-3 py-1 text-sm rounded"
              >
                저장
              </Button>
              <Button
                onClick={handleCancelClick}
                bgColor="bg-gray-400"
                textColor="text-white"
                hoverBgColor="hover:bg-gray-500"
                className="px-3 py-1 text-sm rounded"
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEditClick}
                bgColor="bg-gray-200"
                textColor="text-gray-700"
                hoverTextColor="hover:text-gray-800"
                className="text-sm"
              >
                수정
              </Button>
              <Button
                onClick={handleDeleteClick}
                bgColor="bg-gray-200"
                textColor="text-gray-700 hover:text-white"
                hoverBgColor="hover:bg-red-600"
                className="text-sm"
              >
                삭제
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
