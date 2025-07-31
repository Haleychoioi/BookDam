// src/pages/mypage/WishlistPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import type { Book } from "../../types";
// API 함수 임포트
import { fetchWishlist, removeWish } from "../../api/mypage";

const WishlistPage: React.FC = () => {
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 위시리스트 데이터 불러오기
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 실제 API 호출로 대체
      const data = await fetchWishlist(); //
      // 백엔드 응답 형태에 따라 Book 타입으로 변환 필요
      const transformedBooks: Book[] = data.map((item) => ({
        isbn13: item.book.isbn13,
        coverImage: item.book.cover,
        title: item.book.title,
        author: "", // 위시리스트 조회 응답에는 author, publisher, pubDate, description, genre 없음
        publisher: "",
        publicationDate: null,
        description: null,
        genre: null,
      }));
      setWishlistBooks(transformedBooks);
    } catch (err) {
      console.error("위시리스트 불러오기 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemoveFromWishlist = useCallback(
    async (isbn13: string, bookTitle: string) => {
      // bookId를 isbn13으로 변경
      if (confirm(`'${bookTitle}'을(를) 위시리스트에서 삭제하시겠습니까?`)) {
        try {
          await removeWish(isbn13); //
          loadWishlist(); // 삭제 후 목록 새로고침
        } catch (error) {
          console.error("위시리스트 삭제 실패:", error);
          alert("위시리스트 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      }
    },
    [loadWishlist]
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
            showWishlistButton={true} // 찜 해제 버튼 표시
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
