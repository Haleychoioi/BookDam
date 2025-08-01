// src/pages/mypage/MyCommunitiesAppliedPage.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import AppliedCommunityCard from "../../components/mypage/AppliedCommunityCard";
import Pagination from "../../components/common/Pagination";
import { type AppliedCommunity } from "../../types";
import { fetchAppliedCommunities } from "../../api/communities"; // fetchAppliedCommunities는 communities.ts에 있습니다.

const MyCommunitiesAppliedPage: React.FC = () => {
  const [communities, setCommunities] = useState<AppliedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "rejected" | "전체"
  >("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 내가 신청한 커뮤니티 목록을 불러오는 함수
  const loadAppliedCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // fetchAppliedCommunities는 src/api/communities.ts에서 이미 AppliedCommunity[]를 반환합니다.
      // 따라서 여기서 추가적인 .map() 변환이 필요 없습니다.
      const fetchedData = await fetchAppliedCommunities();
      setCommunities(fetchedData); // ★★★ 이 부분이 올바른 코드입니다. ★★★
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열 비움 (컴포넌트 마운트 시 한 번만 실행)

  useEffect(() => {
    loadAppliedCommunities();
  }, [loadAppliedCommunities]);

  const filteredCommunities = useMemo(() => {
    setCurrentPage(1);
    if (activeTab === "전체") {
      return communities;
    }
    return communities.filter((comm) => comm.myApplicationStatus === activeTab);
  }, [communities, activeTab]);

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

  const handleCancelApplication = async (communityId: string) => {
    if (window.confirm("정말로 이 커뮤니티 가입 신청을 취소하시겠습니까?")) {
      console.log(`신청 취소 요청: ${communityId}`);
      try {
        // TODO: 실제 API 호출: DELETE /mypage/communities/applied/:communityId API 필요
        // 현재 명세서에는 명확한 신청 취소 API가 없습니다.
        // 백엔드에서 이 기능을 지원하는 API를 구현해야 합니다.
        // 예시: await cancelApplication(communityId);

        // 현재는 API 호출 없이 임시 메시지 표시
        alert("커뮤니티 신청이 취소되었습니다. (API 미연동)");
        loadAppliedCommunities(); // 취소 후 목록 새로고침 (API 호출 성공 가정)
      } catch (error) {
        console.error("신청 취소 중 오류 발생:", error);
        alert("신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        신청한 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="내가 신청한 커뮤니티"
        description="여기에서 당신이 가입 신청한 커뮤니티의 현황을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("전체")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "전체"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "pending"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 대기 중
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "accepted"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 수락됨
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "rejected"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          신청 거절됨
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCommunities.length > 0 ? (
          paginatedCommunities.map((community) => (
            <AppliedCommunityCard
              key={community.id}
              community={community}
              onCancelApplication={handleCancelApplication}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            {activeTab === "pending" && "신청 대기 중인 커뮤니티가 없습니다."}
            {activeTab === "accepted" && "신청 수락된 커뮤니티가 없습니다."}
            {activeTab === "rejected" && "신청 거절된 커뮤니티가 없습니다."}
            {activeTab === "전체" && "신청한 커뮤니티가 없습니다."}
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
    </div>
  );
};

export default MyCommunitiesAppliedPage;
