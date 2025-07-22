import { Link } from "react-router-dom";

// 더미 책 데이터 인터페이스 (BookSearchResultPage와 동일하게 유지)
interface Book {
  id: string;
  coverImage: string;
  title: string;
  author: string;
}

interface BookGridDisplayProps {
  books: Book[]; // 표시할 책 목록
  className?: string; // 외부에서 추가할 Tailwind CSS 클래스
}

const BookGridDisplay: React.FC<BookGridDisplayProps> = ({
  books,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-12 justify-items-center ${className}`}
    >
      {books.map((book) => (
        <Link
          key={book.id}
          to={`/books/${book.id}`}
          className="w-52 h-80 flex flex-col items-center" // 이미지와 동일한 크기
        >
          {/* 책 커버 이미지 */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover rounded-md shadow-md"
          />

          {/* 책 제목 */}
          <p className="mt-3  mb-5 text-base text-gray-800 font-medium text-center truncate w-full">
            {book.title.length > 15
              ? `${book.title.substring(0, 15)}...`
              : book.title}
          </p>
        </Link>
      ))}
      {books.length === 0 && ( // 책이 없을 때 메시지 추가 (선택 사항)
        <p className="col-span-full text-center text-gray-500 py-10">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};

export default BookGridDisplay;
