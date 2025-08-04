// src/components/comments/CommentInput.tsx

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import Button from "../common/Button";

interface CommentInputProps {
  onAddComment: (content: string) => void;
  placeholder?: string;
  onCancel?: () => void;
}

const CommentInput = forwardRef<HTMLTextAreaElement, CommentInputProps>(
  ({ onAddComment, placeholder = "댓글을 작성해보세요", onCancel }, ref) => {
    const [commentContent, setCommentContent] = useState("");
    const innerRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => innerRef.current!);

    const handleSubmit = () => {
      if (commentContent.trim()) {
        onAddComment(commentContent);
        setCommentContent("");
        innerRef.current?.blur();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setCommentContent(""); // 입력 내용 지우기
        innerRef.current?.blur(); // 포커스 해제
        if (onCancel) {
          onCancel(); // 부모 컴포넌트의 취소 함수 호출
        }
      }
    };

    return (
      <div className="mb-6 flex flex-col sm:flex-row items-end sm:items-stretch">
        <textarea
          ref={innerRef}
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent mr-0 sm:mr-2 mb-2 sm:mb-0"
          rows={3}
          placeholder={placeholder}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          onKeyDown={handleKeyDown}
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
  }
);

export default CommentInput;
