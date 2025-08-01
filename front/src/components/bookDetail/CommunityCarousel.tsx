import { useState } from "react";
import Button from "../common/Button";
import { FaChevronLeft, FaChevronRight, FaUserFriends } from "react-icons/fa";

import type { Community } from "../../types";
interface CommunityCarouselProps {
  communities: Community[]; //
  onApplyClick: (communityId: string) => void;
}

const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
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
    <div>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-3 rounded-full bg-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ${
            !canGoPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        {/* 책 목록 */}
        <div className="flex flex-grow justify-center space-x-8 ">
          <div className="flex space-x-12 overflow-hidden">
            {visibleCommunities.map((community, idx) => (
              <div
                key={`${community.id}-${currentIndex + idx}`}
                className="w-64 h-72 rounded-xl shadow-lg flex-shrink-0 bg-white border border-gray-200 p-6 mb-10 flex flex-col justify-between"
              >
                {/* 상단 정보 */}
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

                {/* 하단 인원 및 버튼 */}
                <div className="flex flex-col items-start mt-auto">
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
                    <span>
                      {community.currentMembers}/{community.maxMembers}명
                    </span>
                  </div>
                  {/* 신청하기 버튼 */}
                  <Button
                    bgColor="bg-main"
                    textColor="text-white"
                    hoverBgColor="hover:bg-apply"
                    className="w-full text-sm py-2 rounded-lg"
                    onClick={() => onApplyClick(community.id)}
                  >
                    신청하기
                  </Button>
                </div>
              </div>
            ))}

            {visibleCommunities.length < itemsPerPage &&
              Array(itemsPerPage - visibleCommunities.length)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`community-placeholder-${i}`}
                    className="w-64 h-80 flex-shrink-0"
                  />
                ))}
          </div>
        </div>

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
