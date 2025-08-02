// src/pages/HomePage.tsx

import HomeHeroSection from "../components/home/HomeHeroSection";
import RecruitingCommunityList from "../components/home/RecruitingCommunityList";
import BookCarousel from "../components/bookDetail/BookCarousel";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBestsellers,
  fetchNewBooks,
  fetchSpecialNewBooks,
} from "../api/books";

const HomePage: React.FC = () => {
  const {
    data: bestsellers,
    isLoading: isLoadingBestsellers,
    isError: isErrorBestsellers,
    error: errorBestsellers,
  } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: () => fetchBestsellers(1, 10),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: newBooks,
    isLoading: isLoadingNewBooks,
    isError: isErrorNewBooks,
    error: errorNewBooks,
  } = useQuery({
    queryKey: ["newBooks"],
    queryFn: () => fetchNewBooks(1, 10),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: specialNewBooks,
    isLoading: isLoadingSpecialNewBooks,
    isError: isErrorSpecialNewBooks,
    error: errorSpecialNewBooks,
  } = useQuery({
    queryKey: ["specialNewBooks"],
    queryFn: () => fetchSpecialNewBooks(1, 10),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="home-page-content">
      <HomeHeroSection />
      <RecruitingCommunityList />

      {/* 베스트셀러 캐러셀 */}
      <section className="py-8">
        {isLoadingBestsellers ? (
          <p className="text-center text-gray-600">베스트셀러 로딩 중...</p>
        ) : isErrorBestsellers ? (
          <p className="text-center text-red-600">
            오류:{" "}
            {errorBestsellers?.message ||
              "베스트셀러를 불러오는 데 실패했습니다."}
          </p>
        ) : (
          <BookCarousel
            title="🏆 지금 가장 뜨거운 베스트셀러, 지금 만나보세요!"
            books={bestsellers || []}
          />
        )}
      </section>

      {/* 신간 도서 캐러셀 */}
      <section className="py-8">
        {isLoadingNewBooks ? (
          <p className="text-center text-gray-600">신간 도서 로딩 중...</p>
        ) : isErrorNewBooks ? (
          <p className="text-center text-red-600">
            오류:{" "}
            {errorNewBooks?.message || "신간 도서를 불러오는 데 실패했습니다."}
          </p>
        ) : (
          <BookCarousel
            title="💡 지적 호기심을 채울 새로운 도서"
            books={newBooks || []}
          />
        )}
      </section>

      {/* 주목할 신간 캐러셀 */}
      <section className="py-8">
        {isLoadingSpecialNewBooks ? (
          <p className="text-center text-gray-600">주목할 신간 로딩 중...</p>
        ) : isErrorSpecialNewBooks ? (
          <p className="text-center text-red-600">
            오류:{" "}
            {errorSpecialNewBooks?.message ||
              "주목할 신간을 불러오는 데 실패했습니다."}
          </p>
        ) : (
          <BookCarousel
            title="👀 에디터 추천! 놓칠 수 없는 신간"
            books={specialNewBooks || []}
          />
        )}
      </section>
    </div>
  );
};

export default HomePage;
