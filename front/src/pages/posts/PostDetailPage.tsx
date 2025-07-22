// front/src/pages/posts/PostDetailPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import type { Post, Comment } from "../../types";

import CommentInput from "../../components/comments/CommentInput";
import CommentList from "../../components/comments/CommentList";

// Mock Data: 단일 게시물 상세 정보 (FullPost 인터페이스는 변경 없음)
interface FullPost extends Post {
  author: string;
  createdAt: string;
  content: string;
  authorId?: string; // 게시물 작성자 ID 추가 (수정 권한 확인용)
}

const mockPostsDetailData: { [key: string]: FullPost } = {
  // Mock 데이터에 authorId를 추가하여 실제 게시물과 동일하게 수정 권한을 테스트할 수 있도록 합니다.
  "post-1": {
    id: "post-1",
    title: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
    commentCount: 5,
    author: "홍길동",
    authorId: "user456", // Mock user ID (user123이 아님)
    createdAt: "2025년 07월 21일",
    content: `# 마크다운 테스트 제목
**볼드 텍스트**와 *이탤릭 텍스트*를 포함합니다.

- 목록 1
- 목록 2

\`\`\`javascript
console.log("코드 블록");
\`\`\`

> 인용 블록`,
  },
  "post-2": {
    id: "post-2",
    title: "독서 모임 다음 주제 추천 받아요!",
    commentCount: 12,
    author: "김철수",
    authorId: "user123", // Mock user ID (user123)
    createdAt: "2025년 07월 20일",
    content: `안녕하세요, 다음 독서 모임 주제를 선정하려고 합니다.
혹시 추천해주실 만한 책이나 특정 주제가 있다면 자유롭게 의견 주세요!
이번에는 추리 소설이나 SF 장르도 고려하고 있습니다 :)`,
  },
  "comm1-post-1": {
    id: "comm1-post-1",
    title: "[해리포터] 1번째 독서 스터디 논의점",
    commentCount: Math.floor(Math.random() * 10) + 1,
    author: "그리핀도르",
    authorId: "user123", // Mock user ID (user123)
    createdAt: "2025년 07월 17일",
    content: `해리포터 독서 모임 논의점
이것은 '해리포터' 커뮤니티의 1번째 게시물 상세 내용입니다.

이번 논의에서는 **마법사의 돌** 챕터 3에 대해 이야기해볼까요?

* 등장인물 분석: 해리, 론, 헤르미온느
* 흥미로웠던 마법 주문
* 다음 모임에서 다룰 내용
`,
  },
  "comm1-post-2": {
    id: "comm1-post-2",
    title: "[해리포터] 2번째 독서 스터디 논의점",
    commentCount: Math.floor(Math.random() * 10) + 1,
    author: "슬리데린",
    authorId: "user456",
    createdAt: "2025년 07월 16일",
    content: `이것은 '해리포터' 커뮤니티의 2번째 게시물 상세 내용입니다. 논의 내용을 확인하세요.`,
  },
  "comm2-post-1": {
    id: "comm2-post-1",
    title: "[노인과바다] 깊은 바다 이야기 1",
    commentCount: Math.floor(Math.random() * 15) + 1,
    author: "바다사나이",
    authorId: "user123",
    createdAt: "2025년 07월 15일",
    content: `노인과 바다의 첫 번째 깊은 이야기.`,
  }, // ✨ GeneralBoardPage에서 사용할 게시물 추가 ✨
  "general-post-1": {
    id: "general-post-1",
    title: "[전체] 1번째 흥미로운 이야기",
    commentCount: 5,
    author: "전체 게시판 유저1",
    authorId: "user456", // Mock authorId
    createdAt: "2025년 07월 21일",
    content: `이것은 전체 게시판의 1번째 게시물 상세 내용입니다.`,
  },
  "general-post-2": {
    id: "general-post-2",
    title: "[전체] 2번째 흥미로운 이야기",
    commentCount: 10,
    author: "전체 게시판 유저2",
    authorId: "user123", // user123으로 수정 테스트 가능
    createdAt: "2025년 07월 20일",
    content: `이것은 전체 게시판의 2번째 게시물 상세 내용입니다.`,
  },
};

// Mock 댓글 데이터 (postId에 따라 다르게) - 변경 없음
const mockCommentsData: { [key: string]: Comment[] } = {
  "comm1-post-1": [
    {
      id: "c1",
      author: "책돌이",
      authorId: "user123",
      createdAt: "2025.07.20 12:00",
      content: "정말 흥미로운 논의네요!",
    },
    {
      id: "c2",
      author: "책순이",
      authorId: "user456",
      createdAt: "2025.07.20 12:35",
      content: "저도 그 부분에서 궁금한 점이 많았어요.",
      isEdited: true,
    },
    {
      id: "c3",
      author: "독서왕",
      authorId: "user123",
      createdAt: "2025.07.20 13:10",
      content: "이런 질문은 정말 좋아요!",
    },
  ],
  "post-1": [
    {
      id: "gc1",
      author: "김독자",
      authorId: "user789",
      createdAt: "2025.07.21 10:00",
      content: "좋은 글 잘 읽었습니다.",
    },
    {
      id: "gc2",
      author: "박논평",
      authorId: "user123",
      createdAt: "2025.07.21 10:15",
      content: "저도 같은 의견입니다.",
    },
  ],
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const currentUserId = "user123"; // 임시 로그인 사용자 ID (이 ID를 가진 사용자만 수정/삭제 버튼을 볼 수 있습니다)

  // 게시물 데이터 (useEffect에서 불러와서 상태로 관리)
  const [post, setPost] = useState<FullPost | undefined>(undefined);
  const [loadingPost, setLoadingPost] = useState(true);
  const [errorPost, setErrorPost] = useState<string | null>(null);

  // ✨ 게시물 수정 모드 관련 상태 ✨
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(""); // 수정 중인 내용을 저장하는 상태

  const [comments, setComments] = useState<Comment[]>([]);

  // 게시물 데이터 로딩 및 초기화
  useEffect(() => {
    const fetchPostData = () => {
      setLoadingPost(true);
      setErrorPost(null);
      const fetchedPost = mockPostsDetailData[postId || ""];
      if (fetchedPost) {
        setPost(fetchedPost);
        setEditedContent(fetchedPost.content); // 게시물 내용 로드 시 수정 내용도 초기화
        setComments(mockCommentsData[postId || ""] || []); // 댓글 로딩
      } else {
        setErrorPost("게시물을 찾을 수 없습니다.");
      }
      setLoadingPost(false);
    };

    fetchPostData();
    window.scrollTo(0, 0);
    setIsEditing(false); // 페이지 이동 시 수정 모드 자동 해제
  }, [postId]); // postId가 변경될 때마다 재호출

  // 게시물 작성자 여부 확인
  const isPostAuthor = post?.authorId === currentUserId;

  // 게시물 수정 시작 (PostDetailTemplate의 "수정" 버튼 클릭 시)
  const handleEditPost = () => {
    // 현재 로그인된 사용자가 게시물 작성자인지 확인
    // post.authorId 필드를 FullPost 인터페이스에 추가해야 합니다.
    if (post && post.authorId !== currentUserId) {
      alert("게시물 작성자만 수정할 수 있습니다.");
      return;
    }
    setIsEditing(true);
  };

  // 게시물 수정 저장 (PostDetailTemplate의 "저장" 버튼 클릭 시)
  const handleSavePost = () => {
    const trimmedEditedContent = editedContent.trim();
    const trimmedOriginalContent = post?.content.trim() || "";

    if (!trimmedEditedContent) {
      alert("게시물 내용을 입력해주세요.");
      return;
    }
    if (trimmedEditedContent === trimmedOriginalContent) {
      alert("수정된 내용이 없습니다.");
      setIsEditing(false); // 변경 없으면 수정 모드 종료
      return;
    }

    // 실제로는 API 호출 (PUT /posts/:id)
    console.log(`게시물 ${postId} 수정 완료:`, trimmedEditedContent);

    // Mock 데이터 업데이트 예시 (실제 API 호출 성공 후 적용)
    if (post) {
      setPost({
        ...post,
        content: trimmedEditedContent,
        createdAt:
          new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) + " (수정됨)", // 수정일자 업데이트 예시
      });
      // Mock 데이터 객체 자체도 업데이트 (새로고침 없이 반영되도록)
      mockPostsDetailData[post.id] = {
        ...mockPostsDetailData[post.id],
        content: trimmedEditedContent,
        createdAt:
          new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) + " (수정됨)",
      };
    }

    setIsEditing(false); // 수정 완료 후 다시 보기 모드로 전환
  };

  // 게시물 수정 취소 (PostDetailTemplate의 "취소" 버튼 클릭 시)
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (post) {
      setEditedContent(post.content); // 원본 내용으로 복원
    }
  };

  const handleDeletePost = () => {
    // post.authorId 필드를 FullPost 인터페이스에 추가해야 합니다.
    if (post && post.authorId !== currentUserId) {
      alert("게시물 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      console.log(`Delete post ${postId}`);
      // 실제 API 호출 (DELETE /posts/d)
      // Mock 데이터에서 삭제하는 로직도 추가해야 합니다 (여기서는 단순 콘솔 로그 후 리다이렉트)
      // delete mockPostsDetailData[postId]; // 이런 식으로 직접 Mock 데이터에서 삭제
      navigate("/posts");
      alert("게시물이 삭제되었습니다.");
    }
  };

  const handleAddComment = (content: string) => {
    console.log("새 댓글 추가:", content);
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: "현재 사용자",
      authorId: currentUserId,
      createdAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      content: content,
    };
    setComments((prevComments) => [...prevComments, newComment]);
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    console.log(`댓글 ${commentId} 수정:`, newContent);
    setComments((prevComments) =>
      prevComments.map((c) =>
        c.id === commentId ? { ...c, content: newContent, isEdited: true } : c
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    console.log(`댓글 ${commentId} 삭제`);
    setComments((prevComments) =>
      prevComments.filter((c) => c.id !== commentId)
    );
  };

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

  // 게시물 ID에서 커뮤니티 ID 추출 및 뒤로 가기 경로 설정
  let backToBoardPath: string = "/posts";
  let backToBoardText: string = "전체 게시판으로";

  const communityIdMatch = postId?.match(/^(comm\d+)-post-\d+$/);
  if (communityIdMatch && communityIdMatch[1]) {
    const communityId = communityIdMatch[1];
    backToBoardPath = `/communities/${communityId}/posts`;
    backToBoardText = "커뮤니티 게시판으로";
  }

  return (
    <PostDetailTemplate
      postTitle={post.title}
      author={post.author}
      createdAt={post.createdAt}
      postContent={post.content}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      backToBoardPath={backToBoardPath}
      isEditing={isEditing}
      editedContent={editedContent}
      onEditedContentChange={setEditedContent}
      onSavePost={handleSavePost}
      onCancelEdit={handleCancelEdit}
      backToBoardText={backToBoardText}
      isPostAuthor={isPostAuthor} // ✨ isPostAuthor 프롭스 전달 ✨
    >
      {/* 댓글 섹션은 수정 모드와 관계없이 항상 표시 */}
      <div className="mt-12 px-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4">댓글</h3>
        <CommentInput onAddComment={handleAddComment} />
        <CommentList
          comments={comments}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          currentUserId={currentUserId}
        />
      </div>
    </PostDetailTemplate>
  );
};

export default PostDetailPage;
