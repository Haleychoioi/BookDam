import React from "react";
import { type CommunityHistoryEntry } from "../../types";
// import Modal from "../common/Modal"; // ✨ Modal 컴포넌트 임포트 제거 ✨
import Button from "../common/Button"; // Button 컴포넌트 임포트

interface CommunityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantNickname: string;
  history: CommunityHistoryEntry[];
  loading: boolean;
  error: string | null;
}

const CommunityHistoryModal: React.FC<CommunityHistoryModalProps> = ({
  isOpen,
  onClose,
  applicantNickname,
  history,
  loading,
  error,
}) => {
  if (!isOpen) return null; // 모달이 열려있지 않으면 아무것도 렌더링하지 않음

  return (
    // ✨ ApplyToCommunityModal과 동일한 모달 배경 및 컨테이너 구조 ✨
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto relative">
        {/* 모달 제목 부분 */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
          {" "}
          {/* ApplyToCommunityModal의 제목 스타일과 유사하게 */}
          참여 이력
        </h2>
        {/* 이미지와 유사한 부제목/설명 */}
        <p className="font-light text-md text-gray-600 mb-6 text-center">
          {applicantNickname} 님의 커뮤니티 참여 이력입니다.
        </p>

        {/* 모달 내용 부분 */}
        {loading ? (
          <p className="text-center py-4 text-gray-600">
            이력을 불러오는 중...
          </p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">오류: {error}</p>
        ) : history.length === 0 ? (
          <p className="text-center py-4 text-gray-600">
            참여 이력이 없습니다.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
            {" "}
            {/* 스크롤 가능하도록, 하단 버튼과의 간격 확보 */}
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-md p-4 border border-gray-200"
              >
                <h5 className="font-semibold text-lg text-gray-800">
                  {entry.communityName}
                </h5>
                <p className="text-sm text-gray-600">역할: {entry.role}</p>
                <p className="text-sm text-gray-600">
                  기간: {entry.startDate} ~{" "}
                  {entry.endDate ? entry.endDate : "현재 활동중"}
                </p>
                <p
                  className={`text-sm font-medium ${
                    entry.status === "활동중"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  상태: {entry.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 닫기 버튼 (ApplyToCommunityModal의 버튼과 유사한 스타일) */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={onClose}
            bgColor="bg-main" // 이미지와 유사한 노란색 계열
            textColor="text-white"
            hoverBgColor="hover:bg-apply" // 이미지와 유사한 노란색 계열
            className="font-normal px-6 py-3 rounded-md" // 이미지에 맞춰 패딩, 폰트, 둥근 모서리 조정
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityHistoryModal;
