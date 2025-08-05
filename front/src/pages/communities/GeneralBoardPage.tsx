// src/pages/communities/GeneralBoardPage.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BoardTemplate from "../../components/posts/BoardTemplate";
import { fetchAllPosts } from "../../api/posts";

import type { Post } from "../../types";

const GeneralBoardPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    return Math.ceil(totalPosts / itemsPerPage);
  }, [totalPosts, itemsPerPage]);


const loadPosts = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetchAllPosts(
      currentPage,
      itemsPerPage,
      "latest",
      undefined
    );
    setPosts(response.posts);
    setTotalPosts(response.totalResults);
  } catch (err: unknown) {
    console.error("게시물 불러오기 실패:", err);
    setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    setPosts([]);
    setTotalPosts(0);
  } finally {
    setLoading(false);
  }
}, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadPosts();
    window.scrollTo(0, 0);
  }, [loadPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleWritePostClick = () => {
    navigate("/posts/write");
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        <h1 className="text-4xl md:text-5xl mb-6 mt-10">책담</h1>
        <p className="text-lg text-gray-600 mb-8">
          어떤 책이든, 어떤 이야기든 좋아요. '책담'에서 당신의 목소리를
          들려주세요.
        </p>

        {loading ? (
          <div className="text-center text-gray-600 py-10">
            게시물을 불러오는 중...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10">오류: {error}</div>
        ) : (
          <BoardTemplate
            boardTitle=""
            posts={posts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onWritePostClick={handleWritePostClick}
            onPostClick={(postId) => navigate(`/posts/${postId}`)}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default GeneralBoardPage;
