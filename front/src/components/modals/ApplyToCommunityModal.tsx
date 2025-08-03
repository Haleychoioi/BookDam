// src/components/modals/ApplyToCommunityModal.tsx

import { useState, useEffect } from "react";
import Button from "../common/Button";
import axios from "axios";
import { applyToCommunity } from "../../api/communities";
import { useQueryClient } from "@tanstack/react-query";

interface ApplyToCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  onError: (message: string) => void; // ✨ onError 콜백 추가 ✨
}

const ApplyToCommunityModal: React.FC<ApplyToCommunityModalProps> = ({
  isOpen,
  onClose,
  communityId,
  onError, // ✨ onError prop 받기 ✨
}) => {
  const [applicationMessage, setApplicationMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isApplicationSuccessful, setIsApplicationSuccessful] = useState(false);
  const queryClient = useQueryClient();

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setApplicationMessage("");
      setError(null);
      setIsApplicationSuccessful(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    if (applicationMessage.trim().length < 3) {
      onError("신청 메시지를 3글자 이상 입력해주세요.");
      onClose();
      return;
    }

    if (applicationMessage.trim() === "") {
      onError("신청 메시지를 입력해주세요.");
      onClose();
      return;
    }

    console.log(
      `ApplyToCommunityModal: 커뮤니티 ${communityId}에 메시지 '${applicationMessage}'로 신청.`
    );

    try {
      await applyToCommunity(communityId, applicationMessage);

      setIsApplicationSuccessful(true);
      alert(`커뮤니티에 신청이 완료되었습니다!`);

      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["bookDetailPageData"] });
      queryClient.invalidateQueries({ queryKey: ["myCommunitiesApplied"] });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: unknown) {
      console.error("커뮤니티 신청 중 오류 발생:", error);
      let errorMessage =
        "커뮤니티 신청 중 오류가 발생했습니다. 다시 시도해주세요.";

      if (axios.isAxiosError(error) && error.response) {
        if (
          error.response.data.message ===
          "This community is not currently recruiting."
        ) {
          errorMessage = "현재 모집 중이 아닌 커뮤니티입니다.";
        } else if (
          error.response.data.message ===
          "You have already applied to this community."
        ) {
          errorMessage = "이미 해당 커뮤니티에 신청하셨습니다.";
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      // 오류 발생 시 모달을 닫지 않음. 사용자가 오류 메시지를 확인할 수 있도록.
    } finally {
      setApplicationMessage("");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        {isApplicationSuccessful ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              신청 완료!
            </h2>
            <p className="text-gray-700">
              커뮤니티 신청이 성공적으로 처리되었습니다.
            </p>
            <Button
              onClick={onClose}
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="font-normal mt-6"
            >
              닫기
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              커뮤니티 가입 신청
            </h2>
            <p className="font-light ml-6 mb-6">
              새로운 독서 여정, 지금 이 커뮤니티와 함께 시작해보세요.
            </p>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">오류: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

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
                onClick={handleSubmit}
                bgColor="bg-main"
                textColor="text-white"
                hoverBgColor="hover:bg-apply"
                className="font-normal"
                disabled={isApplicationSuccessful}
              >
                {isApplicationSuccessful ? "신청 완료" : "신청하기"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplyToCommunityModal;
