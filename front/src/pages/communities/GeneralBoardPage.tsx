import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import type { Post } from "../../types";

const allGeneralPostsMockData: Post[] = Array.from({ length: 100 }, (_, i) => ({
  id: `general-post-${i + 1}`,
  title: `[전체] ${i + 1}번째 흥미로운 이야기`,
  commentCount: Math.floor(Math.random() * 20) + 1,
  createdAt: new Date().toISOString(), // 현재 날짜를 ISO 형식 문자열로
  updatedAt: undefined, // 선택적 필드이므로 일단 undefined
  type: "general",
  author: `작성자 ${i + 1}`,
  authorId: `user-${i + 1}`,
  content: `이것은 [전체] ${i + 1}번째 게시물의 내용입니다.`,
}));

const GeneralBoardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 페이지당 게시물 수

  const allPostsForGeneralBoard = useMemo(() => {
    return allGeneralPostsMockData;
  }, []);

  const totalPosts = allPostsForGeneralBoard.length;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  const displayedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allPostsForGeneralBoard.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, allPostsForGeneralBoard]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: 실제 API 호출 로직: fetchAllPosts(page); (API 명세: GET /posts)
  };

  const handleWritePostClick = () => {
    navigate("/posts/new");
  };

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const generalHeaderContent = (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        책담
      </h1>
      <p className="text-lg">
        어떤 책이든, 어떤 이야기든 좋아요. '책담'에서 당신의 목소리를
        들려주세요.
      </p>
    </>
  );

  return (
    <BoardTemplate
      headerContent={generalHeaderContent}
      posts={displayedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onWritePostClick={handleWritePostClick}
      boardTitle="게시물"
    />
  );
};

export default GeneralBoardPage;
