// src/pages/books/BookDetailPage.tsx

import { useEffect, useState } from "react"; // ✨ useCallback, useMemo 제거 ✨
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
import { getBookDetail, fetchBestsellers } from "../../api/books";

import {
  fetchCommunitiesByBookIsbn13,
  createCommunity,
} from "../../api/communities";
import { getCategoryId } from "../../constants/categories";

interface BookDetailPageData {
  book: BookDetail;
  bestsellers: BookSummary[];
  newBooks: BookSummary[];
  specialNewBooks: BookSummary[];
  communities: Community[];
  genreSpecificRecommendations?: BookSummary[];
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

      const [fetchedBestsellers] = await Promise.all([fetchBestsellers(1, 10)]);

      let fetchedCommunities: Community[] = [];
      try {
        fetchedCommunities = await fetchCommunitiesByBookIsbn13(itemId);
      } catch (communityError: unknown) {
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
          throw communityError;
        }
      }

      return {
        book: fetchedBookDetail,
        bestsellers: fetchedBestsellers,
        newBooks: [],
        specialNewBooks: [],
        communities: fetchedCommunities,
      };
    },
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const book = data?.book || null;
  // ✨ 'communities' 변수 선언 제거 (CommunityCarousel이 자체 페칭) ✨
  // const communities = data?.communities || [];

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [applyModalError, setApplyModalError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setItemIdForCreate] = useState<string | null>(null);

  const categoryIdForRecommendations = book?.category
    ? getCategoryId(book.category)
    : 0;

  const {
    data: genreRecommendations,
    isLoading: isLoadingGenreRecommendations,
    isError: isErrorGenreRecommendations,
    error: errorGenreRecommendations,
  } = useQuery<BookSummary[], Error>({
    queryKey: ["genreRecommendations", categoryIdForRecommendations],
    queryFn: async () => {
      if (categoryIdForRecommendations === 0) {
        return [];
      }
      return fetchBestsellers(1, 10, categoryIdForRecommendations);
    },
    enabled: !!book && categoryIdForRecommendations !== 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  const handleApplyCommunityClick = (communityId: string) => {
    setApplyModalError(null);
    setSelectedCommunityId(communityId);
    setIsApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setIsApplyModalOpen(false);
    setSelectedCommunityId(null);
    setApplyModalError(null);
  };

  const handleApplyModalError = (message: string) => {
    setApplyModalError(message);
    setIsApplyModalOpen(false);
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
        isbn13: bookIdentifier,
        title: communityName,
        content: description,
        maxMembers: maxMembers,
      });

      handleCreateModalClose();
      queryClient.invalidateQueries({
        queryKey: ["bookDetailPageData", bookIdentifier],
      });
      alert("커뮤니티가 성공적으로 생성되었습니다!");
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

        {applyModalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <strong className="font-bold">신청 오류:</strong> {applyModalError}
          </div>
        )}

        <h2 className="text-2xl text-gray-800 text-center mb-4 mt-16">
          모집 중인 커뮤니티
        </h2>
        <div className="p-6">
          <CommunityCarousel
            bookIsbn13={itemId!} // ✨ itemId가 string임을 확신하므로 비null 어설션 사용 ✨
            onApplyClick={handleApplyCommunityClick}
          />
        </div>

        {/* 장르별 추천 도서 캐러셀 (유지) */}
        {isLoadingGenreRecommendations ? (
          <p className="text-center text-gray-600">
            장르별 추천 도서 로딩 중...
          </p>
        ) : isErrorGenreRecommendations ? (
          <p className="text-center text-red-600">
            오류:{" "}
            {errorGenreRecommendations?.message ||
              "장르별 추천 도서를 불러오는 데 실패했습니다."}
          </p>
        ) : genreRecommendations && genreRecommendations.length > 0 ? (
          <div className="p-6 mt-16">
            <BookCarousel
              title={`"${book.category}" 장르에서 당신이 좋아할 만한 책`}
              books={genreRecommendations}
            />
          </div>
        ) : (
          <div className="p-6 mt-8 text-center text-gray-600">
            이 장르에 대한 추천 도서를 찾을 수 없습니다.
          </div>
        )}

        <ApplyToCommunityModal
          isOpen={isApplyModalOpen}
          onClose={handleApplyModalClose}
          communityId={selectedCommunityId || ""}
          onError={handleApplyModalError}
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
