// src/pages/posts/PostDetailPage.tsx

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import type { Post, Comment, TeamPost, TeamComment } from "../../types";

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
} from "../../api/comments"; // ✨ 이 줄의 문법 오류 수정 완료: 'from' 키워드와 구문이 올바릅니다. ✨
import {
  createTeamComment,
  fetchTeamComments,
  updateTeamComment,
  deleteTeamComment,
} from "../../api/teamComments";

const PostDetailPage: React.FC = () => {
  const { postId, communityId } = useParams<{
    postId: string;
    communityId?: string;
  }>();
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

  const parsedPostId = postId ? Number(postId) : NaN;

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
      setComments(fetchedComments);
    } catch (err: unknown) {
      console.error("댓글 목록 새로고침 실패:", err);
      if (err instanceof Error) {
        setErrorComments(err.message || "댓글을 불러오는데 실패했습니다.");
      } else {
        setErrorComments("알 수 없는 오류가 발생했습니다.");
      }
      setComments([]); // 오류 발생 시 comments 상태를 빈 배열로 설정
    } finally {
      setLoadingComments(false);
    }
  }, [parsedPostId, isTeamPostPageCalculated, location.pathname]);

  // 1. 게시물 상세 정보 불러오기
  const fetchPostData = useCallback(async () => {
    console.log("DEBUG PostDetailPage: fetchPostData 호출됨.");
    console.log("DEBUG PostDetailPage: useParams에서 받은 postId:", postId);
    console.log(
      "DEBUG PostDetailPage: useParams에서 받은 communityId:",
      communityId
    );
    console.log(
      "DEBUG PostDetailPage: isTeamPostPageCalculated:",
      isTeamPostPageCalculated
    );
    console.log("DEBUG PostDetailPage: parsedPostId (숫자):", parsedPostId);

    setLoadingPost(true);
    setErrorPost(null);

    // fetchPostData 내부에 여전히 인증된 사용자 확인 로직이 있습니다.
    if (!currentUserProfile) {
      if (!authLoading) {
        console.log(
          "DEBUG PostDetailPage: fetchPostData - 로그인된 사용자 없음. 로그인 필요."
        );
        setErrorPost("로그인이 필요합니다.");
        setLoadingPost(false);
      }
      return;
    }

    if (isNaN(parsedPostId)) {
      console.log(
        "DEBUG PostDetailPage: fetchPostData - 유효하지 않은 parsedPostId (NaN)."
      );
      setErrorPost("유효하지 않은 게시물 ID입니다.");
      setLoadingPost(false);
      return;
    }

    let fetchedPost: Post | TeamPost | null = null;

    try {
      if (isTeamPostPageCalculated) {
        if (!communityId) {
          console.log(
            "DEBUG PostDetailPage: fetchPostData - 팀 게시물이나 communityId가 누락됨."
          );
          setErrorPost("커뮤니티 ID가 유효하지 않습니다.");
          setLoadingPost(false);
          return;
        }
        console.log(
          `DEBUG PostDetailPage: fetchTeamPostById 호출. communityId: ${communityId}, parsedPostId: ${parsedPostId}`
        );
        fetchedPost = await fetchTeamPostById(communityId, parsedPostId);
      } else {
        console.log(
          `DEBUG PostDetailPage: fetchPostById 호출. parsedPostId: ${parsedPostId}`
        );
        fetchedPost = await fetchPostById(parsedPostId);
      }

      if (fetchedPost) {
        console.log(
          "DEBUG PostDetailPage: 게시물 성공적으로 불러옴.",
          fetchedPost
        );
        setPost(fetchedPost);
        setEditedContent(fetchedPost.content);
      } else {
        console.log(
          "DEBUG PostDetailPage: fetchPostData - API 호출 후 게시물을 찾을 수 없음 (null 또는 undefined)."
        );
        setErrorPost("게시물을 찾을 수 없습니다.");
      }
    } catch (err: unknown) {
      console.error(
        "DEBUG PostDetailPage: fetchPostData - 게시물 불러오기 중 오류 발생:",
        err
      );
      if (err instanceof Error) {
        setErrorPost(err.message || "게시물을 불러오는데 실패했습니다.");
      } else {
        setErrorPost("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoadingPost(false);
    }
  }, [
    parsedPostId,
    communityId,
    currentUserProfile,
    authLoading,
    isTeamPostPageCalculated,
    postId,
  ]);

  // useEffect: 컴포넌트 마운트 및 주요 의존성 변경 시 데이터 로드
  useEffect(() => {
    console.log("DEBUG PostDetailPage: useEffect 트리거됨.");

    console.log("DEBUG Condition Check: parsedPostId:", parsedPostId);
    console.log(
      "DEBUG Condition Check: isNaN(parsedPostId):",
      isNaN(parsedPostId)
    );
    console.log("DEBUG Condition Check: communityId:", communityId);
    console.log(
      "DEBUG Condition Check: isTeamPostPageCalculated:",
      isTeamPostPageCalculated
    );
    console.log(
      "DEBUG Condition Check: isTeamPostPageCalculated ? communityId : true ->",
      isTeamPostPageCalculated ? communityId : true
    );
    console.log(
      "DEBUG Condition Check: Full condition result:",
      !isNaN(parsedPostId) && (isTeamPostPageCalculated ? communityId : true)
    );

    if (
      !isNaN(parsedPostId) &&
      (isTeamPostPageCalculated ? communityId : true)
    ) {
      console.log(
        "DEBUG PostDetailPage: useEffect - fetchPostData 강제 호출 조건 충족."
      );
      fetchPostData();
      refetchComments();
    } else {
      console.log(
        "DEBUG PostDetailPage: useEffect - fetchPostData 호출 조건 불충족 (ID 문제)."
      );
      setLoadingPost(false);
      if (isNaN(parsedPostId)) {
        setErrorPost("유효하지 않은 게시물 ID입니다.");
      } else if (isTeamPostPageCalculated && !communityId) {
        setErrorPost("커뮤니티 ID가 누락되었습니다.");
      } else {
        setErrorPost("게시물을 불러올 수 없습니다 (ID 문제).");
      }
    }

    window.scrollTo(0, 0);
    setIsEditing(false);
  }, [
    parsedPostId,
    communityId,
    isTeamPostPageCalculated,
    fetchPostData,
    refetchComments,
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
          const communityIdFromPath = location.pathname.split("/")[2];
          if (!communityIdFromPath) throw new Error("커뮤니티 ID가 없습니다.");
          await deleteTeamPost(communityIdFromPath, parsedPostId);
        } else {
          await deletePost(parsedPostId, currentUserProfile.userId);
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

  // 4. 댓글 작성/답글 작성 핸들러 (CommentList 및 내부적으로 호출)
  // 인자 순서: (parentId: number | null, content: string)
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

        await refetchComments(); // 댓글 목록 새로고침
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

  // CommentInput에 전달할 래퍼 함수 (content만 받음)
  const handleAddCommentForInput = useCallback(
    async (content: string) => {
      await handleAddComment(null, content); // 최상위 댓글이므로 parentId는 null
    },
    [handleAddComment]
  );

  // 댓글 수정 핸들러 (CommentItem에서 호출)
  const handleEditComment = useCallback(
    async (commentId: number, newContent: string) => {
      if (!post || !currentUserProfile) return;
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

  // 댓글 삭제 핸들러 (CommentItem에서 호출)
  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (!post || !currentUserProfile) return;
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          if (isTeamPostPageCalculated) {
            const communityIdFromPath = location.pathname.split("/")[2];
            if (!communityIdFromPath)
              throw new Error("커뮤니티 ID가 없습니다.");
            // deleteTeamComment는 communityId, teamPostId, teamCommentId, userId를 받음
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
      onSavePost={onSavePost}
      onCancelEdit={onCancelEdit}
      backToBoardText={backToBoardText}
      isPostAuthor={isPostAuthor}
    >
      <div className="mt-12 px-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">댓글</h3>
        <CommentInput onAddComment={handleAddCommentForInput} />
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
