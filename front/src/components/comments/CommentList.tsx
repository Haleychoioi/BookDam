import CommentItem from "./CommentItem";
import type { Comment } from "../../types";

interface CommentListProps {
  comments: Comment[];
  depth?: number;
  currentUserId: number;
  onAddReply: (parentId: string, content: string) => void;
}

const buildCommentTree = (
  flatComments: Comment[],
  parentId: string | null = null,
  currentDepth: number
) => {
  const nestedComments: Comment[] = [];

  flatComments
    .filter((comment) => (comment.parentId || null) === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .forEach((comment) => {
      comment.depth = currentDepth;
      if (currentDepth < 1) {
        comment.replies = buildCommentTree(
          flatComments,
          comment.id,
          currentDepth + 1
        );
      } else {
        comment.replies = [];
      }
      nestedComments.push(comment);
    });
  return nestedComments;
};

const CommentList: React.FC<CommentListProps> = ({
  comments,
  depth = 0,
  onAddReply,
  currentUserId,
}) => {
  const topLevelComments = buildCommentTree(comments, null, depth);

  return (
    <div className="border-t border-gray-200 pt-6">
      {topLevelComments.length === 0 && depth === 0 ? (
        <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
      ) : (
        topLevelComments.map((comment) => (
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
