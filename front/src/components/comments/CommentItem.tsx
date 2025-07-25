import { Link } from "react-router-dom";
import type { Comment } from "../../types";

interface CommentItemProps {
  comment: Comment;
  postLink?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postLink }) => {
  const OuterWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (postLink) {
      return (
        <Link
          to={postLink}
          className="block hover:bg-gray-50 transition-colors duration-200 rounded-lg"
        >
          {children}
        </Link>
      );
    }

    return (
      <div className="block bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg">
        {children}
      </div>
    );
  };

  return (
    <OuterWrapper>
      <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-gray-700">{comment.author}</span>
          <span className="text-gray-500 text-sm">{comment.createdAt}</span>
        </div>

        <p className="text-gray-800 mb-2 whitespace-pre-wrap">
          {comment.content}
        </p>

        {postLink && (
          <p className="text-sm text-main mt-2">
            <span className="font-medium">원문:</span> {comment.postTitle}
          </p>
        )}
      </div>
    </OuterWrapper>
  );
};

export default CommentItem;
