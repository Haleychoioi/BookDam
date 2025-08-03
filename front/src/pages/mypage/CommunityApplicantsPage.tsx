// src/pages/mypage/CommunityApplicantsPage.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import ApplicantCard from "../../components/mypage/ApplicantCard";
import CommunityHistoryModal from "../../components/modals/CommunityHistoryModal";
import type { ApplicantWithStatus, CommunityHistoryEntry } from "../../types";
import {
  fetchApplicantsByCommunity,
  updateApplicationStatus,
} from "../../api/communities";
// ✨ fetchCommunityHistory 임포트 ✨
import { fetchCommunityHistory } from "../../api/mypage";
import { FaChevronLeft } from "react-icons/fa";

const CommunityApplicationsPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();

  const [applicants, setApplicants] = useState<ApplicantWithStatus[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [errorApplicants, setErrorApplicants] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantNickname, setSelectedApplicantNickname] = useState<
    string | null
  >(null);
  const [historyData, setHistoryData] = useState<CommunityHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  // 1. 특정 커뮤니티의 신청자 목록 불러오기 (communityId 사용)
  const loadApplicants = useCallback(async () => {
    setLoadingApplicants(true);
    setErrorApplicants(null);
    try {
      if (!communityId) {
        setErrorApplicants("커뮤니티 ID가 없습니다.");
        return;
      }
      const response = await fetchApplicantsByCommunity(communityId);
      setApplicants(response.applicants);
    } catch (err) {
      setErrorApplicants(
        err instanceof Error
          ? err.message
          : "신청자 목록을 불러는데 실패했습니다."
      );
    } finally {
      setLoadingApplicants(false);
    }
  }, [communityId]); // communityId를 의존성으로 추가

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  // 2. 신청자의 커뮤니티 참여 이력 불러오기 (모달 열릴 때)
  const handleViewHistory = useCallback(
    async (applicantId: string, nickname: string) => {
      setSelectedApplicantNickname(nickname);
      setIsModalOpen(true);

      setLoadingHistory(true);
      setErrorHistory(null);
      setHistoryData([]);

      try {
        // ✨ 실제 API 호출: 신청자의 커뮤니티 참여 이력 ✨
        // applicantId는 신청서 ID (string)입니다.
        // 백엔드는 사용자 ID(userId)로 이력을 조회하므로, 신청자 객체에서 userId를 찾아야 합니다.
        const applicant = applicants.find((app) => app.id === applicantId);
        if (!applicant) {
          throw new Error("신청자 정보를 찾을 수 없습니다.");
        }
        const history = await fetchCommunityHistory(
          applicant.userId.toString()
        ); // ✨ userId를 string으로 변환하여 전달 ✨
        setHistoryData(history);
      } catch (err) {
        setErrorHistory(
          err instanceof Error ? err.message : "이력을 불러오는데 실패했습니다."
        );
      } finally {
        setLoadingHistory(false);
      }
    },
    [applicants]
  ); // applicants 배열이 변경될 때 useCallback 재생성

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicantNickname(null);
    setHistoryData([]);
  };

  const handleAcceptReject = useCallback(
    async (applicantId: string, status: "accepted" | "rejected") => {
      console.log(`신청자 ${applicantId} ${status} 요청`);
      try {
        if (!communityId) {
          alert("커뮤니티 ID가 유효하지 않습니다.");
          return;
        }

        const applicant = applicants.find((app) => app.id === applicantId);

        if (!applicant) {
          alert("신청자 정보를 찾을 수 없습니다.");
          return;
        }

        await updateApplicationStatus(
          communityId,
          applicant.userId.toString(),
          status.toUpperCase() as "ACCEPTED" | "REJECTED"
        );
        alert(
          `신청자 ${applicant.nickname}님의 요청이 ${
            status === "accepted" ? "수락" : "거절"
          }되었습니다.`
        );
        loadApplicants();
      } catch (error) {
        console.error("신청 처리 중 오류 발생:", error);
        alert("신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
    [communityId, applicants, loadApplicants] // 의존성 배열에 applicants 추가
  );

  if (loadingApplicants) {
    return (
      <div className="text-center py-12">신청자 목록을 불러오는 중...</div>
    );
  }

  if (errorApplicants) {
    return (
      <div className="text-center py-12 text-red-500">
        오류: {errorApplicants}
      </div>
    );
  }

  const actualApplicants = applicants || []; // applicants는 useQuery의 data이므로, 그대로 사용

  return (
    <div className="p-6">
      <Link
        to="/mypage/communities/recruiting"
        className="text-gray-600 hover:text-gray-800 flex items-center mb-8"
      >
        <div className="flex items-center">
          <FaChevronLeft className="w-4 h-4 text-gray-700 mr-1 mb-1" />
          <span>내가 모집 중인 커뮤니티로 돌아가기</span>
        </div>
      </Link>

      <MyPageHeader
        title="커뮤니티 신청 내역"
        description={`'${communityId}' 커뮤니티에 신청한 사용자 목록입니다.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {applicants.length > 0 ? ( // ✨ applicants.length로 조건 확인 (실제 배열) ✨
          actualApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onViewHistory={handleViewHistory}
              onAcceptReject={handleAcceptReject}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            아직 신청자가 없습니다.
          </p>
        )}
      </div>

      <CommunityHistoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        applicantNickname={selectedApplicantNickname || ""}
        history={historyData}
        loading={loadingHistory}
        error={errorHistory}
      />
    </div>
  );
};

export default CommunityApplicationsPage;
