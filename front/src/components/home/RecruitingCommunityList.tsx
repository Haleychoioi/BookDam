import { useState } from "react";
import Button from "../common/Button";

const RecruitingCommunityList: React.FC = () => {
  // 현재는 하드코딩된 데이터로 UI만 보여줍니다.
  const dummyCommunities = [
    {
      id: 1,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 2,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 3,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 4,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 5,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 6,
      title: "혼모노 | 성해나 : 깊은 토론하실 분 구합니다",
      description: "간단 커뮤니티 소개글입니다.",
    },
    {
      id: 7,
      title: "추가 커뮤니티 | 07 : 스터디 그룹원 모집",
      description: "새롭게 추가된 커뮤니티입니다.",
    }, // 추가 데이터 예시
    {
      id: 8,
      title: "추가 커뮤니티 | 08 : 독서 모임 참가자 구함",
      description: "더 많은 내용을 보여줍니다.",
    }, // 추가 데이터 예시
    {
      id: 9,
      title: "추가 커뮤니티 | 09 : 영어 원서 읽기",
      description: "계속해서 추가됩니다.",
    }, // 추가 데이터 예시
    {
      id: 10,
      title: "추가 커뮤니티 | 10 : 고전 문학 토론",
      description: "마지막 추가 커뮤니티입니다.",
    }, // 추가 데이터 예시
  ];

  // ✨ 초기 보여줄 아이템 개수와 더보기 클릭 시 추가할 개수를 정의합니다. ✨
  const initialDisplayCount = 6;
  const loadMoreIncrement = 3; // '더보기' 클릭 시 3개씩 추가

  const [displayedCount, setDisplayedCount] = useState(initialDisplayCount);

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setDisplayedCount((prevCount) => prevCount + loadMoreIncrement);
  };

  // 모든 아이템이 로드되었는지 확인
  const allItemsLoaded = displayedCount >= dummyCommunities.length;

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        현재 모집 중인 커뮤니티
      </h2>

      <div className="space-y-6">
        {/* ✨ slice를 사용하여 보여줄 아이템 개수만큼만 map을 돌립니다. ✨ */}
        {dummyCommunities.slice(0, displayedCount).map((community) => (
          <div
            key={community.id}
            className="flex justify-between items-center border-b border-gray-200 pb-4"
          >
            <div>
              {/* index + 1 대신 community.id를 사용하거나, 원래 dummyCommunities의 index를 사용 */}
              <p className="text-sm text-gray-500 mb-1">0{community.id}</p>
              <h3 className="text-xl font-semibold text-gray-800">
                {community.title}
              </h3>
              <p className="text-gray-600 text-sm">{community.description}</p>
            </div>
            <Button to={`/communities/${community.id}`} className="px-6 py-2">
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
    </section>
  );
};

export default RecruitingCommunityList;
