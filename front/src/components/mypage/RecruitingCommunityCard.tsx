import React from "react";
import Button from "../common/Button";
import { Link } from "react-router-dom"; // Link 임포트 유지
import { FaUserFriends } from "react-icons/fa"; // 인원 아이콘 임포트 유지
import type { Community } from "../../types"; // ✨ Community 타입 임포트 ✨

interface RecruitingCommunityCardProps {
  community: Community; // ✨ 임포트한 Community 타입 사용 ✨
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
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      <div className="flex flex-col items-start mb-6">
        <div className="flex justify-between items-start w-full">
          <div>
            <h3 className="text-md font-bold text-gray-800 mb-1">
              {community.title}
            </h3>
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
            <span>
              {community.currentMembers}/{community.maxMembers}명
            </span>
          </div>
        </div>
        <hr className="border-t border-gray-300 w-full mb-4" />
        <p className="text-gray-700 text-md font-light leading-relaxed">
          {community.description}
        </p>
      </div>

      <div className="flex flex-col items-end mt-auto w-full space-y-2">
        {/* 신청 내역 보기 버튼 */}
        <div className="w-full">
          <Link
            to={`/mypage/communities/recruiting/${community.id}/applicants`}
          >
            <Button
              bgColor="bg-gray-200"
              textColor="text-gray-700"
              hoverBgColor="hover:bg-gray-300"
              className="w-full px-2 py-2 text-sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              신청 내역 보기
            </Button>
          </Link>
        </div>

        {/* 모집 종료 버튼 */}
        <div className="w-full">
          <Button
            onClick={handleEndRecruitmentClick}
            bgColor={isRecruitmentEnded ? "bg-gray-400" : "bg-main"}
            textColor="text-white"
            hoverBgColor={
              isRecruitmentEnded ? "hover:bg-gray-500" : "hover:bg-apply"
            }
            className="w-full px-2 py-2 text-sm"
            disabled={isRecruitmentEnded}
          >
            {isRecruitmentEnded ? "모집 종료됨" : "모집 종료"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecruitingCommunityCard;
