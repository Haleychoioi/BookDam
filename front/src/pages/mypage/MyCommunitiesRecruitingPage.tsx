// src/pages/mypage/MyCommunitiesRecruitingPage.tsx
import { useState, useEffect, useMemo } from "react"; // useCallback 제거
import MyPageHeader from "../../components/mypage/MyPageHeader";
import RecruitingCommunityCard from "../../components/mypage/RecruitingCommunityCard";
import Pagination from "../../components/common/Pagination";
import type { Community } from "../../types";
import {
  fetchCommunities,
  cancelRecruitment,
  updateCommunityDetails,
} from "../../api/communities";
import EditCommunityModal from "../../components/modals/EditCommunityModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 더미 데이터 (백엔드 연결 전 임시 사용)
const dummyParticipatingCommunities = [
  {
    communityId: 1,
    bookTitle: "클린 코드",
    communityName: "클린 코드 스터디",
    imageUrl:
      "https://image.aladin.co.kr/product/100/66/coversum/8992206611_1.jpg",
    leaderName: "김철수",
    role: "host", // 'LEADER' 대신 'host'
    status: "모집중", // 'RECRUITING' 대신 '모집중'
    memberCount: 5,
    id: "1", // Community 타입에 필요한 id 추가
    title: "클린 코드 스터디", // Community 타입에 필요한 title 추가
    description: "클린 코드를 위한 스터디", // Community 타입에 필요한 description 추가
    hostName: "김철수", // Community 타입에 필요한 hostName 추가
    currentMembers: 5, // Community 타입에 필요한 currentMembers 추가
    maxMembers: 10, // Community 타입에 필요한 maxMembers 추가
  },
  {
    communityId: 2,
    bookTitle: "데미안",
    communityName: "데미안 독서 모임",
    imageUrl:
      "https://image.aladin.co.kr/product/100/66/coversum/8992206611_1.jpg",
    leaderName: "박영희",
    role: "member", // 'MEMBER' 대신 'member'
    status: "모집종료", // 'ACTIVE' 대신 '모집종료'
    memberCount: 8,
    id: "2",
    title: "데미안 독서 모임",
    description: "데미안을 읽고 토론하는 모임",
    hostName: "박영희",
    currentMembers: 8,
    maxMembers: 8,
  },
];

const MyCommunitiesRecruitingPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [communities, setCommunities] = useState<Community[]>([]);
  // loading, error 상태는 useQuery의 isLoading, isError, error로 대체
  const [activeTab, setActiveTab] = useState<"모집중" | "모집종료" | "전체">(
    "전체"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommunityToEdit, setSelectedCommunityToEdit] =
    useState<Community | null>(null);

  const {
    data: fetchedCommunitiesData,
    isLoading: isLoadingCommunities,
    isError: isErrorCommunities,
    error: communitiesError,
  } = useQuery<Community[], Error>({
    // 타입 명시
    queryKey: ["myRecruitingCommunities"],
    queryFn: async () => {
      // TODO: 백엔드에 `GET /mypage/communities/recruiting` API 구현 후 교체
      // 현재는 fetchCommunities가 모든 커뮤니티를 가져오므로, 임시로 'host' 역할로 필터링합니다.
      const response = await fetchCommunities(1, 100);
      return response.communities.filter((comm) => comm.role === "host");
    },
    staleTime: 1000 * 60,
    // 초기 데이터 설정을 통해 `isLoading` 상태에서도 UI 렌더링 가능
    placeholderData: (previousData) =>
      previousData || dummyParticipatingCommunities,
  });

  // useEffect를 useQuery의 onSuccess 등으로 대체 가능
  useEffect(() => {
    if (fetchedCommunitiesData) {
      setCommunities(fetchedCommunitiesData);
    }
  }, [fetchedCommunitiesData]);

  // 커뮤니티 상세 정보 업데이트 뮤테이션
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
    // 타입 명시
    mutationFn: ({ communityId, updateData }) =>
      updateCommunityDetails(communityId, updateData),
    onSuccess: () => {
      alert("커뮤니티 정보가 성공적으로 업데이트되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
    },
    onError: (err: Error) => {
      // err: any -> err: Error 로 변경
      const errorMessage =
        err.message || "커뮤니티 정보 업데이트 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // 모집 종료 뮤테이션
  const cancelRecruitmentMutation = useMutation<void, Error, string>({
    // 타입 명시
    mutationFn: cancelRecruitment,
    onSuccess: () => {
      alert("모집이 성공적으로 종료되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myRecruitingCommunities"] });
    },
    onError: (err: Error) => {
      // err: any -> err: Error 로 변경
      const errorMessage = err.message || "모집 종료 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const handleEndRecruitment = async (communityId: string) => {
    if (window.confirm("정말로 모집을 종료하시겠습니까?")) {
      cancelRecruitmentMutation.mutate(communityId);
    }
  };

  const filteredCommunities = useMemo(() => {
    // fetchedCommunitiesData가 로드되기 전에는 빈 배열 반환
    const sourceCommunities =
      fetchedCommunitiesData || dummyParticipatingCommunities;

    // 탭 변경 시 페이지 1로 초기화는 useMemo 외부에서 처리
    let filtered = sourceCommunities;
    if (activeTab === "모집중") {
      filtered = sourceCommunities.filter((comm) => comm.status === "모집중");
    } else if (activeTab === "모집종료") {
      filtered = sourceCommunities.filter((comm) => comm.status === "모집종료");
    }
    // activeTab이 변경될 때 currentPage를 1로 재설정
    setCurrentPage(1);
    return filtered;
  }, [fetchedCommunitiesData, activeTab]);

  const totalFilteredItems = filteredCommunities.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCommunities.slice(startIndex, endIndex);
  }, [filteredCommunities, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleTabChange = (tab: "모집중" | "모집종료" | "전체") => {
    setActiveTab(tab);
    // 탭 변경 시 useMemo에서 currentPage를 1로 재설정하도록 로직 변경
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

  if (isLoadingCommunities) {
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
