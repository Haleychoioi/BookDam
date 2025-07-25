import Pagination from "../common/Pagination";
import CommentItem from "../comments/CommentItem";
import type { Comment } from "../../types";

interface MyCommentsDisplayProps {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MyCommentsDisplay: React.FC<MyCommentsDisplayProps> = ({
  comments,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPostLink = (comment: Comment) => {
    // API 명세에 따라 postType을 사용하여 올바른 경로 생성
    if (comment.postType === "community" && comment.communityId) {
      return `/communities/${comment.communityId}/posts/${comment.postId}`;
    } else {
      return `/posts/${comment.postId}`;
    }
  };

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          작성한 댓글이 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postLink={getPostLink(comment)}
            />
          ))}
        </div>
      )}

      {comments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default MyCommentsDisplay;
