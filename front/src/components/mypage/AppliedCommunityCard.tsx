// src/components/mypage/AppliedCommunityCard.tsx

import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";
import { type AppliedCommunity } from "../../types";

interface AppliedCommunityCardProps {
  community: AppliedCommunity;
  onCancelApplication: (communityId: string) => void;
}

const AppliedCommunityCard: React.FC<AppliedCommunityCardProps> = ({
  community,
  onCancelApplication,
}) => {
  const statusColorClass = {
    pending: "text-blue-600 bg-blue-100",
    accepted: "text-green-600 bg-green-100",
    rejected: "text-red-600 bg-red-100",
  }[community.myApplicationStatus];

  const statusText = {
    pending: "신청 대기 중",
    accepted: "신청 수락됨",
    rejected: "신청 거절됨",
  }[community.myApplicationStatus];

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      <div className="flex flex-col items-start mb-14">
        <div className="flex items-center justify-between w-full">
          <div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {community.title}
              </h3>
            </div>
            <p className="text-md text-gray-600 mb-4">
              <span className="font-medium mr-1">호스트: </span>
              {community.hostName}
            </p>
          </div>

          {community.currentMembers !== undefined &&
            community.maxMembers !== undefined && (
              <div className="flex items-center text-gray-600 text-base">
                <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
                <span>
                  {community.currentMembers}/{community.maxMembers}명
                </span>
              </div>
            )}
        </div>
        <hr className="border-t border-gray-300 w-full mb-4" />
        <div>
          <p className="text-gray-700 text-md font-light leading-relaxed">
            {community.description}
          </p>
        </div>
      </div>

      <div className="flex justify-end items-center mt-auto">
        <div className="flex items-end space-x-2">
          {/* ✨ 신청 취소 버튼을 나의 신청 상태(myApplicationStatus)가 'pending'일 때만 표시하도록 변경 ✨ */}
          {community.myApplicationStatus === "pending" && (
            <Button
              onClick={() => onCancelApplication(community.id)}
              bgColor="bg-red-400"
              hoverBgColor="hover:bg-red-500"
              className="text-xs rounded-md px-3 py-0 mr-3"
            >
              신청 취소
            </Button>
          )}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppliedCommunityCard;
