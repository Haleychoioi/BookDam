// src/pages/mypage/MyCommunitiesRecruitingPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import RecruitingCommunityCard from "../../components/mypage/RecruitingCommunityCard";
import Pagination from "../../components/common/Pagination";
import type { Community } from "../../types";
import { fetchCommunities, cancelRecruitment } from "../../api/communities"; // API 함수 임포트

// 더미 데이터 삭제
// const dummyRecruitingCommunities: Community[] = [...]

const MyCommunitiesRecruitingPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"모집중" | "모집종료" | "전체">(
    "전체"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 페이지당 게시물 수

  const loadRecruitingCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: 백엔드에 'GET /mypage/communities/recruiting' API가 필요합니다.
      // 현재는 모든 커뮤니티를 가져와서 프론트엔드에서 'host' 역할로 필터링합니다.
      // fetchCommunities는 모든 커뮤니티를 가져오므로, 사용자 역할 정보를 백엔드에서 받아와야 정확합니다.
      // 이 예시에서는 임시적으로 모든 커뮤니티를 가져와 필터링하는 로직을 사용합니다.
      const response = await fetchCommunities(1, 100); // 충분한 수의 커뮤니티를 가져오기 위해 pageSize를 크게 설정

      // 실제 API에서는 로그인한 사용자가 호스트로 모집한 커뮤니티만 반환해야 하지만,
      // 현재 fetchCommunities는 모든 커뮤니티를 가져오므로, 임시로 필터링 로직을 가정합니다.
      // 정확한 구현을 위해서는 백엔드 API 수정이 선행되어야 합니다.
      const myRecruitingCommunities = response.communities.filter(
        (comm) => comm.role === "host"
      );
      setCommunities(myRecruitingCommunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruitingCommunities();
  }, [loadRecruitingCommunities]);

  const filteredCommunities = useMemo(() => {
    setCurrentPage(1); // 탭 변경 시 페이지 1로 초기화
    if (activeTab === "전체") {
      return communities;
    }
    return communities.filter((comm) => comm.status === activeTab);
  }, [communities, activeTab]);

  const totalFilteredItems = filteredCommunities.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const paginatedCommunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCommunities.slice(startIndex, endIndex);
  }, [filteredCommunities, currentPage, itemsPerPage]);

  const handleEndRecruitment = async (communityId: string) => {
    console.log("모집 종료 요청 (상위 컴포넌트에서 수신):", communityId);
    try {
      await cancelRecruitment(communityId); // 실제 API 호출
      alert("모집이 성공적으로 종료되었습니다.");
      loadRecruitingCommunities(); // 모집 종료 후 목록 새로고침
    } catch (error) {
      console.error("모집 종료 중 오류 발생:", error);
      alert("모집 종료 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        모집 중인 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="내가 모집 중인 커뮤니티"
        description="여기에서 당신이 모집 중인 커뮤니티의 현황을 확인하고 관리할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
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
          onClick={() => setActiveTab("모집중")}
          className={`px-4 py-2 text-lg font-medium ${
            activeTab === "모집중"
              ? "text-main border-b-2 border-main"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          모집 중
        </button>
        <button
          onClick={() => setActiveTab("모집종료")}
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
    </div>
  );
};

export default MyCommunitiesRecruitingPage;
