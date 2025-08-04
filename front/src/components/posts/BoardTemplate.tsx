import Button from "../common/Button";
import Pagination from "../common/Pagination";
import PostList from "../posts/PostList";
import type { Post } from "../../types";

interface BoardTemplateProps {
  bookTitle?: string;
  communityTopic?: string;
  posts: Post[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onWritePostClick: () => void;
  boardTitle: string;
  headerContent?: React.ReactNode;
}

const BoardTemplate: React.FC<BoardTemplateProps> = ({
  bookTitle,
  communityTopic,
  posts,
  currentPage,
  totalPages,
  onPageChange,
  onWritePostClick,
  boardTitle,
  headerContent,
}) => {
  return (
    <div className="min-h-full py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {headerContent ? (
          <div className="mb-36 mt-24">{headerContent}</div>
        ) : (
          <h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-36 mt-24">
            {communityTopic && bookTitle
              ? `${communityTopic} | ${bookTitle}`
              : communityTopic || bookTitle}
          </h1>
        )}

        {/* 게시글 목록 및 작성 버튼 */}
        <div className="relative mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {boardTitle}
          </h2>
          <div className="absolute top-0 right-0">
            <Button
              onClick={onWritePostClick}
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="px-5 py-2 rounded-lg text-base"
            >
              게시물 작성
            </Button>
          </div>

          <PostList posts={posts} />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default BoardTemplate;
