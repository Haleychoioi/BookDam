import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import BookCategoryFilter from "../../components/bookResults/BookCategoryFilter";

import type { Book } from "../../types";

// 더미 책 데이터 배열 (총 200개를 가정)
const allDummyBooks: Book[] = Array.from({ length: 200 }, (_, i) => ({
  id: `book-${i + 1}`,
  coverImage: `https://via.placeholder.com/160x256/F0F0F0/B0B0B0?text=Book+${
    i + 1
  }`,
  title: `집 가자 ${i + 1}`, // 제목에 공백이 있습니다.
  author: `작가 ${i + 1}`,
}));

// 카테고리 목록
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

  const itemsPerPage = 12;

  const displayedBooks = useMemo(() => {
    let filteredBooks = allDummyBooks;

    if (currentSearchTerm) {
      // currentSearchTerm은 SearchBar에서 이미 모든 공백이 제거된 상태입니다.
      const processedSearchTerm = currentSearchTerm;

      filteredBooks = filteredBooks.filter((book) => {
        // ✨ 책 제목과 저자에서도 공백을 제거한 후 검색어와 비교 ✨
        const processedBookTitle = book.title.replace(/\s/g, "");
        const processedBookAuthor = book.author.replace(/\s/g, "");

        return (
          processedBookTitle.includes(processedSearchTerm) ||
          processedBookAuthor.includes(processedSearchTerm)
        );
      });
    }

    // 페이지네이션 적용
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, currentSearchTerm]);

  // 필터링된 결과의 총 페이지 수
  const totalFilteredBooks = useMemo(() => {
    let countFilteredBooks = allDummyBooks;
    if (currentSearchTerm) {
      const processedSearchTerm = currentSearchTerm;
      countFilteredBooks = countFilteredBooks.filter((book) => {
        const processedBookTitle = book.title.replace(/\s/g, "");
        const processedBookAuthor = book.author.replace(/\s/g, "");
        return (
          processedBookTitle.includes(processedSearchTerm) ||
          processedBookAuthor.includes(processedSearchTerm)
        );
      });
    }
    return countFilteredBooks.length;
  }, [currentSearchTerm]);

  const totalPages = Math.ceil(totalFilteredBooks / itemsPerPage);

  const handleSearchSubmit = (term: string) => {
    setCurrentSearchTerm(term);
    setCurrentPage(1);
    navigate(`/search/books?q=${encodeURIComponent(term)}`);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory((prevCategory) =>
      prevCategory === category ? null : category
    );
    setCurrentPage(1);
    // TODO: 실제 API 호출 로직: fetchBooks(currentSearchTerm, newCategory, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: 실제 API 호출 로직: fetchBooks(currentSearchTerm, activeCategory, page);
  };

  useEffect(() => {
    setCurrentSearchTerm(initialSearchQuery);
  }, [initialSearchQuery]);

  return (
    <div className="min-h-screen py-10">
      {/* 페이지 상단 검색창 */}
      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-8">
        <SearchBar
          placeholder="검색어를 입력해주세요"
          className="max-w-xl mx-auto"
          initialQuery={initialSearchQuery}
          onSearch={handleSearchSubmit}
        />
      </div>

      {/* ✨ 분리된 카테고리 필터 컴포넌트 사용 ✨ */}
      <div className="container mx-auto px-4 lg:px-20 xl:px-32 mb-16">
        <BookCategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      {/* ✨ 분리된 책 검색 결과 그리드 컴포넌트 사용 ✨ */}
      <div className="container mx-auto px-4 lg:px-20 xl:px-32">
        <BookGridDisplay
          books={displayedBooks}
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
        />
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default BookSearchResultPage;
