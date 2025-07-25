import { Link } from "react-router-dom";
import HeartButton from "../common/HeartButton";
import { type Book, type MyLibraryBook } from "../../types";

interface BookGridDisplayProps {
  books: (Book | MyLibraryBook)[];
  className?: string;
  onRemoveFromWishlist?: (bookId: string, bookTitle: string) => void;
  showWishlistButton?: boolean;
}

function isMyLibraryBook(book: Book | MyLibraryBook): book is MyLibraryBook {
  return (book as MyLibraryBook).status !== undefined;
}

const BookGridDisplay: React.FC<BookGridDisplayProps> = ({
  books,
  className = "",
  onRemoveFromWishlist,
  showWishlistButton = false,
}) => {
  const handleHeartButtonClick = (book: Book, isWishlisted: boolean) => {
    // isWishlisted는 HeartButton 내부에서 현재 찜 상태를 토글한 결과이므로,
    // 여기서는 `false` (즉, 찜 해제 상태)일 때만 onRemoveFromWishlist 호출
    if (!isWishlisted && onRemoveFromWishlist) {
      onRemoveFromWishlist(book.id, book.title);
    }
  };

  return (
    <div className={`grid gap-x-8 gap-y-12 justify-items-center ${className}`}>
      {books.map((book) => (
        <Link
          key={book.id}
          to={`/books/${book.id}`}
          className="w-52 h-96 flex flex-col items-center max-w-full relative"
        >
          {/* 책 커버 이미지 */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-4/5 object-cover rounded-md shadow-md"
          />

          {/* 하트 버튼 */}
          {showWishlistButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 이제 HeartButton의 onClick은 handleHeartButtonClick을 호출
                // HeartButton 자체의 onClick은 isWishlisted 인자만 제공하므로,
                // 여기에 다시 한번 HeartButton을 렌더링하고 그 onClick을 활용
              }}
              className="absolute top-64 right-2.5 p-0 bg-transparent border-none focus:outline-none"
            >
              <HeartButton
                initialIsWishlisted={true}
                onClick={(isWishlisted) =>
                  handleHeartButtonClick(book, isWishlisted)
                }
                className="p-2 rounded-full shadow-md"
              />
            </button>
          )}

          {/* 책 제목 */}
          <p className="mt-3 text-base text-gray-800 font-medium text-center truncate w-full">
            {book.title.length > 15
              ? `${book.title.substring(0, 15)}...`
              : book.title}
          </p>

          {/* 읽은 책일 경우 별점 표시 */}
          {isMyLibraryBook(book) && book.myRating !== undefined && (
            <p className="text-sm text-gray-600 mt-1">
              평가함 <span className="text-yellow-400">★</span> {book.myRating}
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
