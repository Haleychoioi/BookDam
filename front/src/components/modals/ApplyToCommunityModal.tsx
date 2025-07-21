import React, { useState } from "react";
import Button from "../common/Button"; // 기존 Button 컴포넌트 활용

interface ApplyToCommunityModalProps {
  isOpen: boolean; // 모달 열림/닫힘 상태
  onClose: () => void; // 모달 닫기 함수
  communityId: string; // 신청할 커뮤니티의 ID
}

const ApplyToCommunityModal: React.FC<ApplyToCommunityModalProps> = ({
  isOpen,
  onClose,
  communityId,
}) => {
  const [applicationMessage, setApplicationMessage] = useState("");

  if (!isOpen) return null; // isOpen이 false면 아무것도 렌더링하지 않음

  const handleSubmit = async () => {
    // ✨ async 키워드 추가 ✨
    // 입력 글자 수 3글자 미만일 경우 유효성 검사 추가
    if (applicationMessage.trim().length < 3) {
      alert("신청 메시지를 3글자 이상 입력해주세요.");
      return;
    }

    // 신청 메시지가 비어있지 않은지 간단한 유효성 검사
    if (applicationMessage.trim() === "") {
      alert("신청 메시지를 입력해주세요.");
      return;
    }

    console.log(
      `ApplyToCommunityModal: 커뮤니티 ${communityId}에 메시지 '${applicationMessage}'로 신청.`
    ); // ✨ 로그를 모달 내부로 이동 ✨

    // ✨ Mock API 호출 로직을 모달 내부로 이동 ✨
    try {
      // 실제 API 호출: POST /communities/:id/apply
      // currentUserId는 로그인 상태에서 가져와야 함
      // 예시: await applyToCommunity(communityId, applicationMessage, currentUserId);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연 시뮬레이션

      if (Math.random() > 0.1) {
        // 90% 성공
        alert(`커뮤니티 '${communityId}'에 신청이 완료되었습니다!`);
        // 성공 후 필요한 추가 로직 (예: 신청한 커뮤니티 목록 새로고침 등)
      } else {
        alert("커뮤니티 신청에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("커뮤니티 신청 중 오류 발생:", error);
      alert("커뮤니티 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setApplicationMessage(""); // 입력 필드 초기화
      onClose(); // 신청 처리 후 모달 닫기
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          커뮤니티 가입 신청
        </h2>
        <p className="font-light ml-6 mb-6">
          새로운 독서 여정, 지금 이 커뮤니티와 함께 시작해보세요.
        </p>

        <div className="mb-6">
          <label
            htmlFor="applicationMessage"
            className="block text-gray-700 text-md font-medium mb-2"
          >
            간단 소개
          </label>
          <textarea
            id="applicationMessage"
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 resize-none font-light"
            rows={5}
            placeholder="예시: 안녕하세요! 이 책을 너무 좋아해서 함께 토론하고 싶어 신청합니다."
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            bgColor="bg-gray-300"
            textColor="text-white"
            hoverBgColor="hover:bg-gray-400"
            className="font-normal"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            bgColor="bg-main"
            textColor="text-white"
            hoverBgColor="hover:bg-apply"
            className="font-normal"
          >
            신청하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplyToCommunityModal;
