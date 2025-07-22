// front/src/components/posts/PostWriteTemplate.tsx

import React from "react";
import Button from "../common/Button";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import remarkGfm from "remark-gfm"; // GitHub Flavored Markdown 지원

interface PostWriteTemplateProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  content: string;
  onContentChange: (newValue: string | undefined) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  pageTitle: string; // "새 글 쓰기"와 같은 페이지 제목
  submitButtonText: string; // "작성 완료" 또는 "수정 완료"
}

const PostWriteTemplate: React.FC<PostWriteTemplateProps> = ({
  title,
  onTitleChange,
  content,
  onContentChange,
  onSubmit,
  onCancel,
  loading,
  error,
  pageTitle,
  submitButtonText,
}) => {
  return (
    <div className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        <h1 className="text-3xl text-gray-800 text-center mb-8">{pageTitle}</h1>

        {/* ✨ 에러 메시지 표시 영역 추가 ✨ */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            value={title}
            onChange={onTitleChange}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="mb-8" data-color-mode="light">
          <label
            htmlFor="content"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            내용
          </label>
          <MDEditor
            value={content}
            onChange={onContentChange}
            height={400}
            preview="live"
            previewOptions={{
              remarkPlugins: [[remarkGfm]],
            }}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            bgColor="bg-gray-400"
            textColor="text-white"
            hoverBgColor="hover:bg-gray-500"
          >
            취소
          </Button>
          <Button
            onClick={onSubmit}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            disabled={loading}
          >
            {loading ? "처리 중..." : submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostWriteTemplate;
