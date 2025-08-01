// src/components/posts/PostList.tsx

import { Link } from "react-router-dom";
// Post와 TeamPost를 모두 Post prop으로 받을 수 있도록 확장합니다.
import type { Post, TeamPost } from "../../types";

interface PostListProps {
  posts: (Post | TeamPost)[];
  onPostClick: (postId: number) => void; // BoardTemplate에서 전달받도록 수정
}

const PostList: React.FC<PostListProps> = ({ posts, onPostClick }) => {
  // onPostClick을 props로 받기
  return (
    <div className="border-t border-gray-300">
      {" "}
      {/* 맨 위 가로선 */}
      {posts.map((post) => {
        // Post와 TeamPost의 ID 필드명이 다르므로 동적으로 접근
        const postId = "postId" in post ? post.postId : post.teamPostId;
        // Comment count는 _count.comments에 있습니다.
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
              // Link의 기본 동작을 막고 onPostClick을 호출 (필요시)
              // 여기서는 Link to가 있으므로 onClick으로 상세페이지 이동 로직은 PostDetailPage에서 관리
              // PostList는 클릭 시 부모에게 알리기만 합니다.
              e.preventDefault(); // Link의 기본 이동 막기 (PostDetailPage에서 로드하도록)
              onPostClick(postId); // 부모 컴포넌트로 게시물 ID 전달
            }}
            className="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div>
              <span className="text-md text-gray-800 font-medium mr-3">
                {post.title}
              </span>
              <span className="text-gray-500 text-base">({commentCount})</span>
            </div>
            {/* 추가 정보가 있다면 여기에 */}
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
