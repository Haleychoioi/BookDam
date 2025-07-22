// front/src/pages/posts/PostWritePage.tsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "../../components/posts/PostForm"; // ✨ PostWriteTemplate 임포트 ✨

const PostWritePage: React.FC = () => {
  const { communityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();

  const isCommunityPost = !!communityId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "user123"; // Mock user ID

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        `새 게시물 생성: 커뮤니티ID=${
          communityId || "없음"
        }, 제목=${title}, 내용=${content}, 작성자=${currentUserId}`
      );
      // 실제 API 호출 로직 (POST /posts 또는 POST /communities/:id/posts)
      // const response = await createPost({ title, content, userId: currentUserId, communityId });
      // const newPostId = response.postId;

      // Mock 데이터로 postId 생성
      const newPostId = `mock-new-post-${Date.now()}`;

      alert("게시물이 작성되었습니다.");
      navigate(`/posts/${newPostId}`);
    } catch (err) {
      console.error("게시물 작성 실패:", err);
      setError("게시물 작성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isCommunityPost) {
      navigate(`/communities/${communityId}/posts`);
    } else {
      navigate("/posts");
    }
  };

  // 템플릿에 전달할 프롭스들
  const pageTitle = "새 글 쓰기";
  const submitButtonText = "작성 완료";

  // 에러 또는 로딩 상태 표시 (Template 내부에서 처리하지 않고 여기에서 처리)
  if (loading) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        게시물 작성 중...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-xl text-red-700">{error}</div>
    );
  }

  return (
    <PostForm
      title={title}
      onTitleChange={(e) => setTitle(e.target.value)}
      content={content}
      onContentChange={(newValue) => setContent(newValue || "")}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      error={error} // 템플릿에서 에러 메시지를 표시하지 않으므로, 이 프롭스는 제거 가능
      pageTitle={pageTitle}
      submitButtonText={submitButtonText}
    />
  );
};

export default PostWritePage;
