// front/src/pages/mypage/MyCommunitiesAppliedPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import AppliedCommunityCard from "../../components/mypage/AppliedCommunityCard";
import Pagination from "../../components/common/Pagination";
import { type AppliedCommunity } from "../../types";

// Mock Data: 내가 신청한 커뮤니티 목록
const dummyAppliedCommunities: AppliedCommunity[] = [
  {
    id: "applied-comm-1",
    title: "SF 소설 클럽",
    description: "새로운 SF 소설을 함께 읽고 토론하는 모임입니다.",
    hostName: "SF매니아",
    currentMembers: 3,
    maxMembers: 7,
    myApplicationStatus: "pending", // ✨ status 대신 myApplicationStatus 사용 ✨
    role: "member", // Community 타입의 필수 필드 (없다면 추가)
    status: "모집중", // Community 타입의 필수 필드 (없다면 추가)
  },
  {
    id: "applied-comm-2",
    title: "클린 코드 스터디",
    description: "개발 서적 클린 코드를 함께 읽고 스터디합니다.",
    hostName: "코드마스터",
    currentMembers: 5,
    maxMembers: 5,
    myApplicationStatus: "accepted", // ✨ status 대신 myApplicationStatus 사용 ✨
    role: "member",
    status: "모집종료",
  },
  {
    id: "applied-comm-3",
    title: "고전 재해석 모임",
    description: "오래된 고전을 현대적인 시각으로 재해석합니다.",
    hostName: "옛것좋아",
    currentMembers: 4,
    maxMembers: 8,
    myApplicationStatus: "rejected", // ✨ status 대신 myApplicationStatus 사용 ✨
    role: "member",
    status: "모집중",
  },
  {
    id: "applied-comm-4",
    title: "판타지 월드 탐험",
    description: "다양한 판타지 세계관의 소설을 탐구합니다.",
    hostName: "판타지왕",
    currentMembers: 2,
    maxMembers: 6,
    myApplicationStatus: "pending",
    role: "member",
    status: "모집중",
  },
  {
    id: "applied-comm-5",
    title: "경제학 스터디",
    description: "맨큐의 경제학을 함께 읽고 토론합니다.",
    hostName: "이코노미스트",
    currentMembers: 5,
    maxMembers: 10,
    myApplicationStatus: "pending",
    role: "member",
    status: "모집중",
  },
  {
    id: "applied-comm-6",
    title: "자기계발 챌린지",
    description: "성장을 위한 자기계발 도서를 읽고 실천합니다.",
    hostName: "그로스",
    currentMembers: 7,
    maxMembers: 10,
    myApplicationStatus: "accepted",
    role: "member",
    status: "모집중",
  },
  {
    id: "applied-comm-7",
    title: "환경 도서 읽기",
    description: "지구를 위한 환경 도서를 읽고 지속가능성에 대해 논합니다.",
    hostName: "에코",
    currentMembers: 3,
    maxMembers: 6,
    myApplicationStatus: "rejected",
    role: "member",
    status: "모집종료",
  },
];

const MyCommunitiesAppliedPage: React.FC = () => {
  const [communities, setCommunities] = useState<AppliedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "accepted" | "rejected" | "전체"
  >("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchAppliedCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        setCommunities(dummyAppliedCommunities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedCommunities();
  }, []);

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

  // ✨ 신청 취소 핸들러 ✨
  const handleCancelApplication = async (communityId: string) => {
    if (window.confirm("정말로 이 커뮤니티 가입 신청을 취소하시겠습니까?")) {
      console.log(`신청 취소 요청: ${communityId}`);
      try {
        // TODO: 실제 API 호출: DELETE /mypage/communities/applied/:communityId
        // 또는 API 명세서에 맞는 다른 취소 API
        alert("커뮤니티 신청이 취소되었습니다.");
        // Mock Data 업데이트: 해당 커뮤니티를 목록에서 제거
        setCommunities((prev) => prev.filter((c) => c.id !== communityId));
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
              onCancelApplication={handleCancelApplication} // ✨ prop 전달 ✨
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
