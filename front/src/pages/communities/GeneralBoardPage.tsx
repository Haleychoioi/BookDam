// front/src/pages/posts/GeneralBoardPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate"; // 경로 확인
import type { Post } from "../../types";

// Mock 데이터: 전체 게시판용 게시글 목록
const allGeneralPostsMockData: Post[] = Array.from({ length: 100 }, (_, i) => ({
  id: `general-post-${i + 1}`,
  title: `[전체] ${i + 1}번째 흥미로운 이야기`,
  commentCount: Math.floor(Math.random() * 20) + 1,
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
    navigate("/posts/new"); // 전체 게시판 새 게시물 작성 페이지로 이동
  };

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // BoardTemplate에 전달할 headerContent JSX (타입은 React.ReactNode)
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
      headerContent={generalHeaderContent} // ✨ headerContent 프롭스에 전달 ✨
      posts={displayedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onWritePostClick={handleWritePostClick}
      boardTitle="게시물" // 게시글 섹션 제목
    />
  );
};

export default GeneralBoardPage;
