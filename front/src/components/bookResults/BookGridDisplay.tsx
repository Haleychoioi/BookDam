// src/components/bookResults/BookGridDisplay.tsx

import { Link } from "react-router-dom";
import HeartButton from "../common/HeartButton";
import { type BookSummary, type MyLibraryBook } from "../../types";
import { FaTrash } from "react-icons/fa";

interface BookGridDisplayProps {
  books: (BookSummary | MyLibraryBook)[];
  className?: string;
  onRemoveFromWishlist?: (isbn13: string, bookTitle: string) => void;
  showWishlistButton?: boolean;
  showDeleteButton?: boolean;
  onDeleteFromMyLibrary?: (isbn13: string, bookTitle: string) => void;
}

function isMyLibraryBook(
  book: BookSummary | MyLibraryBook
): book is MyLibraryBook {
  return (book as MyLibraryBook).libraryId !== undefined;
}

const BookGridDisplay: React.FC<BookGridDisplayProps> = ({
  books,
  className = "",
  onRemoveFromWishlist,
  showWishlistButton = false,
  onDeleteFromMyLibrary,
  showDeleteButton = false,
}) => {
  const handleHeartButtonClick = (
    book: BookSummary | MyLibraryBook,
    isWishlisted: boolean
  ) => {
    // isMyLibraryBook을 사용하여 타입에 따라 속성 접근
    const currentIsbn13 = isMyLibraryBook(book)
      ? book.book.isbn13
      : book.isbn13;
    const currentTitle = isMyLibraryBook(book) ? book.book.title : book.title;

    if (!isWishlisted && onRemoveFromWishlist) {
      onRemoveFromWishlist(currentIsbn13, currentTitle);
    }
  };

  const handleDeleteButtonClick = (
    book: MyLibraryBook,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (onDeleteFromMyLibrary) {
      onDeleteFromMyLibrary(book.book.isbn13, book.book.title); // MyLibraryBook은 'book' 객체 안에 속성이 있습니다.
    }
  };

  return (
    <div className={`grid gap-x-8 gap-y-12 justify-items-center ${className}`}>
      {books.map((book, index) => {
        // ✨ 이 부분을 추가하여 book 객체와 그 내부 속성을 더 안전하게 접근합니다. ✨
        if (!book) {
          return null; // book 자체가 null/undefined인 경우 건너뛰기
        }

        let displayIsbn13: string | undefined;
        let displayCover: string | null | undefined;
        let displayTitle: string | undefined;

        if (isMyLibraryBook(book)) {
          // MyLibraryBook일 경우, 중첩된 'book' 속성이 존재하는지 확인
          if (!book.book) {
            // console.warn("MyLibraryBook found without nested 'book' property:", book);
            return null; // 중첩된 book 속성이 없으면 렌더링 건너뛰기
          }
          displayIsbn13 = book.book.isbn13;
          displayCover = book.book.cover;
          displayTitle = book.book.title;
        } else {
          // BookSummary일 경우 직접 속성 사용
          displayIsbn13 = book.isbn13;
          displayCover = book.cover;
          displayTitle = book.title;
        }

        // 필수 정보(ISBN13, 제목)가 없는 경우 렌더링 건너뛰기
        if (!displayIsbn13 || !displayTitle) {
          // console.warn("Book missing ISBN or Title, skipping:", book);
          return null;
        }

        return (
          <Link
            key={displayIsbn13 || index} // displayIsbn13은 이제 유효함
            to={`/books/${displayIsbn13}`}
            className="group w-52 flex flex-col items-center max-w-full relative"
          >
            {/* 책 커버 이미지 */}
            <img
              src={displayCover || "/x0I5nAsbefrRCgbR6jio5dvWhA.jpg"}
              alt={displayTitle}
              className="w-full h-full object-cover rounded-md shadow-md"
            />

            {/* 하트 버튼 (위시리스트 전용) - 오른쪽 위에 배치 */}
            {showWishlistButton && (
              <div className="absolute top-2 right-2 z-10">
                <HeartButton
                  initialIsWishlisted={true}
                  onClick={(isWishlisted) =>
                    handleHeartButtonClick(book, isWishlisted)
                  }
                  className="p-2 rounded-full shadow-md"
                />
              </div>
            )}

            {/* 삭제 버튼 (내 서재 전용) - 항상 오른쪽 위에 표시 */}
            {showDeleteButton && isMyLibraryBook(book) && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(event) => handleDeleteButtonClick(book, event)}
                  className="p-2 rounded-full bg-red-400 bg-opacity-80 text-white hover:bg-red-600 transition-colors duration-200 shadow-md"
                  aria-label={`Delete ${book.book.title} from My Library`}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 책 제목 */}
            <p className="mt-3 text-base text-gray-800 font-medium text-center truncate w-full">
              {displayTitle.length > 15
                ? `${displayTitle.substring(0, 15)}...`
                : displayTitle}
            </p>

            {/* 읽은 책일 경우 별점 표시 */}
            {isMyLibraryBook(book) &&
              book.myRating !== undefined &&
              book.myRating !== null && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-yellow-400">★</span> {book.myRating}
                  /5
                </p>
              )}
          </Link>
        );
      })}
      {books.length === 0 && (
        <p className="col-span-full text-center text-gray-500 py-10">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};

export default BookGridDisplay;
