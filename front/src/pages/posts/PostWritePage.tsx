// src/pages/posts/PostWritePage.tsx

import React, { useState } from "react"; // useState 임포트
import { useNavigate, useParams } from "react-router-dom";
import PostForm from "../../components/posts/PostForm"; // PostWriteTemplate 대신 PostForm으로 임포트 이름 변경
import { useAuth } from "../../hooks/useAuth";
import { createPost } from "../../api/posts";
import { createTeamPost } from "../../api/teamPosts";
import type { PostType, TeamPostType } from "../../types"; // PostType, TeamPostType 임포트

const PostWritePage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { currentUserProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가

  // handlePostSubmit 함수의 시그니처를 PostForm의 onSubmit 프롭과 일치시킵니다.
  const handlePostSubmit = async (formData: {
    title: string;
    content: string;
    type?: PostType | TeamPostType;
  }) => {
    if (!currentUserProfile || authLoading) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true); // 로딩 시작
    setError(null); // 에러 초기화

    try {
      let postId: string;
      if (communityId) {
        // 팀 게시물 작성 (communityId가 있는 경우)
        postId = await createTeamPost(communityId, {
          title: formData.title,
          content: formData.content,
          type: formData.type as TeamPostType, // PostForm에서 전달된 type 사용
        });
        alert("팀 게시물이 성공적으로 작성되었습니다.");
        navigate(`/communities/${communityId}/posts/${postId}`); // 작성 후 팀 게시물 상세 페이지로 이동
      } else {
        // 일반 게시물 작성 (communityId가 없는 경우)
        postId = await createPost({
          title: formData.title,
          content: formData.content,
        });
        alert("게시물이 성공적으로 작성되었습니다.");
        navigate(`/posts/${postId}`); // 작성 후 일반 게시물 상세 페이지로 이동
      }
    } catch (err: unknown) {
      // 에러 타입을 unknown으로 변경
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
      setLoading(false); // 로딩 종료
    }
  };

  const handleCancel = () => {
    if (communityId) {
      navigate(`/communities/${communityId}/posts`); // 팀 게시판으로 돌아가기
    } else {
      navigate(`/posts`); // 일반 게시판으로 돌아가기 (PostWritePage에서 전체 게시판 경로가 /posts라고 가정)
    }
  };

  return (
    <PostForm
      onSubmit={handlePostSubmit}
      onCancel={handleCancel}
      loading={loading}
      error={error}
      pageTitle={communityId ? "팀 게시물 작성" : "새 게시물 작성"}
      submitButtonText={communityId ? "팀 게시물 등록" : "게시물 등록"}
      isCommunityPost={!!communityId} // 커뮤니티 게시물 여부 프롭 전달
      initialData={{ title: "", content: "" }} // 초기 데이터 빈값으로 설정
    />
  );
};

export default PostWritePage;
