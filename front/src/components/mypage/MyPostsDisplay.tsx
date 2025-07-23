// front/src/components/mypage/MyPostsDisplay.tsx

import React from "react";
import Pagination from "../common/Pagination";
import PostList from "../posts/PostList";
import type { Post } from "../../types";

interface MyPostsDisplayProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MyPostsDisplay: React.FC<MyPostsDisplayProps> = ({
  posts,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">작성한 글이 없습니다.</p>
      ) : (
        <PostList posts={posts} />
      )}

      {posts.length > 0 && ( // 결과가 있을 때만 페이지네이션 표시
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default MyPostsDisplay;
