import React from "react";
import Button from "../common/Button";
import { Link } from "react-router-dom"; // Link 임포트 유지
import { FaUserFriends } from "react-icons/fa"; // 인원 아이콘 임포트 유지

interface RecruitableCommunity {
  id: string;
  title: string;
  description: string;
  hostName: string;
  currentMembers: number;
  maxMembers: number;
  status: "모집중" | "모집종료";
}

interface RecruitingCommunityCardProps {
  community: RecruitableCommunity;
  onEndRecruitment: (communityId: string) => void;
}

const RecruitingCommunityCard: React.FC<RecruitingCommunityCardProps> = ({
  community,
  onEndRecruitment,
}) => {
  const isRecruitmentEnded = community.status === "모집종료";
  const isFull = community.currentMembers >= community.maxMembers;

  const handleEndRecruitmentClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 클릭 이벤트 전파 방지
    e.stopPropagation(); // Link의 클릭 이벤트 전파 방지

    if (!isFull) {
      if (
        !window.confirm(
          "모집 인원이 다 차지 않았습니다.\n정말로 모집을 종료하고 커뮤니티를 생성하시겠습니까?"
        )
      ) {
        return;
      }
    }
    onEndRecruitment(community.id);
  };

  // 자동 모집 종료 로직
  React.useEffect(() => {
    if (isFull && community.status === "모집중") {
      onEndRecruitment(community.id);
    }
  }, [
    isFull,
    community.status,
    community.id,
    onEndRecruitment,
    community.title,
  ]);

  return (
    // ✨ 이제 Link 태그가 카드 전체를 감싸지 않고, '신청 내역 보기' 버튼에만 적용됩니다. ✨
    // 카드 자체는 div로 변경하여 클릭이 불가능하도록 함.
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      <div className="flex flex-col items-start mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {community.title}
        </h3>
        <div className="flex items-center text-gray-600 text-base mb-1">
          <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
          <span>
            {community.currentMembers}/{community.maxMembers}명
          </span>
        </div>
        <hr className="border-t border-gray-300 w-full mb-4" />
        <p className="text-gray-700 text-lg font-light leading-relaxed">
          {community.description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <Link to={`/mypage/communities/recruiting/${community.id}/applicants`}>
          <Button
            bgColor="bg-gray-200" // 이미지에 보이는 회색 버튼 색상
            textColor="text-gray-700" // 이미지에 보이는 텍스트 색상
            hoverBgColor="hover:bg-gray-300" // 호버 시 색상
            className="px-2 py-2 text-sm"
          >
            신청 내역 보기
          </Button>
        </Link>

        <Button
          onClick={handleEndRecruitmentClick}
          bgColor={isRecruitmentEnded ? "bg-gray-400" : "bg-main"}
          textColor="text-white"
          hoverBgColor={
            isRecruitmentEnded ? "hover:bg-gray-500" : "hover:bg-apply"
          }
          className="ml-1 px-2 py-2 text-sm" // ml-2 추가하여 간격 조정
          disabled={isRecruitmentEnded}
        >
          {isRecruitmentEnded ? "모집 종료됨" : "모집 종료"}
        </Button>
      </div>
    </div>
  );
};

export default RecruitingCommunityCard;
