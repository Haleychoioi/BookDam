import CommentItem from "./CommentItem";
import type { Comment } from "../../types";

interface CommentListProps {
  comments: Comment[];
  depth?: number;
  currentUserId: number;
  onAddReply: (parentId: string, content: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  depth = 0,
  onAddReply,
  currentUserId,
}) => {
  const commentsToRender = comments;

  return (
    <div>
      {commentsToRender.length === 0 && depth === 0 ? (
        <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
      ) : (
        commentsToRender.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onAddReply={onAddReply}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
