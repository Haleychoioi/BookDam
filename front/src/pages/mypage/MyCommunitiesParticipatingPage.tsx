import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Link는 더 이상 여기서 직접 사용되지 않음
import CommunityCard from "../../components/mypage/ParticipatingCommunityCard";
import MyPageHeader from "../../components/mypage/myPageHeader"; // ✨ MyPageHeader 임포트 ✨

interface ParticipatingCommunity {
  id: string;
  title: string;
  description: string;
  role: "host" | "member";
  bookTitle: string;
  hostNickname: string;
  currentMembers: number;
  maxMembers: number;
  coverImage?: string;
}

const dummyParticipatingCommunities: ParticipatingCommunity[] = [
  {
    id: "part-comm-1",
    title: "혼모노 독서 모임",
    description: "깊은 토론하실 다섯 분 구합니다",
    role: "member",
    bookTitle: "혼모노",
    hostNickname: "닉네임",
    currentMembers: 3,
    maxMembers: 8,
    coverImage: "https://via.placeholder.com/150x200/F0F0F0/B0B0B0?text=혼모노",
  },
  {
    id: "part-comm-2",
    title: "도서명 독서 모임",
    description: "인문학 고전을 함께 읽고 토론",
    role: "host",
    bookTitle: "도서명",
    hostNickname: "내닉네임",
    currentMembers: 6,
    maxMembers: 8,
    coverImage: "https://via.placeholder.com/150x200/F0F0F0/B0B0B0?text=도서명",
  },
  {
    id: "part-comm-3",
    title: "제3의 커뮤니티",
    description: "SF 소설 매니아 모임",
    role: "member",
    bookTitle: "SF 도서",
    hostNickname: "SF덕후",
    currentMembers: 2,
    maxMembers: 5,
    coverImage: "https://via.placeholder.com/150x200/F0F0F0/B0B0B0?text=SF도서",
  },
];

const MyCommunitiesParticipatingPage: React.FC = () => {
  const [communities, setCommunities] = useState<ParticipatingCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipatingCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        setCommunities(dummyParticipatingCommunities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipatingCommunities();
  }, []);

  const handleLeaveOrDelete = async (
    communityId: string,
    role: "host" | "member"
  ) => {
    // 확인 메시지 변경
    if (
      window.confirm(
        `${
          role === "host"
            ? "커뮤니티를 삭제하시겠습니까?"
            : "커뮤니티에서 탈퇴하시겠습니까?"
        }`
      )
    ) {
      // ✨ Confirm 메시지 수정 ✨
      console.log(`${role === "host" ? "삭제" : "탈퇴"} 요청:`, communityId);
      try {
        // alert 메시지 변경
        alert(
          `${
            role === "host"
              ? "커뮤니티를 삭제하였습니다."
              : "커뮤니티에서 탈퇴하였습니다."
          }`
        ); // ✨ Alert 메시지 수정 ✨
        setCommunities((prev) => prev.filter((c) => c.id !== communityId));
      } catch (error) {
        console.error("커뮤니티 처리 중 오류 발생:", error);
        alert("커뮤니티 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        참여 중인 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* ✨ MyPageHeader 컴포넌트 사용 ✨ */}
      <MyPageHeader
        title="현재 참여 중인 커뮤니티를 확인하세요"
        description="여기에서 당신이 현재 참여하고 있는 커뮤니티 목록을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      {/* 커뮤니티 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.length > 0 ? (
          communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onLeaveOrDelete={handleLeaveOrDelete}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            참여 중인 커뮤니티가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyCommunitiesParticipatingPage;
