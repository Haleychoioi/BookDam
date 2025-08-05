// src/components/posts/PostList.tsx

import { Link } from "react-router-dom";

import type { Post, TeamPost } from "../../types";

interface PostListProps {
  posts: (Post | TeamPost)[];
  onPostClick: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  // 타입 라벨 계산 함수 (Post만 처리)
  const getTypeLabel = (post: Post | TeamPost) => {
    // TeamPost는 여기서 처리하지 않음 (일반 게시판에서는 나오지 않음)
    const postWithType = post as Post;
    return postWithType.type === "RECRUITMENT" ? "모집글" : "일반글";
  };

  // 배지 스타일 클래스 계산 함수 (Post만 처리)
  const getBadgeClass = (post: Post | TeamPost) => {
    const postWithType = post as Post;
    return postWithType.type === "RECRUITMENT" 
      ? "recruitment-badge"  // 모집글 - 커스텀 노랑색
      : "bg-gray-100 text-gray-800";     // 일반글
  };

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
            <div className="flex items-center">
              {/* 팀 게시글이 아닐 때만 배지 표시 */}
              {"postId" in post && (
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-3`}
                  style={
                    (post as Post).type === "RECRUITMENT" 
                      ? { backgroundColor: '#fef3cd', color: '#856404' }
                      : { backgroundColor: '#f3f4f6', color: '#374151' }
                  }
                >
                  {getTypeLabel(post)}
                </span>
              )}
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