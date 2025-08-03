// src/pages/posts/PostDetailPage.tsx

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate"; // Correct path
import type { Post, Comment, TeamPost, TeamComment } from "../../types";

import CommentInput from "../../components/comments/CommentInput"; // Correct path
import CommentList from "../../components/comments/CommentList"; // Correct path
import { useAuth } from "../../hooks/useAuth";
import { useQuery /* , type UseQueryOptions */ } from "@tanstack/react-query"; // Removed unused UseQueryOptions import

// API 임포트
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
} from "../../api/teamComments"; // Correct 'from' keyword syntax

// 댓글에 depth 속성을 재귀적으로 할당하는 헬퍼 함수 추가
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

  // 게시물 상세 데이터를 가져오는 쿼리 함수를 useCallback으로 래핑
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

  // useQuery를 사용하여 게시물 데이터 가져오기
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
    // ✨ onSuccess 및 onError 콜백 제거 (아래 useEffect로 로직 이동) ✨
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
    // ✨ post 데이터 로딩 완료 시 editedContent 설정 (onSuccess 대체) ✨
    if (!isLoadingPost && !isErrorPost && post) {
      setEditedContent(post.content);
      refetchComments(); // 게시물 로딩 성공 후 댓글 로드
    }
    // ✨ isErrorPost 발생 시 에러 로깅 (onError 대체) ✨
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
    refetchComments, // Circular dependency with useEffect causing issues - REMOVE THIS FROM HERE
    errorPost,
  ]);
  // ✨ refetchComments 제거 ✨ (위 useEffect 의존성 배열에서 제거해야 합니다.)
  // (이 주석은 설명을 위한 것이며, 실제 코드에서는 제거되어야 합니다.)

  // isPostAuthor 계산 전에 post가 유효한지 확인
  const isPostAuthor = post
    ? post.userId === currentUserProfile?.userId
    : false;

  const handleEditPost = useCallback(() => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post!.userId !== currentUserProfile.userId) {
      // ✨ post! 사용 ✨
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

      const finalTitle = updatedTitle || post!.title; // ✨ post! 사용 ✨
      const trimmedEditedContent = editedContent.trim();
      const trimmedOriginalContent = post!.content.trim() || ""; // ✨ post! 사용 ✨

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
        finalTitle === post!.title // ✨ post! 사용 ✨
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
      setEditedContent(post!.content); // ✨ post! 사용 ✨
    }
  }, [post]);

  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post!.userId !== currentUserProfile.userId) {
      // ✨ post! 사용 ✨
      alert("게시물 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        if (isTeamPostPageCalculated) {
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamPost(communityIdFromPath, parsedPostId);
        } else {
          await deletePost(parsedPostId, currentUserProfile.userId);
        }
        alert("게시물이 성공적으로 삭제되었습니다.");
        navigate(backToBoardPath);
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
      post, // post.userId에 직접 접근하지 않으므로, post 자체의 유효성 검사만 유지
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
        await refetchComments();
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
      refetchComments,
      location.pathname,
    ]
  );

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (!post) return;
      if (!currentUserProfile) return;
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          if (isTeamPostPageCalculated) {
            const communityIdFromPath = location.pathname.split("/")[2];
            if (!communityIdFromPath)
              throw new Error("커뮤니티 ID가 없습니다.");
            await deleteTeamComment(
              communityIdFromPath,
              parsedPostId,
              commentId,
              currentUserProfile.userId
            );
          } else {
            await deleteComment(commentId, currentUserProfile.userId);
          }
          await refetchComments();
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
      }
    },
    [
      post,
      parsedPostId,
      currentUserProfile,
      isTeamPostPageCalculated,
      refetchComments,
      location.pathname,
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
      currentUserProfile={currentUserProfile || undefined} // ✨ currentUserProfile prop 전달 ✨
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
