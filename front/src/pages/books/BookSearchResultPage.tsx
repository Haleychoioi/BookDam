import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import BookCategoryFilter from "../../components/bookResults/BookCategoryFilter";

import type { Book } from "../../types";

const allDummyBooks: Book[] = Array.from({ length: 200 }, (_, i) => ({
  isbn13: `978893746012${(i + 1).toString().padStart(2, "0")}`, // 13자리 ISBN 형식으로 더미 데이터 생성
  coverImage: `/x0I5nAsbefrRCgbR6jio5dvWhA.jpg`,
  title: `집 가자 ${i + 1}`,
  author: `작가 ${i + 1}`,
  publisher: `출판사 ${Math.floor(i / 10) + 1}`, // 더미 출판사
  publicationDate: `2023-0${Math.floor(i / 20) + 1}-${(i % 28) + 1}`, // 더미 출판일 (YYYY-MM-DD)
  description: `이것은 '집 가자 ${
    i + 1
  }' 책의 더미 설명입니다. 책 내용 요약 및 기타 상세 정보가 여기에 들어갑니다.`, // 더미 설명
  genre:
    ["소설", "인문학", "자기계발", "과학", "역사", "에세이"][i % 6] || null, // 더미 장르 (백엔드 category에 해당)
}));

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
    navigate(`/books/search?q=${encodeURIComponent(term)}`);
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
        <BookGridDisplay
          books={displayedBooks}
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default BookSearchResultPage;
