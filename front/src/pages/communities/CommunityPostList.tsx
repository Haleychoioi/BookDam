// front/src/components/communities/CommunityPostList.tsx

import React from "react";
import { Link } from "react-router-dom";

// 게시글 데이터 인터페이스 (CommunityBoardPage와 동일)
interface CommunityPost {
  id: string;
  title: string;
  commentCount: number;
}

interface CommunityPostListProps {
  posts: CommunityPost[]; // 표시할 게시글 목록
  communityId: string; // 게시글 링크 생성에 필요한 커뮤니티 ID
}

const CommunityPostList: React.FC<CommunityPostListProps> = ({
  posts,
  communityId,
}) => {
  return (
    <div className="border-t border-gray-200 mt-4">
      {posts.map((post) => (
        // API 명세에 따라 /posts/:postId로 링크 (App.tsx 라우팅과 일치)
        <Link
          key={post.id}
          to={`/posts/${post.id}`}
          className="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          <span className="text-md text-gray-800 font-medium ml-6">
            {post.title}
          </span>
          <span className="text-gray-500 text-base mr-6">
            ({post.commentCount})
          </span>
        </Link>
      ))}
      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          아직 게시글이 없습니다.
        </p>
      )}
    </div>
  );
};

export default CommunityPostList;
