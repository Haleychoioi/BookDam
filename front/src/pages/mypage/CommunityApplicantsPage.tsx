// src/pages/mypage/CommunityApplicantsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import ApplicantCard from "../../components/mypage/ApplicantCard";
import CommunityHistoryModal from "../../components/modals/CommunityHistoryModal";
import type { ApplicantWithStatus, CommunityHistoryEntry } from "../../types";
import {
  fetchApplicantsByCommunity, // API 함수 임포트
  updateApplicationStatus, // API 함수 임포트
} from "../../api/communities";

// 더미 데이터 삭제
// const dummyApplicants: ApplicantWithStatus[] = [...];

const dummyHistoryData: { [key: string]: CommunityHistoryEntry[] } = {
  "app-1": [
    {
      communityName: "고전 문학 연구회",
      role: "member",
      startDate: "2023-01-01",
      endDate: "2023-06-30",
      status: "활동종료",
    },
    {
      communityName: "SF 소설 클럽",
      role: "member",
      startDate: "2023-07-15",
      endDate: undefined,
      status: "활동중",
    },
  ],
  "app-2": [
    {
      communityName: "자기계발 독서 모임",
      role: "member",
      startDate: "2024-03-01",
      endDate: undefined,
      status: "활동중",
    },
  ],
  "app-3": [
    {
      communityName: "인문학 토론방",
      role: "host",
      startDate: "2022-10-01",
      endDate: "2023-09-30",
      status: "활동종료",
    },
    {
      communityName: "시 읽는 밤",
      role: "member",
      startDate: "2024-01-01",
      endDate: undefined,
      status: "활동중",
    },
  ],
  "app-4": [],
  "app-5": [
    {
      communityName: "철학 스터디",
      role: "member",
      startDate: "2023-11-01",
      endDate: undefined,
      status: "활동중",
    },
  ],
};

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
  // loadApplicants 함수를 useCallback으로 감싸고 의존성 배열에 communityId를 추가합니다.
  const loadApplicants = useCallback(async () => {
    setLoadingApplicants(true);
    setErrorApplicants(null);
    try {
      if (!communityId) {
        setErrorApplicants("커뮤니티 ID가 없습니다.");
        return;
      }
      const response = await fetchApplicantsByCommunity(communityId); // 실제 API 호출
      setApplicants(response.applicants);
    } catch (err) {
      setErrorApplicants(
        err instanceof Error
          ? err.message
          : "신청자 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoadingApplicants(false);
    }
  }, [communityId]); // communityId를 의존성으로 추가

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]); // 이제 loadApplicants 자체만 의존성으로 가집니다.
  // 2. 신청자의 커뮤니티 참여 이력 불러오기 (모달 열릴 때)
  const handleViewHistory = async (applicantId: string, nickname: string) => {
    setSelectedApplicantNickname(nickname);
    setIsModalOpen(true);

    setLoadingHistory(true);
    setErrorHistory(null);
    setHistoryData([]);

    try {
      // TODO: 실제 API 호출: 신청자의 커뮤니티 참여 이력 (현재 백엔드 명세서에 직접적인 API 없음. 추후 필요시 추가)
      // 현재는 더미 데이터 사용.
      const history = dummyHistoryData[applicantId] || [];
      setHistoryData(history);
    } catch (err) {
      setErrorHistory(
        err instanceof Error ? err.message : "이력을 불러오는데 실패했습니다."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicantNickname(null);
    setHistoryData([]);
  };

  // ✨ 신청 수락/거절 핸들러 ✨
  const handleAcceptReject = async (
    applicantId: string, // 이는 프론트엔드에서 사용하는 ID (applicationId.toString())
    status: "accepted" | "rejected"
  ) => {
    console.log(`신청자 ${applicantId} ${status} 요청`);
    try {
      if (!communityId) {
        alert("커뮤니티 ID가 유효하지 않습니다.");
        return;
      }

      // API 명세서에 따르면 userId로 요청해야 하므로, applicant 객체에서 userId를 찾아 사용해야 합니다.
      // dummyApplicants는 userId가 없으므로 임의로 찾습니다. 실제 데이터에서는 applicant.userId를 사용하세요.
      const applicant = applicants.find((app) => app.id === applicantId);

      if (!applicant) {
        alert("신청자 정보를 찾을 수 없습니다.");
        return;
      }

      await updateApplicationStatus(
        communityId,
        applicant.userId.toString(), // 백엔드는 userId를 path parameter로 받음.
        status.toUpperCase() as "ACCEPTED" | "REJECTED" // 백엔드는 대문자 상태를 기대.
      );
      alert(
        `신청자 ${applicant.nickname}님의 요청이 ${
          status === "accepted" ? "수락" : "거절"
        }되었습니다.`
      );
      loadApplicants(); // 성공 시 목록 새로고침
    } catch (error) {
      console.error("신청 처리 중 오류 발생:", error);
      alert("신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

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

  return (
    <div className="p-6">
      <MyPageHeader
        title="커뮤니티 신청 내역"
        description={`'${communityId}' 커뮤니티에 신청한 사용자 목록입니다.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {applicants.length > 0 ? (
          applicants.map((applicant) => (
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
