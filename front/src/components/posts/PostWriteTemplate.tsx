// src/components/posts/PostWriteTemplate.tsx

import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import Button from "../common/Button";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import remarkGfm from "remark-gfm";

import { PostType, TeamPostType } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { fetchMyRecruitingCommunities } from "../../api/communities";
import { useAuth } from "../../hooks/useAuth";

interface PostWriteTemplateProps {
  onSubmit: (formData: {
    title: string;
    content: string;
    type?: PostType | TeamPostType;
    communityId?: string;
  }) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  submitButtonText: string;
  initialData?: {
    title?: string;
    content?: string;
    type?: PostType | TeamPostType;
  };
  isCommunityPost?: boolean;
}

const PostWriteTemplate: React.FC<PostWriteTemplateProps> = ({
  onSubmit,
  onCancel,
  loading,
  error,
  submitButtonText,
  initialData,
  isCommunityPost,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [postType, setPostType] = useState<PostType | TeamPostType>(
    isCommunityPost ? TeamPostType.DISCUSSION : PostType.GENERAL
  );

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const { showToast } = useToast();
  const { currentUserProfile } = useAuth();
  const userId = currentUserProfile?.userId;

  const { data: recruitingCommunities, isLoading: isLoadingCommunities } =
    useQuery({
      queryKey: ["myRecruitingCommunities", userId],
      queryFn: () => {
        if (!userId) {
          throw new Error("로그인이 필요합니다.");
        }
        return fetchMyRecruitingCommunities();
      },
      enabled: !isCommunityPost && postType === PostType.RECRUITMENT,
    });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      if (initialData.type) {
        setPostType(initialData.type);
      } else {
        setPostType(
          isCommunityPost ? TeamPostType.DISCUSSION : PostType.GENERAL
        );
      }
    }
  }, [initialData, isCommunityPost]);

  useEffect(() => {
    if (
      !isCommunityPost &&
      postType === PostType.RECRUITMENT &&
      recruitingCommunities &&
      recruitingCommunities.length > 0 &&
      !selectedCommunityId
    ) {
      setSelectedCommunityId(recruitingCommunities[0].id);
    }
  }, [recruitingCommunities, isCommunityPost, postType, selectedCommunityId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (newValue: string | undefined) => {
    setContent(newValue || "");
  };

  const handlePostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setPostType(newType as PostType | TeamPostType);
  };

  const handleSubmitClick = () => {
    if (title.trim().length === 0) {
      showToast("제목을 입력해주세요.", "warn");
      return;
    }
    if (content.trim().length === 0) {
      showToast("내용을 입력해주세요.", "warn");
      return;
    }

    if (postType === PostType.RECRUITMENT && !selectedCommunityId) {
      showToast("연결할 모집 커뮤니티를 선택해주세요.", "warn");
      return;
    }

    onSubmit({
      title,
      content,
      type: postType,
      communityId: selectedCommunityId || undefined,
    });
  };

  return (
    <div className="min-h-screen py-5">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isCommunityPost && (
          <div className="mb-6">
            <label
              htmlFor="postType"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              글 타입
            </label>
            <select
              id="postType"
              value={postType}
              onChange={handlePostTypeChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            >
              <option value={PostType.GENERAL}>일반글</option>
              <option value={PostType.RECRUITMENT}>모집글</option>
            </select>
          </div>
        )}

        {!isCommunityPost && postType === PostType.RECRUITMENT && (
          <div className="mb-6">
            <label
              htmlFor="communitySelect"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              연결할 커뮤니티 선택
            </label>
            {isLoadingCommunities ? (
              <p className="text-gray-500">
                모집 중인 커뮤니티 목록을 불러오는 중...
              </p>
            ) : (
              <select
                id="communitySelect"
                value={selectedCommunityId || ""}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
              >
                <option value="" disabled>
                  커뮤니티를 선택하세요
                </option>
                {recruitingCommunities?.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.title}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingCommunities && recruitingCommunities?.length === 0 && (
              <p className="mt-2 text-gray-500">
                모집 중인 커뮤니티가 없습니다. <br />새 커뮤니티는 도서 상세
                페이지에서 만들 수 있습니다.
              </p>
            )}
          </div>
        )}

        {isCommunityPost && (
          <div className="mb-6">
            <label
              htmlFor="postType"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              글 타입
            </label>
            <select
              id="postType"
              value={postType}
              onChange={(e) => setPostType(e.target.value as TeamPostType)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            >
              <option value={TeamPostType.DISCUSSION}>토론</option>
              <option value={TeamPostType.NOTICE}>공지</option>
            </select>
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            value={title}
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="mb-8" data-color-mode="light">
          <label
            htmlFor="content"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            내용
          </label>
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height={400}
            preview="live"
            previewOptions={{
              remarkPlugins: [[remarkGfm]],
            }}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            bgColor="bg-gray-400"
            textColor="text-white"
            hoverBgColor="hover:bg-gray-500"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmitClick}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            disabled={loading}
          >
            {loading ? "처리 중..." : submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostWriteTemplate;
