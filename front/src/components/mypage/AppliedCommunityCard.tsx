// front/src/components/mypage/AppliedCommunityCard.tsx

import React from "react";
import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";
import { type AppliedCommunity } from "../../types";

interface AppliedCommunityCardProps {
  community: AppliedCommunity;
  // ✨ 신청 취소 버튼을 위한 prop 추가 ✨
  onCancelApplication: (communityId: string) => void;
}

const AppliedCommunityCard: React.FC<AppliedCommunityCardProps> = ({
  community,
  onCancelApplication, // ✨ prop으로 받도록 추가 ✨
}) => {
  // 신청 상태에 따른 스타일 및 텍스트
  const statusColorClass = {
    pending: "text-blue-600 bg-blue-100", // 대기 중
    accepted: "text-green-600 bg-green-100", // 수락됨
    rejected: "text-red-600 bg-red-100", // 거절됨
  }[community.status];

  const statusText = {
    pending: "신청 대기 중",
    accepted: "신청 수락됨",
    rejected: "신청 거절됨",
  }[community.status];

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      {/* 카드 상단 내용 */}
      <div className="flex flex-col items-start mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {community.title}
        </h3>
        <p className="text-md text-gray-600 mb-4">
          <span className="font-bold mr-1">호스트:</span>
          {community.hostName}
        </p>
        <hr className="border-t border-gray-300 w-full mb-4" />
        <p className="text-gray-700 text-lg font-light leading-relaxed">
          {community.description}
        </p>
      </div>

      {/* 카드 하단 내용 (인원 정보 및 신청 상태/버튼) */}
      <div className="flex justify-between items-center mt-auto">
        {/* 인원 정보 (모집 중인 경우에만 의미 있으므로 선택 사항) */}
        {community.currentMembers !== undefined &&
          community.maxMembers !== undefined && (
            <div className="flex items-center text-gray-600 text-base">
              <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
              <span>
                {community.currentMembers}/{community.maxMembers}명
              </span>
            </div>
          )}

        {/* ✨ 신청 상태 및 신청 취소 버튼 ✨ */}
        <div className="flex items-center space-x-2">
          {" "}
          {/* 상태와 버튼을 함께 묶음 */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}
          >
            {statusText}
          </span>
          {/* ✨ 신청 대기 중일 때만 '신청 취소' 버튼 렌더링 ✨ */}
          {community.status === "pending" && (
            <Button
              onClick={() => onCancelApplication(community.id)}
              bgColor="bg-red-400"
              hoverBgColor="hover:bg-red-500"
              className="text-sm rounded-md"
            >
              신청 취소
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppliedCommunityCard;
