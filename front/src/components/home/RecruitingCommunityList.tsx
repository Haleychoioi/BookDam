// src/components/home/RecruitingCommunityList.tsx

import { useState } from "react";
import Button from "../common/Button";
import ApplyToCommunityModal from "../modals/ApplyToCommunityModal";
import type { Community } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunities } from "../../api/communities";
import { useAuth } from "../../hooks/useAuth";
import { FaUserFriends } from "react-icons/fa";

const initialDisplayCount = 6;
const loadMoreIncrement = 3;

const RecruitingCommunityList: React.FC = () => {
  const [currentLimit, setCurrentLimit] = useState(initialDisplayCount);
  const { currentUserProfile } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const [listError, setListError] = useState<string | null>(null);

  const {
    data: communitiesData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<{ communities: Community[]; totalResults: number }, Error>({
    queryKey: ["allCommunities", currentLimit, currentUserProfile?.userId],
    queryFn: ({ queryKey }) => {
      const [, limit, userId] = queryKey;
      return fetchCommunities(1, limit as number, "latest", userId as number);
    },
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
  });

  const communities = communitiesData?.communities || [];
  const totalResults = communitiesData?.totalResults || 0;

  const handleLoadMore = () => {
    setCurrentLimit((prevLimit) => prevLimit + loadMoreIncrement);
  };

  const handleJoinClick = (community: Community) => {
    // ✨ 이미 신청했거나 호스트인 경우 모달 열지 않음 ✨
    if (
      community.hasApplied ||
      currentUserProfile?.userId === community.hostId
    ) {
      return;
    }

    setListError(null);
    setSelectedCommunityId(community.id);
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

  const allItemsLoaded = communities.length >= totalResults;

  if (isLoading && !isFetching) {
    return (
      <section className="container mx-auto py-12 px-4 text-center text-gray-600">
        커뮤니티 목록을 불러오는 중...
      </section>
    );
  }

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

      {listError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">오류: </strong>
          <span className="block sm:inline">{listError}</span>
        </div>
      )}

      <div className="space-y-6">
        {communities.length === 0 && !isLoading && !isFetching ? (
          <p className="text-center text-gray-500 py-10">
            현재 모집 중인 커뮤니티가 없습니다.
          </p>
        ) : (
          communities.map((community) => {
            const isCurrentUserHost =
              currentUserProfile?.userId === community.hostId;
            const hasApplied = community.hasApplied;

            return (
              <div
                key={community.id}
                className="flex justify-between items-center border-b border-gray-200 pb-4"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {community.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {community.description}
                  </p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
                    <span>
                      {community.currentMembers}/{community.maxMembers}명
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleJoinClick(community)}
                  className="px-6 py-2"
                  bgColor={hasApplied ? "bg-gray-400" : "bg-apply"}
                  textColor="text-white"
                  hoverBgColor={
                    hasApplied ? "hover:bg-gray-500" : "hover:bg-apply"
                  }
                  disabled={isCurrentUserHost || hasApplied}
                >
                  {isCurrentUserHost
                    ? "나의 커뮤니티"
                    : hasApplied
                    ? "신청 완료"
                    : "신청하기"}
                </Button>
              </div>
            );
          })
        )}
      </div>

      {isFetching && communities.length > 0 && (
        <div className="text-center mt-4 text-gray-500">
          더 많은 커뮤니티를 불러오는 중...
        </div>
      )}

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
        onError={handleApplyModalError}
      />
    </section>
  );
};

export default RecruitingCommunityList;
