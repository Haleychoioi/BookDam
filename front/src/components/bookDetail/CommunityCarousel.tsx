import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 화살표 아이콘
import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";

import type { Community } from "../../types"; // ✨ Community 타입 임포트 ✨

interface CommunityCarouselProps {
  title: string;
  communities: Community[]; //
  onApplyClick: (communityId: string) => void;
}

const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
  title,
  communities,
  onApplyClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 캐러셀의 시작 인덱스
  const itemsPerPage = 3; // 한 번에 보여줄 커뮤니티 아이템 개수

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
          <div className="flex space-x-12 overflow-hidden">
            {visibleCommunities.map((community) => (
              <div
                key={community.id}
                // ✨ 너비, 높이, 비율 조정 및 배경색, 그림자, 둥근 모서리 ✨
                className="w-64 h-80 rounded-xl shadow-lg flex-shrink-0 bg-white border border-gray-200 p-6 mb-10 flex flex-col justify-between"
              >
                {/* 상단 정보 */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 leading-tight">
                    {/* 글씨 크기 조정 */}
                    {community.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {/* 글씨 크기 조정 */}
                    {community.hostName}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {/* 텍스트 줄바꿈 및 자르기 */}
                    {community.description}
                  </p>
                </div>

                {/* 하단 인원 및 버튼 */}
                <div className="flex flex-col items-start mt-auto">
                  {/* 하단에 고정 */}
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    {/* 인원 정보 */}
                    <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
                    <span>
                      {community.currentMembers}/{community.maxMembers}명
                    </span>
                  </div>
                  {/* 신청하기 버튼 */}
                  <Button
                    bgColor="bg-main" // main 컬러
                    textColor="text-white"
                    hoverBgColor="hover:bg-apply" // apply 컬러
                    className="w-full text-sm py-2 rounded-lg" // 버튼 크기 및 둥근 모서리 조정
                    onClick={() => onApplyClick(community.id)}
                  >
                    신청하기
                  </Button>
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
                    className="w-64 h-80 flex-shrink-0" // 플레이스홀더 크기 맞춤
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
