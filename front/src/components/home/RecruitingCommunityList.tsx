// front/src/components/home/RecruitingCommunityList.tsx

import React, { useState } from "react";
import Button from "../common/Button";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal"; // ApplyToCommunityModal 임포트 (경로 확인)
import type { Community } from "../../types"; // types에서 Community 임포트

// dummyCommunities 데이터 (Community 타입에 맞춰 hostName, currentMembers, maxMembers 포함)
const dummyCommunities: Community[] = [
  {
    id: "1",
    title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
    description: "간단 커뮤니티 소개글입니다.",
    hostName: "성해나",
    currentMembers: 3,
    maxMembers: 6,
  },
  {
    id: "2",
    title: "두근두근 | 김사랑 : SF 소설 스터디 모집",
    description: "인터스텔라, 컨택트 등 SF 소설을 함께 읽고 토론합니다.",
    hostName: "김사랑",
    currentMembers: 5,
    maxMembers: 10,
  },
  {
    id: "3",
    title: "책벌레들 | 박지민 : 고전 문학 함께 읽어요",
    description: "한국 및 서양 고전 문학 작품들을 깊이 있게 탐구합니다.",
    hostName: "박지민",
    currentMembers: 7,
    maxMembers: 15,
  },
  {
    id: "4",
    title: "추리반 | 이형사 : 미스터리 소설 정복",
    description: "아가사 크리스티부터 현대 추리 소설까지! 추리의 세계로!",
    hostName: "이형사",
    currentMembers: 3,
    maxMembers: 7,
  },
  {
    id: "5",
    title: "로맨스홀릭 | 최다정 : 달콤한 소설 읽기",
    description: "가슴 설레는 로맨스 소설을 함께 읽으며 행복을 나눠요.",
    hostName: "최다정",
    currentMembers: 4,
    maxMembers: 8,
  },
  {
    id: "6",
    title: "역사탐험대 | 정석사 : 역사 소설로 배우는 지혜",
    description: "역사적 사실을 바탕으로 한 소설을 통해 과거를 탐험합니다.",
    hostName: "정석사",
    currentMembers: 6,
    maxMembers: 12,
  },
  {
    id: "7",
    title: "추가 커뮤니티 | 07 : 스터디 그룹원 모집",
    description: "새롭게 추가된 커뮤니티입니다.",
    hostName: "추가호스트1",
    currentMembers: 1,
    maxMembers: 5,
  },
  {
    id: "8",
    title: "추가 커뮤니티 | 08 : 독서 모임 참가자 구함",
    description: "더 많은 내용을 보여줍니다.",
    hostName: "추가호스트2",
    currentMembers: 2,
    maxMembers: 6,
  },
  {
    id: "9",
    title: "추가 커뮤니티 | 09 : 영어 원서 읽기",
    description: "계속해서 추가됩니다.",
    hostName: "추가호스트3",
    currentMembers: 4,
    maxMembers: 8,
  },
  {
    id: "10",
    title: "추가 커뮤니티 | 10 : 고전 문학 토론",
    description: "마지막 추가 커뮤니티입니다.",
    hostName: "추가호스트4",
    currentMembers: 3,
    maxMembers: 7,
  },
];

const initialDisplayCount = 6;
const loadMoreIncrement = 3;

const RecruitingCommunityList: React.FC = () => {
  const [displayedCount, setDisplayedCount] = useState(initialDisplayCount);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setDisplayedCount((prevCount) => prevCount + loadMoreIncrement);
  };

  // '참여하기' 버튼 클릭 핸들러
  const handleJoinClick = (community: Community) => {
    setSelectedCommunityId(community.id);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommunityId(null);
  };

  // 모든 아이템이 로드되었는지 확인
  const allItemsLoaded = displayedCount >= dummyCommunities.length;

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        현재 모집 중인 커뮤니티
      </h2>

      <div className="space-y-6">
        {/* slice를 사용하여 보여줄 아이템 개수만큼만 map을 돌립니다. */}
        {dummyCommunities.slice(0, displayedCount).map((community) => (
          <div
            key={community.id}
            className="flex justify-between items-center border-b border-gray-200 pb-4"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {community.title}
              </h3>
              <p className="text-gray-600 text-sm">{community.description}</p>
            </div>
            <Button
              onClick={() => handleJoinClick(community)}
              className="px-6 py-2"
              bgColor="bg-apply"
            >
              참여하기
            </Button>
          </div>
        ))}
      </div>

      {/* '더보기' 버튼을 모든 아이템이 로드되지 않았을 때만 보여줍니다. */}
      {!allItemsLoaded && (
        <div className="text-center mt-10">
          <Button onClick={handleLoadMore} className="px-8 py-3 text-lg">
            더보기
          </Button>
        </div>
      )}

      {/* ApplyToCommunityModal 렌더링 */}
      <ApplyToCommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        communityId={selectedCommunityId || ""}
      />
    </section>
  );
};

export default RecruitingCommunityList;
