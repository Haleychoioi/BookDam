// front/src/components/comments/CommentInput.tsx

import React, { useState } from "react";
import Button from "../common/Button";

interface CommentInputProps {
  onAddComment: (content: string) => void;
  placeholder?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onAddComment,
  placeholder = "댓글을 작성해보세요",
}) => {
  const [commentContent, setCommentContent] = useState("");

  const handleSubmit = () => {
    if (commentContent.trim()) {
      onAddComment(commentContent);
      setCommentContent(""); // 입력창 초기화
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-end sm:items-stretch">
      <textarea
        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent mr-0 sm:mr-2 mb-2 sm:mb-0"
        rows={3}
        placeholder={placeholder}
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
      ></textarea>
      <Button
        onClick={handleSubmit}
        bgColor="bg-main"
        textColor="text-white"
        hoverBgColor="hover:bg-apply"
        className="px-6 py-3 rounded-md w-full sm:w-auto"
      >
        작성
      </Button>
    </div>
  );
};

export default CommentInput;
