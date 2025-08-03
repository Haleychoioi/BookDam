// src/pages/mypage/MyCommunitiesParticipatingPage.tsx

import MyPageHeader from "../../components/mypage/MyPageHeader";
import CommunityCard from "../../components/mypage/ParticipatingCommunityCard";
import type { Community } from "../../types";
import { useQuery } from "@tanstack/react-query"; // useQuery 임포트
import {
  fetchParticipatingCommunities,
  leaveOrDeleteCommunity,
} from "../../api/communities"; // API 함수 임포트
import { useAuth } from "../../hooks/useAuth"; // currentUserProfile을 위해 useAuth 임포트

const MyCommunitiesParticipatingPage: React.FC = () => {
  const { currentUserProfile } = useAuth(); // 사용자 ID를 위해 useAuth 훅 사용

  // useQuery를 사용하여 커뮤니티 데이터 가져오기
  const {
    data: communities,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Community[], Error>({
    queryKey: ["participatingCommunities"],
    queryFn: fetchParticipatingCommunities,
    staleTime: 1000 * 60, // 1분 동안 데이터 신선하게 유지
    retry: 1,
    enabled: !!currentUserProfile, // currentUserProfile이 있을 때만 쿼리 실행
  });

  // 커뮤니티 탈퇴 또는 삭제 핸들러
  const handleLeaveOrDelete = async (
    communityId: string,
    role: "host" | "member"
  ) => {
    if (!currentUserProfile) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (
      window.confirm(
        `${
          role === "host"
            ? "커뮤니티를 삭제하시겠습니까? 삭제 시 모든 기록이 사라집니다."
            : "커뮤니티에서 탈퇴하시겠습니까?"
        }`
      )
    ) {
      try {
        await leaveOrDeleteCommunity(communityId); // 실제 API 호출
        alert(
          `${
            role === "host"
              ? "커뮤니티를 성공적으로 삭제하였습니다."
              : "커뮤니티에서 성공적으로 탈퇴하였습니다."
          }`
        );
        refetch(); // 작업 성공 후 목록 새로고침
      } catch (err: unknown) {
        console.error("커뮤니티 처리 중 오류 발생:", err);
        let errorMessage =
          "커뮤니티 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
        if (err instanceof Error) {
          // 에러 메시지가 CustomError 등 백엔드에서 온 메시지일 경우 활용
          errorMessage = err.message;
        }
        alert(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        참여 중인 커뮤니티 목록을 불러오는 중...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {error?.message}
      </div>
    );
  }

  // 데이터가 없거나 비어있는 경우 (isLoading이 false이고 communities가 비어있는 경우)
  if (!communities || communities.length === 0) {
    return (
      <div className="p-6">
        <MyPageHeader
          title="현재 참여 중인 커뮤니티를 확인하세요"
          description="여기에서 당신이 현재 참여하고 있는 커뮤니티 목록을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
        />
        <p className="col-span-full text-center text-gray-500 py-10">
          참여 중인 커뮤니티가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MyPageHeader
        title="현재 참여 중인 커뮤니티를 확인하세요"
        description="여기에서 당신이 현재 참여하고 있는 커뮤니티 목록을 확인할 수 있습니다. 다양한 주제의 커뮤니티에서 활동해보세요."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onLeaveOrDelete={handleLeaveOrDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCommunitiesParticipatingPage;
