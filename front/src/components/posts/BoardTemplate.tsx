// src/components/posts/BoardTemplate.tsx

import React from "react";
import PostList from "./PostList";
import Button from "../common/Button";
import Pagination from "../common/Pagination";

// Post와 TeamPost를 모두 Posts prop으로 받을 수 있도록 확장합니다.
import type { Post, TeamPost } from "../../types";

interface BoardTemplateProps {
  // bookTitle, communityTopic, headerContent는 이미지 디자인에서 제거되었으므로 삭제
  posts: (Post | TeamPost)[]; // PostList에 전달할 게시글 데이터
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void; // 게시물 작성 버튼 클릭 핸들러
  onPostClick: (postId: number) => void; // PostList의 게시물 클릭 핸들러
  boardTitle: string; // "게시글"과 같은 섹션 제목
  isLoading: boolean; // 로딩 상태
}

const BoardTemplate: React.FC<BoardTemplateProps> = ({
  posts,
  currentPage,
  totalPages,
  onPageChange,
  onWritePostClick,
  onPostClick,
  boardTitle,
  isLoading,
}) => {
  return (
    <div className="min-h-full py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {/* 게시글 메인 제목 및 작성 버튼 섹션 (사진과 동일하게) */}
        <div className="flex justify-between items-center mb-8 mt-10">
          {" "}
          {/* 이미지와 유사한 마진 조정 */}
          <h1 className="text-3xl font-bold text-gray-800">
            {" "}
            {/* 이미지의 "게시글" 제목 */}
            {boardTitle}
          </h1>
          <Button
            onClick={onWritePostClick}
            bgColor="bg-black" // 이미지에 맞춰 검은색 버튼
            textColor="text-white"
            hoverBgColor="hover:bg-gray-800" // 호버 시 회색
            className="px-4 py-2 rounded text-base" // 이미지와 유사한 패딩, 둥근 모서리
          >
            게시물 작성
          </Button>
        </div>

        {/* 게시글 목록 */}
        <div className="mb-8">
          {isLoading ? (
            <div className="text-center text-gray-600">
              게시물을 불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-600">게시물이 없습니다.</div>
          ) : (
            <PostList posts={posts} onPostClick={onPostClick} />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default BoardTemplate;
