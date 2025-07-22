import React from "react";
import Button from "../common/Button";
import Pagination from "../common/Pagination";
import PostList from "../posts/PostList";
import type { Post } from "../../types";

interface BoardTemplateProps {
  // 동적으로 변경될 수 있는 내용들
  bookTitle?: string; // ✨ 선택적으로 변경 (전체 게시판에서 안 쓸 수 있도록) ✨
  communityTopic?: string; // ✨ 선택적으로 변경 (전체 게시판에서 안 쓸 수 있도록) ✨
  posts: Post[]; // PostList에 전달할 게시글 데이터
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void; // 게시물 작성 버튼 클릭 핸들러
  boardTitle: string; // "게시글"과 같은 섹션 제목
  headerContent?: React.ReactNode; // ✨ 추가: 커스텀 헤더 내용을 받을 수 있도록 ✨
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
  headerContent,
}) => {
  return (
    <div className="min-h-full py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {/* ✨ headerContent가 있으면 그것을 렌더링하고, 없으면 기존 bookTitle/communityTopic 사용 ✨ */}
        {headerContent ? (
          <div className="mb-36 mt-24">{headerContent}</div>
        ) : (
          <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-36 mt-24">
            {communityTopic && bookTitle
              ? `${communityTopic} | ${bookTitle}`
              : communityTopic || bookTitle}
          </h1>
        )}

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
