import { Link } from "react-router-dom";
import type { Post } from "../../types";

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="border-t border-gray-200 mt-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/posts/${post.id}`}
          className="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          <div>
            <span className="text-md text-gray-800 font-medium mr-3">
              {post.title}
            </span>
            <span className="text-gray-500 text-base">
              ({post.commentCount})
            </span>
          </div>
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

export default PostList;
