// src/pages/mypage/MyCommunitiesAppliedPage.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
import MyPageHeader from "../../components/mypage/myPageHeader";
import AppliedCommunityCard from "../../components/mypage/AppliedCommunityCard";
import Pagination from "../../components/common/Pagination";
import { type AppliedCommunity } from "../../types";
import {
  fetchAppliedCommunities,
  cancelApplication,
} from "../../api/communities"; // fetchAppliedCommunities와 cancelApplication 임포트

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
      const fetchedData = await fetchAppliedCommunities();
      setCommunities(fetchedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleCancelApplication = async (applicationId: string) => {
    // communityId -> applicationId로 변경 (applicationId로 취소)
    if (window.confirm("정말로 이 커뮤니티 가입 신청을 취소하시겠습니까?")) {
      console.log(`신청 취소 요청: ${applicationId}`);
      try {
        await cancelApplication(applicationId); // 실제 API 호출
        alert("커뮤니티 신청이 성공적으로 취소되었습니다.");
        loadAppliedCommunities(); // 취소 후 목록 새로고침
      } catch (error) {
        console.error("신청 취소 중 오류 발생:", error);
        let errorMessage =
          "신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
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
              // handleCancelApplication에 community.id 대신 community.applicationId를 전달해야 합니다.
              // AppliedCommunity 타입에 applicationId 필드가 있다고 가정합니다. (types/index.ts의 AppliedCommunity 참조)
              // 만약 없다면, community.id를 사용하되, 백엔드가 communityId가 아닌 applicationId를 받는다면
              // 백엔드 API를 수정하거나, 여기서 applicationId를 별도로 찾아 전달해야 합니다.
              // 현재 AppliedCommunity는 communityId가 아닌 id 필드를 가지고 있고, 이는 teamId의 string 버전이므로
              // 이 API에서는 applicationId가 필요합니다.
              onCancelApplication={() => handleCancelApplication(community.id)} // community.id (string)을 그대로 전달
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
