import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
  fetchBestsellers,
  fetchNewBooks,
  fetchSpecialNewBooks,
  // fetchBookCommunities, // 백엔드 구현 시 주석 해제
} from "../../api/books";

interface BookDetailPageData {
  book: BookDetail;
  bestsellers: BookSummary[];
  newBooks: BookSummary[];
  specialNewBooks: BookSummary[];
  communities: Community[];
}

const BookDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data, isLoading, isError, error } = useQuery<
    BookDetailPageData,
    Error
  >({
    queryKey: ["bookDetailPageData", itemId],

    queryFn: async () => {
      if (!itemId) {
        throw new Error("도서 ID가 제공되지 않았습니다.");
      }

      const [
        fetchedBookDetail,
        fetchedBestsellers,
        fetchedNewBooks,
        fetchedSpecialNewBooks,
      ] = await Promise.all([
        getBookDetail(itemId),
        fetchBestsellers(1, 10),
        fetchNewBooks(1, 10),
        fetchSpecialNewBooks(1, 10),
        // fetchBookCommunities(itemId), // 커뮤니티 API 구현 시 주석 해제
      ]);

      const fetchedCommunities: Community[] = [];

      return {
        book: fetchedBookDetail,
        bestsellers: fetchedBestsellers,
        newBooks: fetchedNewBooks,
        specialNewBooks: fetchedSpecialNewBooks,
        communities: fetchedCommunities,
      };
    },

    enabled: !!itemId,
  });

  const book = data?.book || null;
  const bestsellers = data?.bestsellers || [];
  const newBooks = data?.newBooks || [];
  const specialNewBooks = data?.specialNewBooks || [];
  const communities = data?.communities || []; // 이 부분은 커뮤니티 API 구현 후 data?.communities 로 변경

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setItemIdForCreate] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      // queryClient.invalidateQueries(['bookDetailPageData', bookIdentifier]); // 커뮤니티 생성 후 데이터 무효화 (useQueryClient 필요)
    } catch (error) {
      console.error("커뮤니티 생성 중 오류 발생:", error);
      alert("커뮤니티 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-xl text-gray-700">
        도서 정보 로딩 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-xl text-red-700">
        오류: {error?.message || "페이지 데이터를 불러오는 데 실패했습니다."}
      </div>
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
          book={book}
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
