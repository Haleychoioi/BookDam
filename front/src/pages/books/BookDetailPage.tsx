// src/pages/books/BookDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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
} from "../../api/books";
import { createCommunity, fetchCommunitiesByBook } from "../../api/communities";

interface BookDetailPageData {
  book: BookDetail;
  bestsellers: BookSummary[];
  newBooks: BookSummary[];
  specialNewBooks: BookSummary[];
  communities: Community[]; // 커뮤니티 데이터 추가
}

const BookDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<
    BookDetailPageData,
    Error
  >({
    queryKey: ["bookDetailPageData", itemId],

    queryFn: async () => {
      if (!itemId) {
        throw new Error("도서 ID가 제공되지 않았습니다.");
      }

      const fetchedBookDetail = await getBookDetail(itemId);

      const [fetchedBestsellers, fetchedNewBooks, fetchedSpecialNewBooks] =
        await Promise.all([
          fetchBestsellers(1, 10),
          fetchNewBooks(1, 10),
          fetchSpecialNewBooks(1, 10),
        ]);

      let fetchedCommunities: Community[] = [];
      try {
        fetchedCommunities = await fetchCommunitiesByBook(itemId);
      } catch (communityError: unknown) {
        // ✨ 여기를 'unknown'으로 수정합니다. ✨
        // axios.isAxiosError는 'unknown' 타입의 에러가 AxiosError 인지 확인하는 타입 가드 역할을 합니다.
        if (
          axios.isAxiosError(communityError) &&
          communityError.response &&
          communityError.response.status === 404 &&
          communityError.response.data?.message ===
            "No communities found for this book."
        ) {
          console.warn(
            "해당 도서에 대한 커뮤니티가 없습니다. 빈 목록으로 진행합니다."
          );
          fetchedCommunities = [];
        } else {
          throw communityError; // 그 외의 에러는 다시 던집니다.
        }
      }

      return {
        book: fetchedBookDetail,
        bestsellers: fetchedBestsellers,
        newBooks: fetchedNewBooks,
        specialNewBooks: fetchedSpecialNewBooks,
        communities: fetchedCommunities,
      };
    },

    enabled: !!itemId,
    staleTime: 1000 * 60 * 5,
    retry: 1, // 재시도 횟수를 줄입니다.
  });

  const book = data?.book || null;
  const bestsellers = data?.bestsellers || [];
  const newBooks = data?.newBooks || [];
  const specialNewBooks = data?.specialNewBooks || [];
  const communities = data?.communities || [];

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
      await createCommunity({
        bookIsbn13: bookIdentifier,
        title: communityName,
        content: description,
        maxMembers: maxMembers,
      });

      handleCreateModalClose();
      queryClient.invalidateQueries({
        queryKey: ["bookDetailPageData", bookIdentifier],
      });
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

  if (isError || !book) {
    return (
      <div className="text-center py-12 text-xl text-red-700">
        오류: {error?.message || "도서 상세 정보를 불러오는 데 실패했습니다."}
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

        <h2 className="text-2xl text-gray-800 text-center mb-4 mt-20">
          모집 중인 커뮤니티
        </h2>
        {communities.length > 0 && (
          <div className="p-6">
            <CommunityCarousel
              communities={communities}
              onApplyClick={handleApplyCommunityClick}
            />
          </div>
        )}
        {communities.length === 0 && !isLoading && (
          <div className="p-6 mt-8 text-center text-gray-600">
            아직 이 책에 대한 모집 중인 커뮤니티가 없습니다. 새로운 커뮤니티를
            만들어보세요!
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
