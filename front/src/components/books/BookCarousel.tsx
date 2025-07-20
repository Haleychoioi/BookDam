// front/src/components/common/BookCarousel.tsx

import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘

interface BookCarouselProps {
  title: string;
  books: Array<{
    id: string;
    coverImage: string;
    title: string;
    author: string;
  }>;
}

const BookCarousel: React.FC<BookCarouselProps> = ({ title, books }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 캐러셀의 시작 인덱스
  const itemsPerPage = 4;

  // 이전 버튼 클릭 핸들러
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(books.length - itemsPerPage, prevIndex + itemsPerPage)
    );
  };

  // 보여줄 책 목록을 계산
  const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage);

  // 캐러셀이 슬라이딩 가능할 만큼 충분한 책이 없는 경우 비활성화
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < books.length;

  return (
    <div>
      <h2 className="text-2xl text-gray-800 text-center">{title}</h2>
      <div className="flex items-center justify-center space-x-4 mt-20">
        {/* 왼쪽 화살표 */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev} // 이전으로 갈 수 없을 때 비활성화
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        {/* 책 목록 */}
        <div className="flex flex-grow justify-center space-x-10">
          {/* overflow-hidden 추가 */}
          {visibleBooks.map((book) => (
            <div
              key={book.id}
              className="w-40 h-64 rounded-md shadow-md flex-shrink-0"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover rounded-md"
              />
              {/* <div className="p-2 text-sm text-center font-semibold">{book.title}</div> */}
            </div>
          ))}
          {/* visibleBooks의 개수가 itemsPerPage보다 적을 경우 빈 플레이스홀더를 채워 정렬 유지 (선택 사항) */}
          {visibleBooks.length < itemsPerPage &&
            Array(itemsPerPage - visibleBooks.length)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-40 h-64 flex-shrink-0"
                />
              ))}
        </div>

        {/* 오른쪽 화살표 */}
        <button
          onClick={handleNext}
          disabled={!canGoNext} // 다음으로 갈 수 없을 때 비활성화
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            !canGoNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default BookCarousel;
