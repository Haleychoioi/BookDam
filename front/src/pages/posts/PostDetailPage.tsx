// src/pages/posts/PostDetailPage.tsx

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import type { Post, Comment, TeamPost, TeamComment } from "../../types";

import CommentInput from "../../components/comments/CommentInput";
import CommentList from "../../components/comments/CommentList";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

// API 임포트 (ESLint 'defined but never used' 경고는 여기서 사용되므로 오탐입니다.)
import { fetchPostById, updatePost, deletePost } from "../../api/posts";
import {
  fetchTeamPostById,
  updateTeamPost,
  deleteTeamPost,
} from "../../api/teamPosts";
import {
  createComment,
  fetchCommentsByPost,
  updateComment,
  deleteComment,
} from "../../api/comments";
import {
  createTeamComment,
  fetchTeamComments,
  updateTeamComment,
  deleteTeamComment,
} from "../../api/teamComments";

const recursivelyAssignDepth = (
  comments: (Comment | TeamComment)[],
  currentDepth: number = 0
): (Comment | TeamComment)[] => {
  return comments.map((comment) => ({
    ...comment,
    depth: currentDepth,
    replies: comment.replies
      ? recursivelyAssignDepth(comment.replies, currentDepth + 1)
      : [],
  }));
};

const PostDetailPage: React.FC = () => {
  const { postId, communityId } = useParams<{
    postId: string;
    communityId?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const [comments, setComments] = useState<(Comment | TeamComment)[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState<string | null>(null);

  const parsedPostId = postId ? Number(postId) : NaN;

  const topCommentInputRef = useRef<HTMLTextAreaElement>(null);

  const isTeamPostPageCalculated = useMemo(() => {
    return location.pathname.startsWith("/communities/");
  }, [location.pathname]);

  const backToBoardPath = useMemo(() => {
    if (isTeamPostPageCalculated) {
      const communityIdFromPath = location.pathname.split("/")[2];
      return communityIdFromPath
        ? `/communities/${communityIdFromPath}/posts`
        : "/posts";
    }
    return "/posts";
  }, [isTeamPostPageCalculated, location.pathname]);

  const backToBoardText = useMemo(() => {
    return isTeamPostPageCalculated ? "커뮤니티 게시판으로" : "전체 게시판으로";
  }, [isTeamPostPageCalculated]);

  const fetchPostDetailQueryFn = useCallback(async (): Promise<
    Post | TeamPost
  > => {
    if (!currentUserProfile) {
      throw new Error("로그인이 필요합니다.");
    }
    if (isNaN(parsedPostId)) {
      throw new Error("유효하지 않은 게시물 ID입니다.");
    }

    if (isTeamPostPageCalculated) {
      if (!communityId) {
        throw new Error("커뮤니티 ID가 유효하지 않습니다.");
      }
      return await fetchTeamPostById(communityId, parsedPostId);
    } else {
      return await fetchPostById(parsedPostId);
    }
  }, [currentUserProfile, parsedPostId, communityId, isTeamPostPageCalculated]);

  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    refetch: refetchPost,
  } = useQuery<Post | TeamPost, Error>({
    queryKey: ["postDetail", parsedPostId, communityId] as const,
    queryFn: fetchPostDetailQueryFn,
    enabled:
      !authLoading &&
      !!currentUserProfile &&
      !isNaN(parsedPostId) &&
      (isTeamPostPageCalculated ? !!communityId : true),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const refetchComments = useCallback(async () => {
    setLoadingComments(true);
    setErrorComments(null);
    try {
      let fetchedComments: (Comment | TeamComment)[];
      if (isTeamPostPageCalculated) {
        const communityIdFromPath = location.pathname.split("/")[2];
        if (!communityIdFromPath)
          throw new Error("커뮤니티 ID가 유효하지 않습니다.");
        fetchedComments = await fetchTeamComments(
          communityIdFromPath,
          parsedPostId
        );
      } else {
        fetchedComments = await fetchCommentsByPost(parsedPostId);
      }
      const commentsWithDepth = recursivelyAssignDepth(fetchedComments);
      setComments(commentsWithDepth);
      console.log("PostDetailPage: comments state updated via refetchComments"); // 디버깅 로그 유지
    } catch (err: unknown) {
      console.error("댓글 목록 새로고침 실패:", err);
      if (err instanceof Error) {
        setErrorComments(err.message || "댓글을 불러오는데 실패했습니다.");
      } else {
        setErrorComments("알 수 없는 오류가 발생했습니다.");
      }
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [parsedPostId, isTeamPostPageCalculated, location.pathname]);

  useEffect(() => {
    if (!isLoadingPost && !isErrorPost && post) {
      setEditedContent(post.content);
      refetchComments();
    }
    if (isErrorPost) {
      console.error("게시물 불러오기 오류 (useEffect):", errorPost);
    }

    window.scrollTo(0, 0);
    setIsEditing(false);
  }, [
    parsedPostId,
    communityId,
    isTeamPostPageCalculated,
    isLoadingPost,
    isErrorPost,
    post,
    refetchComments,
    errorPost,
  ]);

  const isPostAuthor = post
    ? post.userId === currentUserProfile?.userId
    : false;

  console.log(`[PostDetailPage Render]`); // 디버깅 로그 유지

  const handleEditPost = useCallback(() => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post!.userId !== currentUserProfile.userId) {
      alert("게시물 작성자만 수정할 수 있습니다.");
      return;
    }
    setIsEditing(true);
  }, [post, currentUserProfile, authLoading]);

  const handleSavePost = useCallback(
    async (updatedTitle?: string) => {
      if (!post) return;
      if (!currentUserProfile || authLoading) {
        alert("로그인이 필요합니다.");
        return;
      }

      const finalTitle = updatedTitle || post!.title;
      const trimmedEditedContent = editedContent.trim();
      const trimmedOriginalContent = post!.content.trim() || "";

      if (!finalTitle.trim()) {
        alert("게시물 제목을 입력해주세요.");
        return;
      }
      if (!trimmedEditedContent) {
        alert("게시물 내용을 입력해주세요.");
        return;
      }
      if (
        trimmedEditedContent === trimmedOriginalContent &&
        finalTitle === post!.title
      ) {
        alert("수정된 내용이 없습니다.");
        setIsEditing(false);
        return;
      }

      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await updateTeamPost(communityIdFromPath, parsedPostId, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        } else {
          await updatePost(parsedPostId, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        }

        refetchPost();
        alert("게시물이 성공적으로 수정되었습니다.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 수정 실패:", err);
          alert(
            `게시물 수정 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsEditing(false);
      }
    },
    [
      post,
      editedContent,
      parsedPostId,
      currentUserProfile,
      authLoading,
      isTeamPostPageCalculated,
      location.pathname,
      refetchPost,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (post) {
      setEditedContent(post!.content);
    }
  }, [post]);

  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post!.userId !== currentUserProfile.userId) {
      alert("게시물 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        if (isTeamPostPageCalculated) {
          // `deleteTeamPost`는 여기서 사용됩니다. (ESLint 경고 무시 가능)
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamPost(communityIdFromPath, parsedPostId);
        } else {
          // `deletePost`는 여기서 사용됩니다. (ESLint 경고 무시 가능)
          await deletePost(parsedPostId, currentUserProfile.userId);
        }
        alert("게시물이 성공적으로 삭제되었습니다.");
        navigate(backToBoardPath); // `Maps`는 여기서 사용됩니다.
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 삭제 실패:", err);
          alert(
            `게시물 삭제 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }
    }
  }, [
    post,
    parsedPostId,
    currentUserProfile,
    authLoading,
    isTeamPostPageCalculated,
    navigate,
    backToBoardPath,
    location.pathname,
    // ESLint 경고 해결: `deleteTeamPost`와 `deletePost`는 외부 import 함수이므로 의존성 배열에 포함할 필요가 없습니다.
    // deleteTeamPost,
    // deletePost
  ]);

  const handleAddComment = useCallback(
    async (parentId: number | null, content: string) => {
      if (!post) return;
      if (!currentUserProfile || authLoading) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath)
            throw new Error("커뮤니티 ID가 유효하지 않습니다.");
          await createTeamComment(
            communityIdFromPath,
            parsedPostId,
            currentUserProfile.userId,
            content,
            parentId
          );
        } else {
          await createComment(parsedPostId, {
            userId: currentUserProfile.userId,
            content: content,
            parentId: parentId,
          });
        }

        await refetchComments();
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("댓글 작성 실패:", err);
          alert(
            `댓글 작성 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }
    },
    [
      post,
      parsedPostId,
      currentUserProfile,
      authLoading,
      isTeamPostPageCalculated,
      refetchComments,
      location.pathname,
    ]
  );

  const handleAddCommentForInput = useCallback(
    async (content: string) => {
      await handleAddComment(null, content);
    },
    [handleAddComment]
  );

  const handleCancelTopCommentInput = useCallback(() => {
    if (topCommentInputRef.current) {
      topCommentInputRef.current.value = "";
      topCommentInputRef.current.blur();
    }
  }, []);

  const handleDeleteComment = useCallback(
    // 'handleDeleteComment' 함수는 CommentList에 onDeleteComment prop으로 사용됩니다.
    async (commentId: number) => {
      if (!post) return;
      if (!currentUserProfile) return;
      // 이전 논의에 따라 CommentItem에서 이미 확인창을 띄우므로 여기서 confirm 제거
      // if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        if (isTeamPostPageCalculated) {
          // `deleteTeamComment`는 여기서 사용됩니다. (ESLint 경고 무시 가능)
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamComment(
            communityIdFromPath,
            parsedPostId,
            commentId,
            currentUserProfile.userId
          );
        } else {
          // `deleteComment`는 여기서 사용됩니다. (ESLint 경고 무시 가능)
          await deleteComment(commentId, currentUserProfile.userId);
        }
        await refetchComments(); // 삭제 후에는 전체 댓글을 다시 불러오는 것이 일반적
        alert("댓글이 성공적으로 삭제되었습니다.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("댓글 삭제 실패:", err);
          alert(
            `댓글 삭제 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }
      // }
    },
    [
      post,
      parsedPostId, // `parsedPostId`는 `deleteTeamComment`에 사용되므로 유지합니다.
      currentUserProfile,
      isTeamPostPageCalculated,
      refetchComments,
      location.pathname,
      // ESLint 경고 해결: `deleteTeamComment`와 `deleteComment`는 외부 import 함수이므로 의존성 배열에 포함할 필요가 없습니다.
      // deleteTeamComment,
      // deleteComment
    ]
  );

  const handleEditComment = useCallback(
    async (commentId: number, newContent: string) => {
      if (!post) return;
      if (!currentUserProfile) return;
      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await updateTeamComment(communityIdFromPath, commentId, newContent);
        } else {
          await updateComment(commentId, {
            content: newContent,
            userId: currentUserProfile.userId,
          });
        }
        setComments((prevComments) => {
          const updateCommentInTree = (
            commentsToUpdate: (Comment | TeamComment)[]
          ): (Comment | TeamComment)[] => {
            return commentsToUpdate.map((c) => {
              const currentId =
                "commentId" in c ? c.commentId : c.teamCommentId;
              if (currentId === commentId) {
                return {
                  ...c,
                  content: newContent,
                  updatedAt: new Date().toISOString(),
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: updateCommentInTree(c.replies),
                };
              }
              return c;
            });
          };
          console.log(`[PostDetailPage State] Comments state updated`); // 디버깅 로그 유지
          return updateCommentInTree(prevComments);
        });
        alert("댓글이 성공적으로 수정되었습니다.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("댓글 수정 실패:", err);
          alert(
            `댓글 수정 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }
    },
    [
      post,
      currentUserProfile,
      isTeamPostPageCalculated,
      location.pathname,
      setComments, // `setComments`는 상태 변경 함수이므로 의존성에 포함해야 합니다.
      // ESLint 경고 해결: `updateTeamComment`와 `updateComment`는 외부 import 함수이므로 의존성 배열에 포함할 필요가 없습니다.
      // updateTeamComment,
      // updateComment
    ]
  );

  if (isLoadingPost) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물 로딩 중...
      </div>
    );
  }
  if (isErrorPost) {
    return (
      <div className="text-center py-12 text-xl text-red-700">
        오류: {errorPost?.message || "게시물을 불러오는 데 실패했습니다."}
      </div>
    );
  }
  if (!post) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <PostDetailTemplate
      post={post}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      backToBoardPath={backToBoardPath}
      isEditing={isEditing}
      editedContent={editedContent}
      onEditedContentChange={setEditedContent}
      onSavePost={handleSavePost}
      onCancelEdit={handleCancelEdit}
      backToBoardText={backToBoardText}
      isPostAuthor={isPostAuthor}
      currentUserProfile={currentUserProfile || undefined}
    >
      <div className="mt-12 px-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">댓글</h3>
        <CommentInput
          ref={topCommentInputRef}
          onAddComment={handleAddCommentForInput}
          onCancel={handleCancelTopCommentInput}
        />
        {loadingComments && (
          <div className="text-center text-gray-600 py-4">댓글 로딩 중...</div>
        )}
        {errorComments && (
          <div className="text-center text-red-600 py-4">
            댓글 불러오기 오류: {errorComments}
          </div>
        )}
        {!loadingComments && !errorComments && (
          <CommentList
            comments={comments}
            onAddReply={handleAddComment}
            currentUserId={currentUserProfile?.userId || 0}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </PostDetailTemplate>
  );
};

export default PostDetailPage;
