import React from "react";
import Button from "../common/Button";
import Pagination from "../common/Pagination";
import PostList from "../posts/PostList";
import type { Post } from "../../types";

interface BoardTemplateProps {
  // 동적으로 변경될 수 있는 내용들
  bookTitle: string; // 커뮤니티 정보 또는 전체 게시판 제목 등
  communityTopic: string;
  posts: Post[]; // PostList에 전달할 게시글 데이터
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void; // 게시물 작성 버튼 클릭 핸들러
  boardTitle: string; // "게시글"과 같은 섹션 제목
}

const BoardTemplate: React.FC<BoardTemplateProps> = ({
  bookTitle,
  communityTopic,
  posts,
  currentPage,
  totalPages,
  onPageChange,
  onWritePostClick,
  boardTitle,
}) => {
  return (
    <div className="min-h-full py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {/* 동적으로 전달받는 헤더 내용 (커뮤니티 정보 또는 전체 게시판 제목) */}
        <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-36 mt-24">
          {communityTopic} | {bookTitle}
        </h1>

        {/* 게시글 목록 및 작성 버튼 */}
        <div className="relative mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {boardTitle}
          </h2>
          <div className="absolute top-0 right-0">
            <Button
              onClick={onWritePostClick}
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="px-5 py-2 rounded-lg text-base"
            >
              게시물 작성
            </Button>
          </div>

          <PostList posts={posts} />
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
