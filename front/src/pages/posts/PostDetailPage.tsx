// src/pages/posts/PostDetailPage.tsx

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import type { Post, Comment, TeamPost, TeamComment } from "../../types";
// PostType, TeamPostType은 더 이상 이 파일에서 직접 사용되지 않으므로 제거합니다.
// import { PostType, TeamPostType } from "../../types";

import CommentInput from "../../components/comments/CommentInput";
import CommentList from "../../components/comments/CommentList";
import { useAuth } from "../../hooks/useAuth";

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
} from "../../api/teamComments";

// CommentTree 빌드 함수 (기존 로직 유지, 타입만 Comment | TeamComment로 유연하게)
const buildCommentTree = (
  flatComments: (Comment | TeamComment)[],
  parentId: number | null = null,
  currentDepth: number = 0
): (Comment | TeamComment)[] => {
  const nestedComments: (Comment | TeamComment)[] = [];

  flatComments
    .filter((comment) => (comment.parentId || null) === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .forEach((comment) => {
      const commentId =
        "commentId" in comment ? comment.commentId : comment.teamCommentId;
      const newComment = { ...comment, depth: currentDepth };

      newComment.replies = buildCommentTree(
        flatComments,
        commentId,
        currentDepth + 1
      ) as (Comment | TeamComment)[];

      nestedComments.push(newComment);
    });
  return nestedComments;
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | TeamPost | undefined>(undefined);
  const [loadingPost, setLoadingPost] = useState(true);
  const [errorPost, setErrorPost] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const [comments, setComments] = useState<(Comment | TeamComment)[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState<string | null>(null);

  // 게시물 ID 파싱 및 string 변환 (API 요청 시 사용)
  const parsedPostId = postId ? Number(postId) : NaN;
  const postIdAsString = postId || "";

  // 게시물 타입 (일반 게시물인지 팀 게시물인지)을 URL 경로를 통해 추정
  const isTeamPostPageCalculated = useMemo(() => {
    return location.pathname.startsWith("/communities/");
  }, [location.pathname]);

  // 게시판 경로 설정 (useMemo로 최적화)
  const backToBoardPath = useMemo(() => {
    if (isTeamPostPageCalculated) {
      const communityId = location.pathname.split("/")[2];
      return communityId ? `/communities/${communityId}/posts` : "/posts";
    }
    return "/posts";
  }, [isTeamPostPageCalculated, location.pathname]);

  const backToBoardText = useMemo(() => {
    return isTeamPostPageCalculated ? "커뮤니티 게시판으로" : "전체 게시판으로";
  }, [isTeamPostPageCalculated]);

  // 댓글 목록을 새로 불러오는 헬퍼 함수
  const refetchComments = useCallback(async () => {
    setLoadingComments(true);
    setErrorComments(null);
    try {
      let fetchedComments: (Comment | TeamComment)[];
      if (isTeamPostPageCalculated) {
        const communityId = location.pathname.split("/")[2];
        if (!communityId) throw new Error("커뮤니티 ID가 유효하지 않습니다.");
        fetchedComments = await fetchTeamComments(communityId, postIdAsString);
      } else {
        fetchedComments = await fetchCommentsByPost(postIdAsString);
      }
      setComments(buildCommentTree(fetchedComments));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("댓글 목록 새로고침 실패:", err);
        setErrorComments(err.message || "댓글을 불러오는데 실패했습니다.");
      } else {
        setErrorComments("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoadingComments(false);
    }
  }, [postIdAsString, isTeamPostPageCalculated, location.pathname]);

  // 1. 게시물 상세 정보 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      setLoadingPost(true);
      setErrorPost(null);

      if (!currentUserProfile && !authLoading) {
        setErrorPost("로그인이 필요합니다.");
        setLoadingPost(false);
        return;
      }

      if (isNaN(parsedPostId)) {
        setErrorPost("유효하지 않은 게시물 ID입니다.");
        setLoadingPost(false);
        return;
      }

      let fetchedPost: Post | TeamPost | null = null;

      try {
        if (isTeamPostPageCalculated) {
          const communityId = location.pathname.split("/")[2];
          if (!communityId) {
            setErrorPost("커뮤니티 ID가 유효하지 않습니다.");
            setLoadingPost(false);
            return;
          }
          fetchedPost = await fetchTeamPostById(communityId, postIdAsString);
        } else {
          fetchedPost = await fetchPostById(postIdAsString);
        }

        if (fetchedPost) {
          setPost(fetchedPost);
          setEditedContent(fetchedPost.content);
        } else {
          setErrorPost("게시물을 찾을 수 없습니다.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 불러오기 실패:", err);
          setErrorPost(err.message || "게시물을 불러오는데 실패했습니다.");
        } else {
          setErrorPost("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoadingPost(false);
      }
    };

    if (!authLoading && currentUserProfile) {
      fetchPostData();
      refetchComments();
    } else if (!authLoading && !currentUserProfile) {
      setLoadingPost(false);
      setErrorPost("로그인이 필요합니다.");
    }
    window.scrollTo(0, 0);
    setIsEditing(false);
  }, [
    postIdAsString,
    currentUserProfile,
    authLoading,
    isTeamPostPageCalculated,
    location.pathname,
    refetchComments,
    parsedPostId,
  ]);

  // 게시물 작성자 여부 확인
  const isPostAuthor = post?.userId === currentUserProfile?.userId;

  // 2. 게시물 수정 핸들러
  const handleEditPost = useCallback(() => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post.userId !== currentUserProfile.userId) {
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

      const finalTitle = updatedTitle || post.title;
      const trimmedEditedContent = editedContent.trim();
      const trimmedOriginalContent = post.content.trim() || "";

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
        finalTitle === post.title
      ) {
        alert("수정된 내용이 없습니다.");
        setIsEditing(false);
        return;
      }

      try {
        if (isTeamPostPageCalculated) {
          const communityId = location.pathname.split("/")[2];
          if (!communityId) throw new Error("커뮤니티 ID가 없습니다.");
          await updateTeamPost(communityId, postIdAsString, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        } else {
          await updatePost(postIdAsString, {
            title: finalTitle,
            content: trimmedEditedContent,
          });
        }

        setPost((prevPost) =>
          prevPost
            ? {
                ...prevPost,
                title: finalTitle,
                content: trimmedEditedContent,
                updatedAt: new Date().toISOString(),
              }
            : undefined
        );
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
          alert("게시물 수정 중 알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsEditing(false);
      }
    },
    [
      post,
      editedContent,
      postIdAsString,
      currentUserProfile,
      authLoading,
      isTeamPostPageCalculated,
      location.pathname,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (post) {
      setEditedContent(post.content);
    }
  }, [post]);

  // 3. 게시물 삭제 핸들러
  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post.userId !== currentUserProfile.userId) {
      alert("게시물 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        if (isTeamPostPageCalculated) {
          const communityId = location.pathname.split("/")[2];
          if (!communityId) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamPost(
            communityId,
            postIdAsString,
            parsedPostId,
            currentUserProfile.userId
          );
        } else {
          await deletePost(postIdAsString, currentUserProfile.userId);
        }
        alert("게시물이 성공적으로 삭제되었습니다.");
        navigate(backToBoardPath); // 삭제 후 게시판으로 이동
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 삭제 실패:", err);
          alert(
            `게시물 삭제 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("게시물 삭제 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    }
  }, [
    post,
    postIdAsString,
    currentUserProfile,
    authLoading,
    isTeamPostPageCalculated,
    navigate,
    backToBoardPath,
    location.pathname,
    parsedPostId,
  ]);

  // 4. 댓글 작성 핸들러 (CommentInput에서 호출)
  const handleAddCommentForInput = useCallback(
    async (content: string) => {
      // ✨ 추가: CommentInput용 래퍼 함수 ✨
      await handleAddComment(null, content); // 최상위 댓글이므로 parentId는 null
    },
    [handleAddComment]
  );

  // 댓글 작성/답글 작성 핸들러 (CommentList 및 내부적으로 호출)
  const handleAddComment = useCallback(
    async (parentId: number | null, content: string) => {
      // ✨ 수정: 인자 순서 변경 및 parentId 타입 number | null로 통일 ✨
      if (!post) return;
      if (!currentUserProfile || authLoading) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        if (isTeamPostPageCalculated) {
          const communityId = location.pathname.split("/")[2];
          if (!communityId) throw new Error("커뮤니티 ID가 유효하지 않습니다.");
          await createTeamComment(
            communityId,
            postIdAsString,
            currentUserProfile.userId,
            content,
            parentId
          );
        } else {
          await createComment(postIdAsString, {
            userId: currentUserProfile.userId,
            content: content,
            parentId: parentId,
          });
        }

        await refetchComments(); // 댓글 목록 새로고침
        alert("댓글이 성공적으로 작성되었습니다.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("댓글 작성 실패:", err);
          alert(
            `댓글 작성 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          alert("댓글 작성 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    },
    [
      post,
      postIdAsString,
      currentUserProfile,
      authLoading,
      isTeamPostPageCalculated,
      refetchComments,
      location.pathname,
    ]
  );

  // 댓글 수정 핸들러 (CommentItem에서 호출)
  const handleEditComment = useCallback(
    async (commentId: number, newContent: string) => {
      if (!post || !currentUserProfile) return;
      try {
        if (isTeamPostPageCalculated) {
          const communityId = location.pathname.split("/")[2];
          if (!communityId) throw new Error("커뮤니티 ID가 없습니다.");
          await updateTeamComment(communityId, String(commentId), newContent);
        } else {
          await updateComment(String(commentId), {
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
          alert("댓글 수정 중 알 수 없는 오류가 발생했습니다.");
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

  // 댓글 삭제 핸들러 (CommentItem에서 호출)
  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (!post || !currentUserProfile) return;
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          if (isTeamPostPageCalculated) {
            const communityId = location.pathname.split("/")[2];
            if (!communityId) throw new Error("커뮤니티 ID가 없습니다.");
            // deleteTeamComment는 communityId, teamPostId, teamCommentId, userId를 받음
            await deleteTeamComment(
              communityId,
              postIdAsString,
              commentId,
              currentUserProfile.userId
            );
          } else {
            await deleteComment(String(commentId), currentUserProfile.userId);
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
            alert("댓글 삭제 중 알 수 없는 오류가 발생했습니다.");
          }
        }
      }
    },
    [
      post,
      postIdAsString,
      currentUserProfile,
      isTeamPostPageCalculated,
      refetchComments,
      location.pathname,
    ]
  );

  if (loadingPost) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물 로딩 중...
      </div>
    );
  }
  if (errorPost) {
    return <div className="text-center py-12 text-xl">{errorPost}</div>;
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
    >
      <div className="mt-12 px-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">댓글</h3>
        <CommentInput onAddComment={handleAddCommentForInput} />{" "}
        {/* ✨ 수정: CommentInput에는 래퍼 함수 전달 ✨ */}
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
