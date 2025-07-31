import { Link } from "react-router-dom";
import HeartButton from "../common/HeartButton";
import { type Book, type MyLibraryBook } from "../../types";
import { FaTrash } from "react-icons/fa";

interface BookGridDisplayProps {
  books: (Book | MyLibraryBook)[];
  className?: string;
  onRemoveFromWishlist?: (isbn13: string, bookTitle: string) => void;
  showWishlistButton?: boolean;
  showDeleteButton?: boolean;
  onDeleteFromMyLibrary?: (isbn13: string, bookTitle: string) => void;
}

function isMyLibraryBook(book: Book | MyLibraryBook): book is MyLibraryBook {
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
    book: Book | MyLibraryBook,
    isWishlisted: boolean
  ) => {
    if (!isWishlisted && onRemoveFromWishlist) {
      onRemoveFromWishlist(book.isbn13, book.title);
    }
  };

  const handleDeleteButtonClick = (
    book: MyLibraryBook,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (onDeleteFromMyLibrary) {
      onDeleteFromMyLibrary(book.isbn13, book.title);
    }
  };

  return (
    <div className={`grid gap-x-8 gap-y-12 justify-items-center ${className}`}>
      {books.map((book, index) => (
        <Link
          key={book.isbn13 || index}
          to={`/books/${book.isbn13}`}
          className="group w-52 flex flex-col items-center max-w-full relative"
        >
          {/* 책 커버 이미지 */}
          <img
            src={book.coverImage || "/x0I5nAsbefrRCgbR6jio5dvWhA.jpg"}
            alt={book.title}
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
            // bottom-2 right-2 를 top-2 right-2 로 변경
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={(event) => handleDeleteButtonClick(book, event)}
                className="p-2 rounded-full bg-red-400 bg-opacity-80 text-white hover:bg-red-600 transition-colors duration-200 shadow-md"
                aria-label={`Delete ${book.title} from My Library`}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 책 제목 */}
          <p className="mt-3 text-base text-gray-800 font-medium text-center truncate w-full">
            {book.title.length > 15
              ? `${book.title.substring(0, 15)}...`
              : book.title}
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
      ))}
      {books.length === 0 && (
        <p className="col-span-full text-center text-gray-500 py-10">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};

export default BookGridDisplay;
