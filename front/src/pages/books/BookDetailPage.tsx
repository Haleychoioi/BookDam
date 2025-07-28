import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import SearchBar from "../../components/common/SearchBar";
import BookDetailHeroSection from "../../components/bookDetail/BookDetailHeroSection";
import BookDetailDescription from "../../components/bookDetail/BookDetailDescriptionSection";
import BookCarousel from "../../components/bookDetail/BookCarousel";
import CommunityCarousel from "../../components/bookDetail/CommunityCarousel";
import ApplyToCommunityModal from "../../components/modals/ApplyToCommunityModal";
import CreateCommunityModal from "../../components/modals/CreateCommunityModal";

import type { BookDetail, Community, BookSummary } from "../../types";
import {
  getBookDetail,
  fetchBestsellers, // ✨ 새로 임포트 ✨
  fetchNewBooks, // ✨ 새로 임포트 ✨
  fetchSpecialNewBooks, // ✨ 새로 임포트 ✨
  /*, fetchBookCommunities (백엔드 구현 시)*/
} from "../../api/books";

const BookDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bestsellers, setBestsellers] = useState<BookSummary[]>([]);
  const [newBooks, setNewBooks] = useState<BookSummary[]>([]);
  const [specialNewBooks, setSpecialNewBooks] = useState<BookSummary[]>([]);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setItemIdForCreate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      if (!itemId) {
        setError("도서 ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        const bookDetailPromise = getBookDetail(itemId);

        const bestsellersPromise = fetchBestsellers(1, 10);
        const newBooksPromise = fetchNewBooks(1, 10);
        const specialNewBooksPromise = fetchSpecialNewBooks(1, 10);

        const [
          fetchedBookDetail,
          fetchedBestsellers,
          fetchedNewBooks,
          fetchedSpecialNewBooks,
        ] = await Promise.all([
          bookDetailPromise,
          bestsellersPromise,
          newBooksPromise,
          specialNewBooksPromise,
        ]);

        setBook(fetchedBookDetail);
        setBestsellers(fetchedBestsellers);
        setNewBooks(fetchedNewBooks);
        setSpecialNewBooks(fetchedSpecialNewBooks);

        // 커뮤니티 정보는 백엔드 구현 시 추가
        setCommunities([]); // 현재는 빈 배열 유지
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
        setError("페이지 데이터를 불러오는 데 실패했습니다.");
        setBook(null);
        setBestsellers([]);
        setNewBooks([]);
        setSpecialNewBooks([]);
        setCommunities([]);
      } finally {
        setLoading(false);
      }
      window.scrollTo(0, 0);
    };

    fetchAllData();
  }, [itemId]);

  const handleApplyCommunityClick = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setIsApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    setSelectedCommunityId(null);
  };

  const handleCreateCommunityClick = (bookIdentifier: string) => {
    setItemIdForCreate(bookIdentifier);
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setItemIdForCreate(null);
  };

  const handleCommunityCreate = async (
    bookIdentifier: string,
    communityName: string,
    maxMembers: number,
    description: string
  ) => {
    console.log(`커뮤니티 생성 요청:`);
    console.log(` 책 ID: ${bookIdentifier}`);
    console.log(` 이름: ${communityName}`);
    console.log(` 모집 인원: ${maxMembers}`);
    console.log(` 소개: ${description}`);

    try {
      // TODO: 커뮤니티 생성 API (POST /communities) 호출 로직 구현
      alert("커뮤니티가 성공적으로 생성되었습니다!");
      handleCreateModalClose();
    } catch (error) {
      console.error("커뮤니티 생성 중 오류 발생:", error);
      alert("커뮤니티 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-xl text-red-700">{error}</div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 px-4">
        <SearchBar placeholder="도서 검색" className="max-w-lg mx-auto" />
      </div>

      <div className="container mx-auto px-4 lg:px-48">
        <BookDetailHeroSection
          book={book} // book은 이제 BookDetail 타입 또는 null/undefined. 위에서 null/undefined 체크했으므로 여기서는 BookDetail 확정.
          onCreateCommunityClick={handleCreateCommunityClick}
        />

        <BookDetailDescription book={book} />

        {communities.length > 0 && (
          <div className="p-6 mt-8">
            <CommunityCarousel
              title={`모집 중인 [${book.title}] 커뮤니티`}
              communities={communities}
              onApplyClick={handleApplyCommunityClick}
            />
          </div>
        )}

        {bestsellers.length > 0 && (
          <div className="p-6 mt-8">
            <BookCarousel title="베스트셀러" books={bestsellers} />
          </div>
        )}
        {newBooks.length > 0 && (
          <div className="p-6 mt-8">
            <BookCarousel title="신간 도서" books={newBooks} />
          </div>
        )}
        {specialNewBooks.length > 0 && (
          <div className="p-6 mt-8">
            <BookCarousel title="주목할 신간" books={specialNewBooks} />
          </div>
        )}

        <ApplyToCommunityModal
          isOpen={isApplyModalOpen}
          onClose={handleApplyModalClose}
          communityId={selectedCommunityId || ""}
        />

        {itemId && (
          <CreateCommunityModal
            isOpen={isCreateModalOpen}
            onClose={handleCreateModalClose}
            bookId={itemId}
            onCommunityCreate={handleCommunityCreate}
          />
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
