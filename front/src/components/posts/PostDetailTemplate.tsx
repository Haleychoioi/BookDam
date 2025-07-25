import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaChevronLeft } from "react-icons/fa";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import remarkGfm from "remark-gfm";

import type { Post } from "../../types";

interface PostDetailTemplateProps {
  post: Post;
  onEditPost: () => void;
  onDeletePost: () => void;
  children?: React.ReactNode;
  backToBoardPath: string;
  backToBoardText: string;
  isEditing: boolean;
  editedContent: string;
  onEditedContentChange: (newContent: string) => void;
  onSavePost: () => void;
  onCancelEdit: () => void;
  isPostAuthor: boolean;
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
}) => {
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
          {post.title}
        </h1>
        <div className="text-right text-gray-500 text-sm border-b border-gray-200 pb-2 mb-3">
          <span className="mr-4">작성자: {post.author}</span>
          <span>게시일: {post.createdAt}</span>
        </div>

        {/* 게시물 관리/수정 버튼 */}
        {isPostAuthor && (
          <div className="flex justify-end space-x-2 mb-5">
            {isEditing ? (
              <>
                <Button
                  onClick={onSavePost}
                  bgColor="bg-blue-500"
                  textColor="text-white"
                  hoverBgColor="hover:bg-blue-600"
                  className="px-4 py-2 rounded text-sm"
                >
                  저장
                </Button>
                <Button
                  onClick={onCancelEdit}
                  bgColor="bg-gray-400"
                  textColor="text-white"
                  hoverBgColor="hover:bg-gray-500"
                  className="px-4 py-2 rounded text-sm"
                >
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onEditPost}
                  bgColor="bg-gray-200"
                  textColor="text-gray-700"
                  hoverTextColor="hover:text-gray-800"
                  className="px-4 py-2 rounded text-sm"
                >
                  수정
                </Button>
                <Button
                  onClick={onDeletePost}
                  bgColor="bg-gray-200"
                  textColor="text-gray-700 hover:text-white"
                  hoverBgColor="hover:bg-red-600"
                  className="px-4 py-2 rounded text-sm"
                >
                  삭제
                </Button>
              </>
            )}
          </div>
        )}

        {/* 게시물 내용 (수정 모드에 따라 다르게 렌더링) */}
        <div className="mb-8 py-4 px-24" data-color-mode="light">
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
              source={post.content}
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
