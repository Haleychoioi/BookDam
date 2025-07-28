import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import BookCategoryFilter from "../../components/bookResults/BookCategoryFilter";

import type { Book } from "../../types";
import { searchBooks } from "../../api/books";

const categories = ["만화", "인문학", "소설/시/희곡", "외국어", "여행", "잡지"];

const BookSearchResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  const initialSearchQuery = queryParams.get("q") || "";

  const [currentSearchTerm, setCurrentSearchTerm] =
    useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const fetchBooks = useCallback(
    async (
      searchTerm: string,
      category: string | null,
      page: number,
      size: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchBooks(searchTerm, page, size, category);
        setBooks(data.books);
        setTotalResults(data.total);
      } catch (err) {
        console.error("도서 검색 실패:", err);
        setError("도서 정보를 불러오는 데 실패했습니다.");
        setBooks([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentSearchTerm) {
      fetchBooks(currentSearchTerm, activeCategory, currentPage, itemsPerPage);
    } else {
      setBooks([]);
      setTotalResults(0);
    }
  }, [
    currentSearchTerm,
    activeCategory,
    currentPage,
    itemsPerPage,
    fetchBooks,
  ]);

  useEffect(() => {
    if (initialSearchQuery !== currentSearchTerm) {
      setCurrentSearchTerm(initialSearchQuery);
      setCurrentPage(1);
      setActiveCategory(null);
    }
  }, [initialSearchQuery, currentSearchTerm]);

  const handleSearchSubmit = (term: string) => {
    setCurrentSearchTerm(term);
    setCurrentPage(1);
    setActiveCategory(null);
    navigate(`/books/search?q=${encodeURIComponent(term)}`);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-8">
        <SearchBar
          placeholder="검색어를 입력해주세요"
          className="max-w-xl mx-auto"
          initialQuery={initialSearchQuery}
          onSearch={handleSearchSubmit}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-16">
        <BookCategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        {loading && (
          <p className="text-center text-gray-600">
            도서 정보를 불러오는 중...
          </p>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}
        {
          // 로딩 중이 아니고 에러도 없으며, 검색어가 있는데 결과가 없을 때
          !loading && !error && books.length === 0 && currentSearchTerm && (
            <p className="text-center text-gray-600">검색 결과가 없습니다.</p>
          )
        }
        {
          // 로딩 중이 아니고 에러도 없으며, 책이 있을 때만 그리드 표시
          !loading && !error && books.length > 0 && (
            <BookGridDisplay
              books={books} // ✨ 이제 백엔드에서 받아온 실제 books 사용 ✨
              className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
            />
          )
        }
      </div>

      {
        // 로딩 중이 아니고 에러도 없으며, 총 페이지가 1보다 클 때만 페이지네이션 표시
        !loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )
      }
    </div>
  );
};

export default BookSearchResultPage;
