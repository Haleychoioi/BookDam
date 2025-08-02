// src/pages/mypage/MyCommunitiesRecruitingPage.tsx

import { useState, useEffect, useMemo } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader"; // ✨ 수정: MyPageHeader로 경로 통일 ✨
import RecruitingCommunityCard from "../../components/mypage/RecruitingCommunityCard";
import Pagination from "../../components/common/Pagination";
import type { Community } from "../../types";
import {
  fetchMyRecruitingCommunities, // 내가 모집 중인 커뮤니티 API
  updateCommunityDetails,
  endRecruitment, // ✨ 추가: endRecruitment API 임포트 ✨
  fetchMyEndedCommunities, // ✨ 추가: fetchMyEndedCommunities API 임포트 ✨
} from "../../api/communities";
import EditCommunityModal from "../../components/modals/EditCommunityModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

const MyCommunitiesRecruitingPage: React.FC = () => {
  const { currentUserProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"모집중" | "모집종료" | "전체">(
    "전체"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommunityToEdit, setSelectedCommunityToEdit] =
    useState<Community | null>(null);

  const {
    data: fetchedCommunities,
    isLoading: isLoadingCommunities,
    isError: isErrorCommunities,
    error: communitiesError,
    // refetch, // ✨ 제거: 이제 직접 refetch를 사용하지 않고 queryClient.invalidateQueries를 사용합니다. ✨
  } = useQuery<Community[], Error>({
    queryKey: [
      "myRecruitingCommunities",
      activeTab,
      currentUserProfile?.userId,
    ],
    queryFn: async () => {
      if (!currentUserProfile) {
        throw new Error("로그인이 필요합니다.");
      }
      let communities: Community[] = [];
      if (activeTab === "모집중" || activeTab === "전체") {
        const recruiting = await fetchMyRecruitingCommunities();
        communities = [...communities, ...recruiting];
      }
      if (activeTab === "모집종료" || activeTab === "전체") {
        const ended = await fetchMyEndedCommunities();
        communities = [...communities, ...ended];
      }

      // '전체' 탭일 때는 중복 제거 (만약 같은 커뮤니티가 여러 상태에 걸쳐 조회될 경우)
      if (activeTab === "전체") {
        const uniqueCommunities = Array.from(
          new Map(communities.map((item) => [item.id, item])).values()
        );
        // createdAt 기준으로 정렬
        uniqueCommunities.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return uniqueCommunities;
      }

      // 각 탭에 맞게 필터링 (api에서 이미 필터링되어 오지만, 혹시 모를 경우를 대비)
      if (activeTab === "모집중") {
        return communities.filter((comm) => comm.status === "모집중");
      } else if (activeTab === "모집종료") {
        return communities.filter((comm) => comm.status === "모집종료");
      }
      return communities;
    },
    staleTime: 1000 * 60,
    retry: 1,
    enabled: !authLoading && !!currentUserProfile,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const updateCommunityMutation = useMutation<
    Community,
    Error,
    {
      communityId: string;
      updateData: {
        title?: string;
        content?: string;
        maxMembers?: number;
        recruiting?: boolean;
      };
    }
  >({
    mutationFn: ({ communityId, updateData }) =>
      updateCommunityDetails(communityId, updateData),
    onSuccess: () => {
      alert("커뮤니티 정보가 성공적으로 업데이트되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
    },
    onError: (err: Error) => {
      const errorMessage =
        err.message || "커뮤니티 정보 업데이트 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // const cancelRecruitmentMutation = useMutation<void, Error, string>({ // ✨ 제거: 이 뮤테이션은 더 이상 직접 사용되지 않습니다. ✨
  //   mutationFn: cancelRecruitment,
  //   onSuccess: () => {
  //     alert("모집이 성공적으로 종료되었습니다.");
  //     queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
  //   },
  //   onError: (err: Error) => {
  //     const errorMessage = err.message || "모집 종료 중 오류가 발생했습니다.";
  //     alert(errorMessage);
  //   },
  // });

  const handleEndRecruitment = async (communityId: string) => {
    if (
      window.confirm(
        "정말로 이 커뮤니티 모집을 종료하시겠습니까? (모집 종료 시 모집중인 커뮤니티 목록에서 사라집니다.)"
      )
    ) {
      try {
        await endRecruitment(communityId); // 새로운 API 함수 호출
        alert("커뮤니티 모집이 성공적으로 종료되었습니다.");
        queryClient.invalidateQueries({
          queryKey: ["myRecruitingCommunities"],
        }); // 쿼리 무효화하여 목록 새로고침
      } catch (err: unknown) {
        console.error("모집 종료 중 오류 발생:", err);
        let errorMessage =
          "모집 종료 중 오류가 발생했습니다. 다시 시도해주세요.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        alert(errorMessage);
      }
    }
  };

  const totalFilteredItems = fetchedCommunities?.length || 0;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fetchedCommunities?.slice(startIndex, endIndex) || [];
  }, [fetchedCommunities, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleTabChange = (tab: "모집중" | "모집종료" | "전체") => {
    setActiveTab(tab);
  };

  const handleEditCommunityClick = (community: Community) => {
    setSelectedCommunityToEdit(community);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedCommunityToEdit(null);
  };

  const handleSaveCommunityDetails = async (
    communityId: string,
    updateData: {
      title?: string;
      content?: string;
      maxMembers?: number;
      recruiting?: boolean;
    }
  ) => {
    await updateCommunityMutation.mutateAsync({ communityId, updateData });
  };

  if (isLoadingCommunities || authLoading) {
    return (
      <div className="text-center py-12">
        모집 중인 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (isErrorCommunities) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {communitiesError?.message || "데이터를 불러오지 못했습니다."}
      </div>
    );
  }
  if (!currentUserProfile) {
    return (
      <div className="text-center py-12 text-red-500">로그인이 필요합니다.</div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="내가 모집 중인 커뮤니티"
        description="여기에서 당신이 모집 중인 커뮤니티의 현황을 확인하고 관리할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("전체")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "전체"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleTabChange("모집중")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "모집중"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          모집 중
        </button>
        <button
          onClick={() => handleTabChange("모집종료")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "모집종료"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          모집 종료
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCommunities.length > 0 ? (
          paginatedCommunities.map((community) => (
            <RecruitingCommunityCard
              key={community.id}
              community={community}
              onEndRecruitment={handleEndRecruitment}
              onEditCommunity={handleEditCommunityClick}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "모집중" && "현재 모집 중인 커뮤니티가 없습니다."}
            {activeTab === "모집종료" && "종료된 모집 커뮤니티가 없습니다."}
            {activeTab === "전체" && "모집 커뮤니티가 없습니다."}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedCommunityToEdit && (
        <EditCommunityModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          community={selectedCommunityToEdit}
          onSave={handleSaveCommunityDetails}
        />
      )}
    </div>
  );
};

export default MyCommunitiesRecruitingPage;
