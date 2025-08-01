// src/components/home/RecruitingCommunityList.tsx

import { useState } from "react";
// import useEffect from React is no longer needed here as useQuery handles data fetching lifecycle
import Button from "../common/Button";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal";
import type { Community } from "../../types";
import { useQuery } from "@tanstack/react-query"; // useQuery 임포트
import { fetchCommunities } from "../../api/communities"; // fetchCommunities 임포트

// ✨ 더미 데이터 삭제되었음 ✨

const initialDisplayCount = 6; // 초기 로드 개수
const loadMoreIncrement = 3; // 더보기 클릭 시 추가 개수

const RecruitingCommunityList: React.FC = () => {
  const [currentLimit, setCurrentLimit] = useState(initialDisplayCount); // 현재 표시할 항목 수

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  // useQuery를 사용하여 커뮤니티 데이터 가져오기
  const {
    data: communitiesData,
    isLoading, // 초기 로딩 상태 (첫 fetch)
    isFetching, // 데이터 로딩 중 (refetch 포함)
    isError,
    error,
  } = useQuery<{ communities: Community[]; totalResults: number }, Error>({
    // Explicitly type the data structure
    queryKey: ["allCommunities", currentLimit], // currentLimit이 변경될 때마다 쿼리 재실행
    queryFn: ({ queryKey }) => {
      // queryKey에서 currentLimit 값을 추출하여 fetchCommunities에 전달
      const [, limit] = queryKey;
      return fetchCommunities(1, limit as number, "latest"); // 페이지 1, 현재 limit, 최신순
    },
    staleTime: 1000 * 60, // 1분 동안 데이터 신선하게 유지. 이 시간 동안은 캐시된 데이터를 즉시 사용
    // placeholderData는 새로운 데이터를 불러오는 동안에도 이전 데이터를 계속 표시하도록 합니다.
    // React Query v5에서 keepPreviousData를 대체하는 기능입니다.
    placeholderData: (previousData) => previousData,
    // initialData: initialDisplayCount === 0 ? [] : undefined, // 초기에 데이터가 없을 경우 빈 배열로 시작 (선택 사항)
  });

  // communitiesData가 undefined일 수 있으므로 안전하게 접근
  const communities = communitiesData?.communities || [];
  const totalResults = communitiesData?.totalResults || 0;

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setCurrentLimit((prevLimit) => prevLimit + loadMoreIncrement);
  };

  // '참여하기' 버튼 클릭 핸들러
  const handleJoinClick = (community: Community) => {
    // 'community' 매개변수에 타입 명시
    setSelectedCommunityId(community.id);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommunityId(null);
  };

  // 모든 아이템이 로드되었는지 확인 (totalResults와 비교)
  // totalResults는 fetchCommunities에서 올바르게 반환되어야 합니다.
  const allItemsLoaded = communities.length >= totalResults;

  // 초기 로딩 스피너 표시 (isFetching 대신 isLoading 사용)
  if (isLoading && !isFetching) {
    // isFetching은 재로딩 중에도 true이므로, 초기 로딩과 구분
    return (
      <section className="container mx-auto py-12 px-4 text-center text-gray-600">
        커뮤니티 목록을 불러오는 중...
      </section>
    );
  }

  // 에러 메시지 표시
  if (isError) {
    return (
      <section className="container mx-auto py-12 px-4 text-center text-red-600">
        오류: {error?.message || "커뮤니티 목록을 불러오는 데 실패했습니다."}
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        현재 모집 중인 커뮤니티
      </h2>

      <div className="space-y-6">
        {/* 데이터가 없고, 로딩 중이 아니라면 '커뮤니티 없음' 메시지 표시 */}
        {communities.length === 0 && !isLoading && !isFetching ? (
          <p className="text-center text-gray-500 py-10">
            현재 모집 중인 커뮤니티가 없습니다.
          </p>
        ) : (
          communities.map(
            (
              community: Community // 'community' 매개변수에 다시 한번 타입 명시
            ) => (
              <div
                key={community.id}
                className="flex justify-between items-center border-b border-gray-200 pb-4"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {community.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {community.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleJoinClick(community)}
                  className="px-6 py-2"
                  bgColor="bg-apply"
                >
                  참여하기
                </Button>
              </div>
            )
          )
        )}
      </div>

      {/* 더 많은 데이터를 불러오는 중일 때 표시되는 인디케이터 (데이터가 이미 있을 때만) */}
      {isFetching && communities.length > 0 && (
        <div className="text-center mt-4 text-gray-500">
          더 많은 커뮤니티를 불러오는 중...
        </div>
      )}

      {/* '더보기' 버튼을 모든 아이템이 로드되지 않았을 때만 보여줌 */}
      {!allItemsLoaded && (
        <div className="text-center mt-10">
          <Button
            onClick={handleLoadMore}
            className="px-8 py-3 text-lg"
            disabled={isFetching}
          >
            더보기
          </Button>
        </div>
      )}

      <ApplyToCommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        communityId={selectedCommunityId || ""}
        // ApplyToCommunityModal 내부에서 API 호출 로직을 처리하므로, 여기서는 communityId만 전달합니다.
      />
    </section>
  );
};

export default RecruitingCommunityList;
