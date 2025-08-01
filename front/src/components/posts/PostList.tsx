// src/components/posts/PostList.tsx

import React from "react";
// 필요한 타입들을 import 합니다.
// TeamPost, Post는 형식으로만 사용되므로 'import type' 사용
import type { TeamPost, Post } from "../../types";
// TeamPostType, PostType은 enum으로 런타임 값으로도 사용되므로 일반 'import' 사용
import { TeamPostType, PostType } from "../../types";

interface PostListProps {
  posts: (Post | TeamPost)[];
  onPostClick: (postId: number) => void;
  // 'postType' prop을 여기서 제거합니다.
  // postType?: TeamPostType | PostType; // <-- 이 줄을 제거합니다.
}

// postType을 props 목록에서 제거합니다.
const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const id = "teamPostId" in post ? post.teamPostId : post.postId;
        const nickname = post.user?.nickname;

        // isNotice와 isRecruiting 판단 로직은 post 객체 내부의 type 속성을 직접 확인합니다.
        const isNotice =
          "type" in post && (post as TeamPost).type === TeamPostType.NOTICE;
        const isRecruiting =
          "type" in post &&
          "postId" in post &&
          (post as Post).type === PostType.RECRUITMENT;

        return (
          <div
            key={id}
            className="p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => onPostClick(id)}
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {post.title}
            </h2>
            <p className="text-gray-600 truncate">{post.content}</p>
            <div className="text-sm text-gray-500 mt-2">
              작성자: {nickname} | 댓글: {post._count?.comments || 0}개
              {isNotice && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  공지
                </span>
              )}
              {isRecruiting && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  모집 중
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
