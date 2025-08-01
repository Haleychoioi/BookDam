// src/components/posts/PostForm.tsx

import React, { useState, useEffect } from "react"; // useState, useEffect 임포트
import Button from "../common/Button";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import remarkGfm from "remark-gfm";

// PostType, TeamPostType 임포트 (enum 값으로 사용되므로 일반 import)
import { PostType, TeamPostType } from "../../types";

// onSubmit prop의 타입 시그니처를 변경합니다: 폼 데이터를 인자로 받도록
interface PostWriteTemplateProps {
  onSubmit: (formData: {
    title: string;
    content: string;
    type?: PostType | TeamPostType;
  }) => void; // 타입 변경
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  pageTitle: string;
  submitButtonText: string;
  initialData?: {
    // 초기 데이터 추가 (수정 시 유용)
    title?: string;
    content?: string;
    type?: PostType | TeamPostType;
  };
  isCommunityPost?: boolean; // 커뮤니티 게시물 여부 판단을 위한 프롭 추가
}

const PostWriteTemplate: React.FC<PostWriteTemplateProps> = ({
  onSubmit,
  onCancel,
  loading,
  error,
  pageTitle,
  submitButtonText,
  initialData, // 초기 데이터 받기
  isCommunityPost, // 커뮤니티 게시물 여부 받기
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  // 게시물 타입을 위한 상태 추가 (일반 게시물 기본값: GENERAL, 팀 게시물 기본값: DISCUSSION)
  const [postType, setPostType] = useState<PostType | TeamPostType>(
    isCommunityPost ? TeamPostType.DISCUSSION : PostType.GENERAL
  );

  // 초기 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      if (initialData.type) {
        setPostType(initialData.type);
      } else {
        setPostType(
          isCommunityPost ? TeamPostType.DISCUSSION : PostType.GENERAL
        );
      }
    }
  }, [initialData, isCommunityPost]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (newValue: string | undefined) => {
    setContent(newValue || "");
  };

  const handleSubmitClick = () => {
    // 폼 데이터를 onSubmit 함수에 전달
    onSubmit({ title, content, type: postType });
  };

  return (
    <div className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        <h1 className="text-3xl text-gray-800 text-center mb-8">{pageTitle}</h1>

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
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 게시물 타입 선택 (커뮤니티 게시물일 경우에만 표시) */}
        {isCommunityPost && (
          <div className="mb-6">
            <label
              htmlFor="postType"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              게시물 타입
            </label>
            <select
              id="postType"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
              value={postType}
              onChange={(e) => setPostType(e.target.value as TeamPostType)}
            >
              {Object.values(TeamPostType).map((typeValue) => (
                <option key={typeValue} value={typeValue}>
                  {typeValue === TeamPostType.DISCUSSION ? "토론" : "공지"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-8" data-color-mode="light">
          <label
            htmlFor="content"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            내용
          </label>
          <MDEditor
            value={content}
            onChange={handleContentChange}
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
            onClick={handleSubmitClick} // 변경된 제출 핸들러
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
