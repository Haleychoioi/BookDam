import React from "react"; // React 임포트 유지
import Button from "../common/Button";
import { Link } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa"; // 인원 아이콘 임포트 유지

interface CommunityCardProps {
  community: {
    id: string;
    bookTitle: string;
    hostNickname: string;
    description: string; // 커뮤니티 간단 소개
    currentMembers: number;
    maxMembers: number;
    role: "host" | "member";
  };

  onLeaveOrDelete: (communityId: string, role: "host" | "member") => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,

  onLeaveOrDelete,
}) => {
  const isHost = community.role === "host";

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      <div className="flex flex-col items-start mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {community.bookTitle}
        </h3>
        <p className="text-md text-gray-600 mb-4">
          {isHost && <span className="font-medium mr-1">호스트: </span>}
          {community.hostNickname}
        </p>
        <hr className="border-t border-gray-300 w-full mb-4" />
        <p className="text-gray-700 text-lg font-light leading-relaxed">
          {community.description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center text-gray-600 text-base">
          <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
          <span>
            {community.currentMembers}/{community.maxMembers}명
          </span>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/communities/${community.id}/posts`} // 해당 커뮤니티의 게시판으로 이동 [cite: 1]
          >
            <Button
              bgColor="bg-main" // main 컬러
              textColor="text-white"
              hoverBgColor="hover:bg-apply" // apply 컬러
              className="w-full px-3 py-2 text-sm flex-1" // Button 내부에서 width 100% 설정
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              게시판 가기
            </Button>
          </Link>

          <Button
            onClick={(e) => {
              e.preventDefault();

              onLeaveOrDelete(community.id, community.role);
            }}
            bgColor="bg-gray-300"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-400"
            className="flex-1 px-3 py-2 text-sm"
          >
            {isHost ? "삭제" : "나가기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
