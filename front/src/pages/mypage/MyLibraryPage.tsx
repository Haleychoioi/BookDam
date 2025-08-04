import { useState, useEffect, useMemo } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import BookGridDisplay from "../../components/bookResults/BookGridDisplay";
import Pagination from "../../components/common/Pagination";
import { type MyLibraryBook } from "../../types";

const dummyMyLibraryBooks: MyLibraryBook[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: `mylib-book-${i + 1}`,
    coverImage: `https://via.placeholder.com/160x256/F0F0F0/B0B0B0?text=Book+${
      i + 1
    }`,
    title: `책 제목 ${i + 1}`,
    author: `저자 ${i + 1}`,

    publisher: `출판사 ${i + 1}`,
    pubDate: `2023-01-${(i % 28) + 1}`,
    averageRating: parseFloat((Math.random() * 5).toFixed(1)),
    genre: i % 2 === 0 ? "소설/시/희곡" : "인문학",
    summary: `책 제목 ${i + 1}의 짧은 더미 요약입니다.`,

    status: i % 3 === 0 ? "reading" : i % 3 === 1 ? "read" : "to-read",
    myRating: i % 3 === 1 ? Math.floor(Math.random() * 5) + 1 : undefined,
  })
);

const MyLibraryPage: React.FC = () => {
  const [books, setBooks] = useState<MyLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reading" | "read" | "to-read">(
    "reading"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 이미지에 6권씩 표시되므로 6개로 설정 (3열 2줄)

  useEffect(() => {
    const fetchMyLibraryBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        setBooks(dummyMyLibraryBooks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchMyLibraryBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    setCurrentPage(1);
    return books.filter((book) => book.status === activeTab);
  }, [books, activeTab]);

  const totalFilteredItems = filteredBooks.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
          onClick={() => setActiveTab("reading")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "reading"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽는 중
        </button>
        <button
          onClick={() => setActiveTab("read")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "read"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽은 책
        </button>
        <button
          onClick={() => setActiveTab("to-read")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "to-read"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          읽고 싶은 책
        </button>
      </div>

      <div className="container mx-auto px-0">
        {paginatedBooks.length > 0 ? (
          <BookGridDisplay
            books={paginatedBooks}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
          />
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "reading" && "읽는 중인 책이 없습니다."}
            {activeTab === "read" && "읽은 책이 없습니다."}
            {activeTab === "to-read" && "읽고 싶은 책이 없습니다."}
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
