import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostDetailTemplate from "../../components/posts/PostDetailTemplate";
import type { Post, Comment } from "../../types";

import CommentInput from "../../components/comments/CommentInput";
import CommentList from "../../components/comments/CommentList";

const POST_AUTHOR_PROFILE_IMAGE_BASE_URL =
  "https://via.placeholder.com/40?text=";
const COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL =
  "https://via.placeholder.com/30?text=";

const mockPostsDetailData: { [key: string]: Post } = {
  "post-1": {
    id: "post-1",
    title: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
    commentCount: 5,
    author: "홍길동",
    authorId: 456,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "Hong",
    createdAt: "2025년 07월 21일",
    content: `# 마크다운 테스트 제목
**볼드 텍스트**와 *이탤릭 텍스트*를 포함합니다.

- 목록 1
- 목록 2

\`\`\`javascript
console.log("코드 블록");
\`\`\`

> 인용 블록`,
    type: "general",
  },
  "post-2": {
    id: "post-2",
    title: "독서 모임 다음 주제 추천 받아요!",
    commentCount: 12,
    author: "김철수",
    authorId: 123,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "Kim",
    createdAt: "2025년 07월 20일",
    content: `안녕하세요, 다음 독서 모임 주제를 선정하려고 합니다.
혹시 추천해주실 만한 책이나 특정 주제가 있다면 자유롭게 의견 주세요!
이번에는 추리 소설이나 SF 장르도 고려하고 있습니다 :)`,
    type: "general",
  },
  "comm1-post-1": {
    id: "comm1-post-1",
    title: "[해리포터] 1번째 독서 스터디 논의점",
    commentCount: Math.floor(Math.random() * 10) + 1,
    author: "그리핀도르",
    authorId: 123,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "Gry",
    createdAt: "2025년 07월 17일",
    content: `해리포터 독서 모임 논의점
이것은 '해리포터' 커뮤니티의 1번째 게시물 상세 내용입니다.

이번 논의에서는 **마법사의 돌** 챕터 3에 대해 이야기해볼까요?

* 등장인물 분석: 해리, 론, 헤르미온느
* 흥미로웠던 마법 주문
* 다음 모임에서 다룰 내용
`,
    type: "community",
  },
  "comm1-post-2": {
    id: "comm1-post-2",
    title: "[해리포터] 2번째 독서 스터디 논의점",
    commentCount: Math.floor(Math.random() * 10) + 1,
    author: "슬리데린",
    authorId: 456,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "Sly",
    createdAt: "2025년 07월 16일",
    content: `이것은 '해리포터' 커뮤니티의 2번째 게시물 상세 내용입니다. 논의 내용을 확인하세요.`,
    type: "community",
  },
  "comm2-post-1": {
    id: "comm2-post-1",
    title: "[노인과바다] 깊은 바다 이야기 1",
    commentCount: Math.floor(Math.random() * 15) + 1,
    author: "바다사나이",
    authorId: 123,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "Sea",
    createdAt: "2025년 07월 15일",
    content: `노인과 바다의 첫 번째 깊은 이야기.`,
    type: "community",
  },
  "general-post-1": {
    id: "general-post-1",
    title: "[전체] 1번째 흥미로운 이야기",
    commentCount: 5,
    author: "전체 게시판 유저1",
    authorId: 456,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "User1",
    createdAt: "2025년 07월 21일",
    content: `이것은 전체 게시판의 1번째 게시물 상세 내용입니다.`,
    type: "general",
  },
  "general-post-2": {
    id: "general-post-2",
    title: "[전체] 2번째 흥미로운 이야기",
    commentCount: 10,
    author: "전체 게시판 유저2",
    authorId: 123,
    authorProfileImage: POST_AUTHOR_PROFILE_IMAGE_BASE_URL + "User2",
    createdAt: "2025년 07월 20일",
    content: `이것은 전체 게시판의 2번째 게시물 상세 내용입니다.`,
    type: "general",
  },
};

const rawMockCommentsData: { [key: string]: Comment[] } = {
  "comm1-post-1": [
    {
      id: "c1",
      author: "책돌이",
      authorId: 123,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "BookD",
      createdAt: "2025.07.20 12:00",
      content: "정말 흥미로운 논의네요! (Depth 0)",
      postId: "comm1-post-1",
      postTitle: "[해리포터] 1번째 독서 스터디 논의점",
      postType: "community",
      communityId: "comm1",
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    },
    {
      id: "c1-r1",
      author: "해리팬",
      authorId: 456,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "HPF",
      createdAt: "2025.07.20 12:15",
      content: "맞아요, 그 부분 저도 궁금했어요! (Depth 1, c1의 답글)",
      postId: "comm1-post-1",
      postTitle: "[해리포터] 1번째 독서 스터디 논의점",
      postType: "community",
      communityId: "comm1",
      isEdited: false,
      parentId: "c1",
      depth: 1,
      replies: [],
    },
    {
      id: "c2",
      author: "책순이",
      authorId: 456,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "BookS",
      createdAt: "2025.07.20 12:35",
      content: "저는 다른 관점에서 보고 있었어요! (Depth 0)",
      isEdited: true,
      postId: "comm1-post-1",
      postTitle: "[해리포터] 1번째 독서 스터디 논의점",
      postType: "community",
      communityId: "comm1",
      parentId: undefined,
      depth: 0,
      replies: [],
    },
    {
      id: "c3",
      author: "독서왕",
      authorId: 123,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "BookK",
      createdAt: "2025.07.20 13:10",
      content: "이런 질문은 정말 좋아요! (Depth 0)",
      postId: "comm1-post-1",
      postTitle: "[해리포터] 1번째 독서 스터디 논의점",
      postType: "community",
      communityId: "comm1",
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    },
    {
      id: "c3-r1",
      author: "새로운 독자",
      authorId: 789,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "NewR",
      createdAt: "2025.07.20 13:30",
      content: "저도 그렇게 생각해요! (Depth 1, c3의 답글)",
      postId: "comm1-post-1",
      postTitle: "[해리포터] 1번째 독서 스터디 논의점",
      postType: "community",
      communityId: "comm1",
      isEdited: false,
      parentId: "c3",
      depth: 1,
      replies: [],
    },
  ],
  "post-1": [
    {
      id: "gc1",
      author: "김독자",
      authorId: 789,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "KimD",
      createdAt: "2025.07.21 10:00",
      content: "안녕하세요, 첫 댓글입니다! (Depth 0)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    },
    {
      id: "gc1-r1",
      author: "답글러1",
      authorId: 456,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "Rep1",
      createdAt: "2025.07.21 10:30",
      content:
        "네, 저도 그 문단에 대해 궁금한 점이 많습니다. (Depth 1, gc1의 답글)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: "gc1",
      depth: 1,
      replies: [],
    },
    {
      id: "gc1-r2",
      author: "답글러2",
      authorId: 123,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "Rep2",
      createdAt: "2025.07.21 10:45",
      content:
        "저는 다른 해석을 해봤어요. 혹시 이 부분에 대해 어떻게 생각하시나요? (Depth 1, gc1의 답글)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: "gc1",
      depth: 1,
      replies: [],
    },
    {
      id: "gc3",
      author: "책읽는고양이",
      authorId: 777,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "Cat",
      createdAt: "2025.07.21 11:00",
      content: "이 게시물 내용 정말 유익하네요! (Depth 0)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    },
    {
      id: "gc3-r1",
      author: "게시판지기",
      authorId: 100,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "Admin",
      createdAt: "2025.07.21 11:15",
      content:
        "칭찬 감사합니다! 더 좋은 게시물을 올리도록 노력하겠습니다. (Depth 1, gc3의 답글)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: "gc3",
      depth: 1,
      replies: [],
    },
    {
      id: "gc4",
      author: "새로운시작",
      authorId: 888,
      authorProfileImage: COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "NewS",
      createdAt: "2025.07.21 11:30",
      content: "저도 참여해도 될까요? (Depth 0)",
      postId: "post-1",
      postTitle: "139페이지 3번째 문단에 대해 토론 ㄲㄲ",
      postType: "general",
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    },
  ],
};

const buildCommentTree = (
  flatComments: Comment[],
  parentId: string | undefined = undefined,
  currentDepth: number = 0
): Comment[] => {
  const nestedComments: Comment[] = [];

  flatComments
    .filter((comment) => (comment.parentId || undefined) === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .forEach((comment) => {
      const newComment = { ...comment, depth: currentDepth };

      newComment.replies = buildCommentTree(
        flatComments,
        newComment.id,
        currentDepth + 1
      );
      nestedComments.push(newComment);
    });
  return nestedComments;
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const currentUserId = 123;
  const currentUserProfileImage = COMMENT_AUTHOR_PROFILE_IMAGE_BASE_URL + "Me";

  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loadingPost, setLoadingPost] = useState(true);
  const [errorPost, setErrorPost] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);

  const handleAddReply = (parentId: string, content: string) => {
    console.log(`댓글 ${parentId}에 대한 답글 추가:`, content);

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: "현재 사용자",
      authorId: currentUserId,
      authorProfileImage: currentUserProfileImage, // ✨ 추가 ✨
      createdAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      content: content,
      postId: postId || `mock-post-${Date.now()}`,
      postTitle: post?.title || "알 수 없는 게시물",
      postType: post?.type || "general",
      communityId:
        post?.type === "community" && postId?.startsWith("comm")
          ? postId.split("-")[0]
          : undefined,
      isEdited: false,
      parentId: parentId,
      depth: 1,
      replies: [],
    };

    setComments((prevComments) => {
      const addReplyToTree = (
        commentsArray: Comment[],
        targetParentId: string,
        replyToAdd: Comment,
        currentLevel: number
      ): Comment[] => {
        return commentsArray.map((comment) => {
          if (comment.id === targetParentId) {
            const newReplyDepth = (comment.depth || 0) + 1;
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                { ...replyToAdd, depth: newReplyDepth },
              ],
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToTree(
                comment.replies,
                targetParentId,
                replyToAdd,
                currentLevel + 1
              ),
            };
          }
          return comment;
        });
      };

      return addReplyToTree(prevComments, parentId, newComment, 0);
    });
    // TODO: 실제 API 호출 (POST /posts/:id/comments with parentId)
  };

  useEffect(() => {
    const fetchPostData = () => {
      setLoadingPost(true);
      setErrorPost(null);

      if (!postId) {
        setErrorPost("게시물 ID가 제공되지 않았습니다.");
        setLoadingPost(false);
        return;
      }

      const fetchedPost = mockPostsDetailData[postId];
      if (fetchedPost) {
        setPost(fetchedPost);
        setEditedContent(fetchedPost.content);

        const initialFlatComments = rawMockCommentsData[postId] || [];

        const nestedComments = buildCommentTree(initialFlatComments);

        setComments(nestedComments);
      } else {
        setErrorPost("게시물을 찾을 수 없습니다.");
      }
      setLoadingPost(false);
    };

    fetchPostData();
    window.scrollTo(0, 0);
    setIsEditing(false);
  }, [postId]);

  const isPostAuthor = post?.authorId === currentUserId;

  const handleEditPost = () => {
    if (post && post.authorId !== currentUserId) {
      alert("게시물 작성자만 수정할 수 있습니다.");
      return;
    }
    setIsEditing(true);
  };

  const handleSavePost = () => {
    const trimmedEditedContent = editedContent.trim();
    const trimmedOriginalContent = post?.content.trim() || "";

    if (!trimmedEditedContent) {
      alert("게시물 내용을 입력해주세요.");
      return;
    }
    if (trimmedEditedContent === trimmedOriginalContent) {
      alert("수정된 내용이 없습니다.");
      setIsEditing(false);
      return;
    }

    // 실제로는 API 호출 (PUT /posts/:id)
    console.log(`게시물 ${postId} 수정 완료:`, trimmedEditedContent);

    if (post) {
      setPost({
        ...post,
        content: trimmedEditedContent,
        createdAt:
          new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }) + " (수정됨)",
      });

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

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (post) {
      setEditedContent(post.content);
    }
  };

  const handleDeletePost = () => {
    if (post && post.authorId !== currentUserId) {
      alert("게시물 작성자만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      console.log(`Delete post ${postId}`);

      delete mockPostsDetailData[postId!];
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
      authorProfileImage: currentUserProfileImage,
      createdAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      content: content,

      postId: postId || `mock-post-${Date.now()}`,
      postTitle: post?.title || "알 수 없는 게시물",
      postType: post?.type || "general",
      communityId:
        post?.type === "community" && postId?.startsWith("comm")
          ? postId.split("-")[0]
          : undefined,
      isEdited: false,
      parentId: undefined,
      depth: 0,
      replies: [],
    };
    setComments((prevComments) => [...prevComments, newComment]);
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
        <CommentInput onAddComment={handleAddComment} />
        <CommentList
          comments={comments}
          onAddReply={handleAddReply}
          currentUserId={currentUserId}
        />
      </div>
    </PostDetailTemplate>
  );
};

export default PostDetailPage;
