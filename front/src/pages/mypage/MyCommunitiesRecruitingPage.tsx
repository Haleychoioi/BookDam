// front/src/pages/mypage/MyCommunitiesRecruitingPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import MyPageHeader from "../../components/mypage/myPageHeader"; // MyPageHeader 재활용
import RecruitingCommunityCard from "../../components/mypage/RecruitingCommunityCard"; // RecruitingCommunityCard 재활용
import Pagination from "../../components/common/Pagination"; // 페이지네이션 컴포넌트 임포트
import type { Community } from "../../types"; // ✨ Community 타입 임포트 ✨

// ✨ dummyRecruitingCommunities 데이터에 role 필드 추가 ✨
const dummyRecruitingCommunities: Community[] = [
  {
    id: "rec-comm-1",
    title: "혼모노 깊은 토론 모임",
    description: "새로운 독서 여정, 지금 이 커뮤니티와 함께 시작해보세요.",
    hostName: "내닉네임1",
    currentMembers: 2,
    maxMembers: 8,
    status: "모집중",
    role: "host", // ✨ role 필드 추가 ✨
  },
  {
    id: "rec-comm-2",
    title: "도서명 인문학 스터디",
    description: "인문학 고전을 함께 읽고 토론하는 모임입니다.",
    hostName: "내닉네임2",
    currentMembers: 5,
    maxMembers: 10,
    status: "모집중",
    role: "host",
  },
  {
    id: "rec-comm-3",
    title: "모집 종료된 SF 클럽",
    description: "아쉽게도 모집이 종료된 SF 소설 독서 클럽입니다.",
    hostName: "내닉네임3",
    currentMembers: 7,
    maxMembers: 7,
    status: "모집종료",
    role: "host",
  },
  {
    id: "rec-comm-4",
    title: "새로운 소설 함께 읽기",
    description: "최신 인기 소설을 함께 읽고 감상을 나눕니다.",
    hostName: "내닉네임4",
    currentMembers: 1,
    maxMembers: 5,
    status: "모집중",
    role: "host",
  },
  {
    id: "rec-comm-5",
    title: "판타지 세계관 연구",
    description: "다양한 판타지 소설의 세계관을 분석합니다.",
    hostName: "판타지왕",
    currentMembers: 3,
    maxMembers: 6,
    status: "모집중",
    role: "host",
  },
  {
    id: "rec-comm-6",
    title: "고전 재해석 모임",
    description: "오래된 고전을 현대적인 시각으로 재해석합니다.",
    hostName: "올드독",
    currentMembers: 4,
    maxMembers: 8,
    status: "모집중",
    role: "host",
  },
  {
    id: "rec-comm-7",
    title: "시집 읽기 클럽",
    description: "매주 새로운 시집을 읽고 감상을 공유합니다.",
    hostName: "시인",
    currentMembers: 2,
    maxMembers: 5,
    status: "모집중",
    role: "host",
  },
  {
    id: "rec-comm-8",
    title: "모집 종료된 추리 소설",
    description: "숨겨진 진실을 파헤치는 추리 소설 토론 모임.",
    hostName: "셜록",
    currentMembers: 5,
    maxMembers: 5,
    status: "모집종료",
    role: "host",
  },
  {
    id: "rec-comm-9",
    title: "만화/웹툰 분석",
    description: "만화와 웹툰의 스토리텔링 기법을 분석합니다.",
    hostName: "웹툰러",
    currentMembers: 8,
    maxMembers: 8,
    status: "모집종료",
    role: "host",
  },
  {
    id: "rec-comm-10",
    title: "개발 서적 스터디",
    description: "프로그래밍 서적을 함께 읽고 코드 리뷰합니다.",
    hostName: "코더",
    currentMembers: 3,
    maxMembers: 5,
    status: "모집중",
    role: "host",
  },
];

const MyCommunitiesRecruitingPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"모집중" | "모집종료" | "전체">(
    "전체"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchRecruitingCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        setCommunities(dummyRecruitingCommunities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitingCommunities();
  }, []);

  const filteredCommunities = useMemo(() => {
    setCurrentPage(1);
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
    // ✨ MyCommunitiesRecruitingPage에서는 window.confirm 제거 ✨
    // 최종 확인은 RecruitingCommunityCard에서 이미 처리됨
    // 또는, 이 로직은 API 호출만을 담당하도록 변경.
    console.log("모집 종료 요청 (상위 컴포넌트에서 수신):", communityId);
    try {
      // TODO: DELETE /mypage/communities/recruiting/:communityId API 호출 (모집 취소)
      alert("모집이 성공적으로 종료되었습니다.");
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId ? { ...c, status: "모집종료" } : c
        )
      );
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
