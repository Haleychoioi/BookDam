// front/src/components/community/CommunityCarousel.tsx

import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘

interface Community {
  id: string;
  bookCoverImage: string; // 커뮤니티가 다루는 책의 커버 이미지
  title: string; // 커뮤니티 이름
  currentMembers: number; // 현재 모집된 인원
  maxMembers: number; // 최대 모집 인원
  deadline: string; // 모집 마감일 (예: "2024.12.31")
}

interface CommunityCarouselProps {
  title: string;
  communities: Community[];
}

const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
  title,
  communities,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 캐러셀의 시작 인덱스
  const itemsPerPage = 4; // 한 번에 보여줄 커뮤니티 아이템 개수

  // 이전 버튼 클릭 핸들러
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));
  };

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(communities.length - itemsPerPage, prevIndex + itemsPerPage)
    );
  };

  // 보여줄 커뮤니티 목록을 계산
  const visibleCommunities = communities.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  // 캐러셀이 슬라이딩 가능할 만큼 충분한 커뮤니티가 없는 경우 비활성화
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < communities.length;

  return (
    <div className="py-10 mt-6">
      <h2 className="text-2xl text-gray-800 text-center mb-8">{title}</h2>
      <div className="flex items-center justify-center space-x-4 mt-20">
        {/* 왼쪽 화살표 */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        {/* 커뮤니티 목록 뷰포트 */}
        <div className="flex flex-grow justify-center">
          <div className="flex space-x-8 overflow-hidden">
            {visibleCommunities.map((community) => (
              <div
                key={community.id}
                className="w-48 h-72 rounded-md shadow-md flex-shrink-0 bg-white border border-gray-200 overflow-hidden relative" // relative 추가
              >
                {/* 책 커버 이미지 */}
                <img
                  src={community.bookCoverImage}
                  alt={community.title}
                  className="w-full h-3/5 object-cover rounded-t-md" // 이미지 영역 조정
                />
                {/* 커뮤니티 정보 오버레이 */}
                <div className="p-3 text-sm flex flex-col justify-between h-2/5">
                  {" "}
                  {/* 정보 영역 조정 */}
                  <h3 className="font-semibold text-gray-800 truncate mb-1">
                    {community.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-1">
                    모집: {community.currentMembers}/{community.maxMembers}명
                  </p>
                  <p className="text-gray-500 text-xs">
                    마감: {community.deadline}
                  </p>
                </div>
              </div>
            ))}
            {/* 플레이스홀더 (정렬 유지용) */}
            {visibleCommunities.length < itemsPerPage &&
              Array(itemsPerPage - visibleCommunities.length)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`community-placeholder-${i}`}
                    className="w-48 h-72 flex-shrink-0"
                  />
                ))}
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center ${
            !canGoNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default CommunityCarousel;
