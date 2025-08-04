// src/components/mypage/RecruitingCommunityCard.tsx

import React from "react";
import Button from "../common/Button";
import type { Community } from "../../types";
import { FaUserFriends } from "react-icons/fa";
import { Link } from "react-router-dom";

interface RecruitingCommunityCardProps {
  community: Community & {
    pendingApplicantCount?: number;
  };
  onEndRecruitment: (communityId: string) => void;
  onEditCommunity: (community: Community) => void;
}

const RecruitingCommunityCard: React.FC<RecruitingCommunityCardProps> = ({
  community,
  onEndRecruitment,
  onEditCommunity,
}) => {
  const showRecruitingButtons = community.status === "모집중";

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between ">
      {/* 상단 정보 섹션 시작 */}
      <div className="flex-grow flex flex-col items-start mb-auto">
        {/* 제목, 호스트 정보 */}
        <div className="flex items-center justify-between w-full mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
              {community.title}
            </h3>
            <p className="text-md text-gray-600 mb-0">
              <span className="font-medium mr-1">호스트: </span>
              {community.hostName}
            </p>
          </div>
          {/* 멤버 수 표시 */}
          <div className="flex items-center text-gray-600 text-sm">
            <FaUserFriends className="w-4 h-4 mr-1 text-gray-500" />
            <span>
              {community.currentMembers}/{community.maxMembers}명
            </span>
          </div>
        </div>

        {/* 구분선 추가 */}
        <hr className="border-t border-gray-300 w-full mb-4" />

        {/* 설명 */}
        <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-4">
          {community.description}
        </p>

        {/* 대기 신청자 수 (모집 중일 때만 표시) */}
        {showRecruitingButtons &&
          community.pendingApplicantCount !== undefined && (
            <div className="flex items-center text-gray-700 text-sm mb-4">
              <span className="font-semibold mr-1">대기 신청자:</span>
              <span className="text-blue-600 font-bold">
                {community.pendingApplicantCount}명
              </span>
            </div>
          )}
      </div>{" "}
      {/* 상단 정보 섹션 끝 */}
      {/* 하단 버튼 섹션 시작 */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 justify-end items-center">
          {/* 상태 표시 뱃지 */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              community.status === "모집중"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {community.status}
          </span>

          {/* '신청자 목록 보기' 버튼 */}
          {showRecruitingButtons && (
            <Link
              to={`/mypage/communities/recruiting/${community.id}/applicants`}
            >
              <Button
                // ✨ 이 Button 컴포넌트의 속성 구문을 정확히 다시 확인했습니다. ✨
                bgColor="bg-main"
                textColor="text-white"
                hoverBgColor="hover:bg-apply"
                className="px-3 py-2 text-xs font-normal"
              >
                신청자 보기
              </Button>
            </Link>
          )}

          {/* '수정' 버튼 - 모집중일 때만 표시 */}
          {community.status === "모집중" && (
            <Button
              onClick={() => onEditCommunity(community)}
              bgColor="bg-gray-300"
              textColor="text-gray-800"
              hoverBgColor="hover:bg-gray-400"
              className="px-3 py-2 text-xs font-normal"
            >
              수정
            </Button>
          )}

          {/* '모집 종료' 버튼 */}
          {showRecruitingButtons && (
            <Button
              onClick={() => onEndRecruitment(community.id)}
              bgColor="bg-red-400"
              textColor="text-white"
              hoverBgColor="hover:bg-red-500"
              className="px-3 py-2 text-xs font-normal"
            >
              모집 종료
            </Button>
          )}
        </div>
      </div>{" "}
      {/* 하단 버튼 섹션 끝 */}
    </div>
  );
};

export default RecruitingCommunityList;
