// src/components/posts/BoardTemplate.tsx

import PostList from "./PostList";
import Button from "../common/Button";
import Pagination from "../common/Pagination";

import type { Post, TeamPost } from "../../types";

interface BoardTemplateProps {
  posts: (Post | TeamPost)[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void;
  onPostClick: (postId: number) => void;
  boardTitle: string;
  isLoading: boolean;
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
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 mt-10">
          <h1 className="text-3xl font-bold text-gray-800">{boardTitle}</h1>
          <Button
            onClick={onWritePostClick}
            className="px-4 py-2 rounded text-base"
          >
            게시물 작성
          </Button>
        </div>

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
