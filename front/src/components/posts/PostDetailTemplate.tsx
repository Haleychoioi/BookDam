// src/components/posts/PostDetailTemplate.tsx

import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaChevronLeft } from "react-icons/fa";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import remarkGfm from "remark-gfm";

import type { Post, TeamPost, UserProfile } from "../../types"; // ✨ UserProfile 임포트 ✨
import { formatKoreanDateTime } from "../../utils/dateFormatter";

interface PostDetailTemplateProps {
  post: Post | TeamPost | undefined;
  onEditPost: () => void;
  onDeletePost: () => void;
  children?: React.ReactNode;
  backToBoardPath: string;
  backToBoardText: string;
  isEditing: boolean;
  editedContent: string;
  onEditedContentChange: (newContent: string) => void;
  onSavePost: (updatedTitle?: string) => Promise<void>;
  onCancelEdit: () => void;
  isPostAuthor: boolean;
  currentUserProfile?: UserProfile; // ✨ currentUserProfile prop 타입 UserProfile로 변경 ✨
}

const PostDetailTemplate: React.FC<PostDetailTemplateProps> = ({
  post,
  onEditPost,
  onDeletePost,
  children,
  backToBoardPath,
  backToBoardText,
  isEditing,
  editedContent,
  onEditedContentChange,
  onSavePost,
  onCancelEdit,
  isPostAuthor,
  currentUserProfile, // ✨ prop으로 받기 ✨
}) => {
  // DEFAULT_AVATAR_URL을 Dicebear URL로 변경
  const DEFAULT_AVATAR_BASE_URL =
    "https://api.dicebear.com/8.x/identicon/svg?seed=";

  const getAuthorNickname = (p: Post | TeamPost | undefined): string => {
    // currentUserProfile이 있고, 현재 사용자가 작성자일 경우 currentUserProfile 닉네임 사용
    if (isPostAuthor && currentUserProfile?.nickname) {
      return currentUserProfile.nickname;
    }
    if (!p) return "알 수 없는 작성자";
    if ("postAuthor" in p && typeof p.postAuthor === "string") {
      return p.postAuthor;
    } else if (p.user?.nickname) {
      return p.user.nickname;
    }
    return "알 수 없는 작성자";
  };

  const getAuthorProfileImage = (p: Post | TeamPost | undefined): string => {
    // currentUserProfile이 있고, 현재 사용자가 작성자일 경우 currentUserProfile 이미지 사용
    if (isPostAuthor && currentUserProfile?.profileImage) {
      return `${currentUserProfile.profileImage}?${new Date().getTime()}`; // 캐시 무력화도 추가
    }
    if (!p) return `${DEFAULT_AVATAR_BASE_URL}Guest`;
    if (p.user?.profileImage) {
      // 게시물 데이터에 포함된 프로필 이미지 사용 (캐시 무력화)
      return `${p.user.profileImage}?${new Date().getTime()}`;
    }
    // 기본값으로 닉네임 기반 Dicebear 아바타 사용
    return `${DEFAULT_AVATAR_BASE_URL}${encodeURIComponent(
      getAuthorNickname(p)
    )}`;
  };
  const isModified = post?.updatedAt && post.updatedAt !== post.createdAt;

  const displayTitle = post?.title || "게시물 없음";
  const displayContent = post?.content || "";
  const displayCreatedAt = post?.createdAt
    ? formatKoreanDateTime(post.createdAt)
    : "날짜 미상";
  const displayUpdatedAt = post?.updatedAt
    ? formatKoreanDateTime(post.updatedAt)
    : "날짜 미상";

  return (
    <div className="min-h-full py-10 bg-white">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {/* 뒤로 가기 링크 */}
        <Link
          to={backToBoardPath}
          className="text-gray-600 hover:text-gray-800 flex items-center mb-8"
        >
          <div className="flex items-center">
            <FaChevronLeft className="w-4 h-4 text-gray-700 mr-1 mt-px" />
            <span>{backToBoardText}</span>
          </div>
        </Link>
        {/* 게시물 헤더 */}
        <h1 className="text-3xl font-bold text-gray-800 text-center my-16">
          {displayTitle}
        </h1>
        <div className="text-gray-500 text-sm border-b border-gray-200 pb-2">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center">
              <img
                src={getAuthorProfileImage(post)}
                alt={String(getAuthorNickname(post))}
                className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-200"
              />
              작성자: {String(getAuthorNickname(post))}{" "}
            </span>
            <span>
              {isModified ? "수정일: " : "게시일: "}
              {isModified ? displayUpdatedAt : displayCreatedAt}
            </span>
          </div>
        </div>
        {/* 게시물 관리/수정 버튼 */}
        {isPostAuthor && (
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => onSavePost()}
                  bgColor="bg-transparent"
                  textColor="text-gray-700"
                  hoverTextColor="hover:text-main"
                  hoverBgColor="hover:transperent"
                  className="px-4 py-2 rounded text-sm"
                >
                  저장
                </Button>
                <Button
                  onClick={onCancelEdit}
                  bgColor="bg-transparent"
                  textColor="text-gray-700"
                  hoverTextColor="hover:text-red-600"
                  hoverBgColor="hover:transperent"
                  className="px-4 py-2 rounded text-sm"
                >
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onEditPost}
                  bgColor="bg-transparent"
                  textColor="text-gray-700"
                  hoverTextColor="hover:text-main"
                  hoverBgColor="hover:transperent"
                  className="px-4 py-2 rounded text-sm"
                >
                  수정
                </Button>
                <Button
                  onClick={onDeletePost}
                  bgColor="bg-transparent"
                  textColor="text-gray-700"
                  hoverTextColor="hover:text-red-600"
                  hoverBgColor="hover:transperent"
                  className="px-4 py-2 rounded text-sm"
                >
                  삭제
                </Button>
              </>
            )}
          </div>
        )}
        {/* 게시물 내용 (수정 모드에 따라 다르게 렌더링) */}
        <div className="mb-8 py-4 px-16" data-color-mode="light">
          {isEditing ? (
            <MDEditor
              value={editedContent}
              onChange={(newValue) => onEditedContentChange(newValue || "")}
              height={400}
              preview="live"
              previewOptions={{
                remarkPlugins: [[remarkGfm]],
              }}
            />
          ) : (
            <MDEditor.Markdown
              source={displayContent}
              remarkPlugins={[remarkGfm]}
              style={{
                padding: 16,
              }}
            />
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default PostDetailTemplate;
