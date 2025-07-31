// src/pages/mypage/MyLibraryPage.tsx
import { useState, useEffect, useCallback } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import { type MyLibraryBook } from "../../types";
// API 함수 임포트
import { fetchMyLibrary, deleteBookFromMyLibrary } from "../../api/mypage";

// 'myLibrary.service.ts'와 'myLibrary.repository.ts'에 정의된 상태값 사용
type ReadingStatus = "WANT_TO_READ" | "READING" | "COMPLETED";

const MyLibraryPage: React.FC = () => {
  const [books, setBooks] = useState<MyLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReadingStatus>("READING"); // 기본 탭 변경
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalItems, setTotalItems] = useState(0); // totalItems 제거
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const loadMyLibraryBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMyLibrary(
        currentPage,
        itemsPerPage,
        activeTab
      );

      const transformedBooks: MyLibraryBook[] = response.data.map((item) => ({
        isbn13: item.book.isbn13,
        coverImage: item.book.cover,
        title: item.book.title,
        author: item.book.author,
        publisher: item.book.publisher,
        genre: item.book.category,

        libraryId: item.libraryId,
        status: item.status.toLowerCase() as MyLibraryBook["status"],
        myRating: item.myRating,
        updatedAt: item.updatedAt,

        publicationDate: undefined,
        description: undefined,
        summary: undefined,
        averageRating: undefined,
      }));
      setBooks(transformedBooks);
      // setTotalItems(response.pagination.totalItems); // totalItems 제거
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error("내 서재 불러오기 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, activeTab]);

  useEffect(() => {
    loadMyLibraryBooks();
  }, [loadMyLibraryBooks]);

  const handleTabChange = (tab: ReadingStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleDeleteBook = useCallback(
    async (isbn13: string, bookTitle: string) => {
      if (confirm(`'${bookTitle}'을(를) 내 서재에서 삭제하시겠습니까?`)) {
        try {
          await deleteBookFromMyLibrary(isbn13);
          loadMyLibraryBooks();
        } catch (error) {
          console.error("내 서재 도서 삭제 실패:", error);
          alert("내 서재 도서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      }
    },
    [loadMyLibraryBooks]
  );

  if (loading) {
    return <div className="text-center py-12">내 서재를 불러오는 중...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="책 기록 보관소"
        description="지금까지 읽은 책, 읽고 있는 책, 읽고 싶은 책을 한자리에 모았어요. 취향이 담긴 당신만의 책 기록 보관소를 자유롭게 관리해보세요."
      />

      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleTabChange("READING")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "READING"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽는 중
        </button>
        <button
          onClick={() => handleTabChange("COMPLETED")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "COMPLETED"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽은 책
        </button>
        <button
          onClick={() => handleTabChange("WANT_TO_READ")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "WANT_TO_READ"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽고 싶은 책
        </button>
      </div>

      <div className="container mx-auto px-0">
        {books.length > 0 ? (
          <BookGridDisplay
            books={books}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
            showDeleteButton={true}
            onDeleteFromMyLibrary={handleDeleteBook}
          />
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "READING" && "읽는 중인 책이 없습니다."}
            {activeTab === "COMPLETED" && "읽은 책이 없습니다."}
            {activeTab === "WANT_TO_READ" && "읽고 싶은 책이 없습니다."}
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

export default MyLibraryPage;
