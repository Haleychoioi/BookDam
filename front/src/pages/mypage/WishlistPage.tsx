import { useState, useEffect, useMemo, useCallback } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import { type Book } from "../../types";

const dummyWishlistBooks: Book[] = Array.from({ length: 15 }, (_, i) => ({
  id: `wishlist-book-${i + 1}`,
  coverImage: `https://via.placeholder.com/160x256/E0E0E0/909090?text=Wish+Book+${
    i + 1
  }`,
  title: `위시리스트 책 ${i + 1}`,
  author: `위시 저자 ${i + 1}`,
  publisher: `위시 출판사 ${i + 1}`,
  pubDate: `2024-01-${(i % 28) + 1}`,
  averageRating: parseFloat((Math.random() * 5).toFixed(1)),
  description: `이것은 위시리스트 책 ${i + 1}의 더미 설명입니다.`,
  genre: i % 2 === 0 ? "판타지" : "자기계발",
  summary: `위시리스트 책 ${i + 1}의 짧은 더미 요약입니다.`,
}));

const WishlistPage: React.FC = () => {
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchWishlistBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        setWishlistBooks(dummyWishlistBooks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistBooks();
  }, []);

  const handleRemoveFromWishlist = useCallback(
    (bookId: string, bookTitle: string) => {
      if (confirm(`'${bookTitle}'을(를) 위시리스트에서 삭제하시겠습니까?`)) {
        setWishlistBooks((prevBooks) =>
          prevBooks.filter((book) => book.id !== bookId)
        );
        // TODO: 실제 API 호출 로직 (DELETE /books/:bookId/bookmark)
        alert(`'${bookTitle}'이(가) 위시리스트에서 삭제되었습니다.`);
      }
    },
    []
  );

  const totalFilteredItems = wishlistBooks.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return wishlistBooks.slice(startIndex, endIndex);
  }, [wishlistBooks, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="text-center py-12">위시리스트를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="나의 위시리스트"
        description="관심 있는 책들을 한곳에 모아두고 언제든 다시 확인해보세요."
      />

      <div className="container mx-auto px-0">
        {paginatedBooks.length > 0 ? (
          <BookGridDisplay
            books={paginatedBooks}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
            onRemoveFromWishlist={handleRemoveFromWishlist}
            showWishlistButton={true}
          />
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            위시리스트에 담긴 책이 없습니다.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default WishlistPage;
