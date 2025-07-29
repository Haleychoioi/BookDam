import { useState } from "react";
import { Link } from "react-router-dom";
import type { Book } from "../../types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface BookCarouselProps {
  title: string;
  books: Book[];
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

  const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage);

  // 캐러셀이 슬라이딩 가능할 만큼 충분한 책이 없는 경우 비활성화
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < books.length;

  return (
    <div className="mb-16">
      <h2 className="text-2xl text-gray-800 text-center mb-4">{title}</h2>
      <div className="flex items-center justify-center space-x-4 mt-10">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        {/* 책 목록 */}
        <div className="flex flex-grow justify-center space-x-8 ">
          {visibleBooks.map((book, index) => (
            <Link
              key={book.isbn13 || index}
              to={`/books/${book.isbn13}`}
              className="w-60 h-80 flex-shrink-0 flex flex-col items-center"
            >
              <img
                src={
                  book.coverImage ||
                  "https://via.placeholder.com/160x256/E0E0E0/909090?text=No+Cover"
                }
                alt={book.title}
                className="w-4/5 h-64 object-cover rounded-md mb-4 flex-grow"
              />

              <p className="text-sm font-medium text-gray-800 text-center px-2 w-full truncate">
                {book.title}
              </p>
            </Link>
          ))}

          {visibleBooks.length < itemsPerPage &&
            Array(itemsPerPage - visibleBooks.length)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-60 h-80 flex-shrink-0"
                />
              ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
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
