// src/components/posts/PostList.tsx

import { Link } from "react-router-dom";

import type { Post, TeamPost } from "../../types";

interface PostListProps {
  posts: (Post | TeamPost)[];
  onPostClick: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  return (
    <div className="border-t border-gray-300">
      {posts.map((post) => {
        const postId = "postId" in post ? post.postId : post.teamPostId;
        const commentCount = post._count?.comments || 0;

        return (
          <Link
            key={postId}
            to={
              "teamPostId" in post
                ? `/communities/${post.teamId}/posts/${post.teamPostId}`
                : `/posts/${post.postId}`
            }
            onClick={(e) => {
              e.preventDefault();
              onPostClick(postId);
            }}
            className="flex justify-between items-center pl-5 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div>
              <span className="text-md text-gray-800 font-medium mr-3">
                {post.title}
              </span>
              <span className="text-gray-500 text-base">({commentCount})</span>
            </div>
          </Link>
        );
      })}
      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          아직 게시글이 없습니다.
        </p>
      )}
    </div>
  );
};

export default PostList;
