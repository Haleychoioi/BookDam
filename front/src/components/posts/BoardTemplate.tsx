// src/components/posts/BoardTemplate.tsx

import React from "react";
import PostList from "./PostList";
import Button from "../common/Button";
// TeamPostType 임포트를 제거합니다.
import type { TeamPost /*, TeamPostType */ } from "../../types";

interface BoardTemplateProps {
  title: string;
  posts: TeamPost[];
  onWriteClick: () => void;
  onPostClick: (postId: number) => void;
  isLoading: boolean;
  // postType prop도 이미 제거되었습니다.
}

const BoardTemplate: React.FC<BoardTemplateProps> = ({
  title,
  posts,
  onWriteClick,
  onPostClick,
  isLoading,
}) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {title}
      </h1>
      <div className="flex justify-end mb-4">
        <Button onClick={onWriteClick}>글쓰기</Button>
      </div>
      {isLoading ? (
        <div className="text-center text-gray-600">게시물을 불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600">게시물이 없습니다.</div>
      ) : (
        <PostList posts={posts} onPostClick={onPostClick} />
      )}
    </div>
  );
};

export default BoardTemplate;
