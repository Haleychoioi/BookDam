// src/components/bookDetail/CommunityCarousel.tsx

import { useState } from "react";
import Button from "../common/Button";
import { FaChevronLeft, FaChevronRight, FaUserFriends } from "react-icons/fa";

import type { Community } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunitiesByBookIsbn13 } from "../../api/communities"; // ✨ fetchCommunitiesByBookIsbn13으로 변경 ✨

interface CommunityCarouselProps {
  bookIsbn13: string;
}

const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
  bookIsbn13,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const { currentUserProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [listError, setListError] = useState<string | null>(null);

  // ✨ useQuery를 사용하여 커뮤니티 데이터 가져오기 (타입 수정) ✨
  const {
    data: communities, // ✨ data 이름을 communities로 변경 (Community[] 타입으로 직접 받음) ✨
    isLoading,
    isError,
    error,
    isFetching, // ✨ isFetching 변수 유지 ✨
  } = useQuery<Community[], Error>({
    // ✨ 타입 수정: { communities: Community[]; totalResults: number } -> Community[] ✨
    queryKey: ["bookDetailPageData", bookIsbn13, currentUserProfile?.userId], // ✨ queryKey에 userId 추가 ✨
    queryFn: ({ queryKey }) => {
      const [, isbn, userId] = queryKey;
      return fetchCommunitiesByBookIsbn13(isbn as string, 5, userId as number); // ✨ fetchCommunitiesByBookIsbn13 함수 호출 (오타 수정) ✨
    },
    enabled: !!bookIsbn13, // isbn13이 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분
  });

  // communitiesData가 직접 배열이므로 별도의 할당 필요 없음. totalResults는 length로 계산.
  // const communities = communitiesData || []; // ✨ 이 줄은 이제 필요 없음 ✨
  // const totalResults = communities ? communities.length : 0; // ✨ totalResults 변수 선언 제거 (직접 communities?.length 사용) ✨

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex(
      (prevIndex) =>
        Math.min(
          (communities?.length || 0) - itemsPerPage,
          prevIndex + itemsPerPage
        ) // ✨ communities?.length로 안전하게 접근 ✨
    );
  };

  const handleApplyCommunityClick = (communityId: string) => {
    setListError(null);
    setSelectedCommunityId(communityId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommunityId(null);
  };

  const handleApplyModalError = (message: string) => {
    setListError(message);
    setIsModalOpen(false);
  };

  const visibleCommunities = communities
    ? communities.slice(
        // ✨ communities가 undefined일 수 있으므로 안전하게 slice 호출 ✨
        currentIndex,
        currentIndex + itemsPerPage
      )
    : [];

  const canGoPrev = currentIndex > 0;
  const canGoNext = communities
    ? currentIndex + itemsPerPage < communities.length
    : false; // ✨ communities가 정의되었을 때만 계산 ✨

  if (isLoading || isFetching) {
    // ✨ isFetching 사용 ✨
    return (
      <div className="text-center py-8 text-gray-600">
        커뮤니티를 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        오류: {error?.message || "커뮤니티를 불러오는 데 실패했습니다."}
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    // ✨ communities가 null/undefined일 수 있으므로 !communities 조건 추가 ✨
    return (
      <div className="text-center py-8 text-gray-500">
        아직 이 책에 대한 커뮤니티가 없습니다.
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            // ✨ 백틱 사용 ✨
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-grow justify-center space-x-8 ">
          <div className="flex space-x-12 overflow-hidden">
            {visibleCommunities.map((community: Community, idx: number) => {
              // ✨ 매개변수 타입 명시 ✨
              const isCurrentUserHost =
                currentUserProfile?.userId === community.hostId;
              const hasApplied = community.hasApplied;

              return (
                <div
                  key={`${community.id}-${currentIndex + idx}`} // ✨ 백틱 사용 ✨
                  className="w-64 h-72 rounded-xl shadow-lg flex-shrink-0 bg-white border border-gray-200 p-6 mb-10 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-2xl text-gray-800 mb-1 leading-tight">
                      {community.title}
                    </h3>
                    <p className="text-gray-500 text-lg mb-4">
                      {community.hostName}
                    </p>
                    <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                      {community.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-start mt-auto">
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
                      <span>
                        {community.currentMembers}/{community.maxMembers}명
                      </span>
                    </div>
                    <Button
                      onClick={() => handleApplyCommunityClick(community.id)}
                      bgColor={hasApplied ? "bg-gray-400" : "bg-main"}
                      textColor="text-white"
                      hoverBgColor={
                        hasApplied ? "hover:bg-gray-500" : "hover:bg-apply"
                      }
                      className={`w-full text-sm py-2 rounded-lg ${
                        // ✨ 백틱 사용 ✨
                        isCurrentUserHost || hasApplied
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={isCurrentUserHost || hasApplied}
                    >
                      {isCurrentUserHost
                        ? "나의 커뮤니티"
                        : hasApplied
                        ? "신청 완료"
                        : "신청하기"}
                    </Button>
                  </div>
                </div>
              );
            })}

            {visibleCommunities.length < itemsPerPage &&
              Array(itemsPerPage - visibleCommunities.length)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`community-placeholder-${i}`} // ✨ 백틱 사용 ✨
                    className="w-64 h-80 flex-shrink-0"
                  />
                ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            // ✨ 백틱 사용 ✨
            !canGoNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {listError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 text-center"
          role="alert"
        >
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{listError}</span>
        </div>
      )}

      <ApplyToCommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        communityId={selectedCommunityId || ""}
        onError={handleApplyModalError}
      />
    </div>
  );
};

export default CommunityCarousel;
