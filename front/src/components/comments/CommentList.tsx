import CommentItem from "./CommentItem";
import type { Comment } from "../../types";

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
};

export default CommentList;
