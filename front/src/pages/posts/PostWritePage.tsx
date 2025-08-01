// src/pages/posts/PostWritePage.tsx

import React, { useState, useCallback } from "react";
// useLocation은 더 이상 사용하지 않으므로 제거합니다.
import { useParams, useNavigate /*, useLocation */ } from "react-router-dom";
import PostForm from "../../components/posts/PostForm";

import { useAuth } from "../../hooks/useAuth";
import { createPost } from "../../api/posts";
import { createTeamPost } from "../../api/teamPosts";
import type { PostType, TeamPostType } from "../../types";

const PostWritePage: React.FC = () => {
  const { communityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();

  const isCommunityPost = !!communityId;

  // title, content 상태는 PostForm 내부에서 관리하므로 여기서 제거합니다.
  // const [title, setTitle] = useState("");
  // const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePostSubmit = useCallback(
    async (formData: {
      title: string;
      content: string;
      type?: PostType | TeamPostType;
    }) => {
      if (!currentUserProfile || authLoading) {
        alert("로그인이 필요합니다.");
        navigate("/auth/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let postId: string;
        if (communityId) {
          postId = await createTeamPost(communityId, {
            title: formData.title, // formData에서 제목 가져오기
            content: formData.content, // formData에서 내용 가져오기
            type: formData.type as TeamPostType,
          });
          alert("팀 게시물이 성공적으로 작성되었습니다.");
          navigate(`/communities/${communityId}/posts/${postId}`);
        } else {
          postId = await createPost({
            title: formData.title, // formData에서 제목 가져오기
            content: formData.content, // formData에서 내용 가져오기
          });
          alert("게시물이 성공적으로 작성되었습니다.");
          navigate(`/posts/${postId}`);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("게시물 작성 실패:", err);
          setError(err.message || "알 수 없는 오류가 발생했습니다.");
          alert(
            `게시물 작성 중 오류가 발생했습니다: ${
              err.message || "알 수 없는 오류"
            }`
          );
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
          alert("게시물 작성 중 알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    },
    [communityId, navigate, currentUserProfile, authLoading]
  );

  const handleCancel = useCallback(() => {
    if (isCommunityPost) {
      navigate(`/communities/${communityId}/posts`);
    } else {
      navigate("/posts");
    }
  }, [isCommunityPost, navigate, communityId]);

  return (
    <PostForm
      // title, onTitleChange, content, onContentChange 프롭은 PostForm 내부에서 관리하므로 제거합니다.
      onSubmit={handlePostSubmit}
      onCancel={handleCancel}
      loading={loading}
      error={error}
      pageTitle={communityId ? "팀 게시물 작성" : "새 게시물 작성"}
      submitButtonText={communityId ? "팀 게시물 등록" : "게시물 등록"}
      isCommunityPost={!!communityId}
      initialData={{ title: "", content: "" }}
    />
  );
};

export default PostWritePage;
