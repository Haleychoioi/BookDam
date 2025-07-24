import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MyPageHeader from "../../components/mypage/MyPageHeader";
import ApplicantCard from "../../components/mypage/ApplicantCard";
import CommunityHistoryModal from "../../components/modals/CommunityHistoryModal";
import type { ApplicantWithStatus, CommunityHistoryEntry } from "../../types";

const dummyApplicants: ApplicantWithStatus[] = [
  {
    id: "app-1",
    nickname: "독서광123",
    appliedAt: "2024-07-20T10:00:00Z",
    applicationMessage: "안녕하세요! 고전 문학에 관심이 많아 신청합니다.",
    status: "pending",
  },
  {
    id: "app-2",
    nickname: "책벌레김",
    appliedAt: "2024-07-21T11:30:00Z",
    applicationMessage: "헤밍웨이 작품을 좋아합니다. 열심히 참여하겠습니다.",
    status: "pending",
  },
  {
    id: "app-3",
    nickname: "지식탐험가",
    appliedAt: "2024-07-22T09:15:00Z",
    applicationMessage: "이 분야에 대한 깊은 토론을 기대합니다.",
    status: "pending",
  },
  {
    id: "app-4",
    nickname: "글귀수집가",
    appliedAt: "2024-07-22T14:45:00Z",
    applicationMessage: "따뜻한 커뮤니티 분위기를 찾아왔습니다.",
    status: "pending",
  },
  {
    id: "app-5",
    nickname: "책사랑꾼",
    appliedAt: "2024-07-23T08:00:00Z",
    applicationMessage: "함께 성장하고 싶습니다. 잘 부탁드립니다.",
    status: "pending",
  },
];

// Mock Data: 신청자별 커뮤니티 참여 이력
const dummyHistoryData: { [key: string]: CommunityHistoryEntry[] } = {
  "app-1": [
    {
      communityName: "고전 문학 연구회",
      role: "member", // role 타입을 "host" | "member"로 통일
      startDate: "2023-01-01",
      endDate: "2023-06-30",
      status: "활동종료", // status 타입을 "활동중" | "활동종료"로 통일
    },
    {
      communityName: "SF 소설 클럽",
      role: "member",
      startDate: "2023-07-15",
      endDate: undefined, // ✨ null 대신 undefined 사용 ✨
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
  "app-4": [], // 이력 없음
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

  // ✨ applicants 상태 타입을 ApplicantWithStatus[]로 변경 ✨
  const [applicants, setApplicants] = useState<ApplicantWithStatus[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [errorApplicants, setErrorApplicants] = useState<string | null>(null);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantNickname, setSelectedApplicantNickname] = useState<
    string | null
  >(null);
  const [historyData, setHistoryData] = useState<CommunityHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  // 1. 특정 커뮤니티의 신청자 목록 불러오기 (communityId 사용)
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoadingApplicants(true);
      setErrorApplicants(null);
      try {
        console.log(`Fetching applicants for community: ${communityId}`);
        setApplicants(dummyApplicants); // 더미 데이터 로드
      } catch (err) {
        setErrorApplicants(
          err instanceof Error
            ? err.message
            : "신청자 목록을 불러오는데 실패했습니다."
        );
      } finally {
        setLoadingApplicants(false);
      }
    };

    if (communityId) {
      fetchApplicants();
    }
  }, [communityId]);

  // 2. 신청자의 커뮤니티 참여 이력 불러오기 (모달 열릴 때)
  const handleViewHistory = async (applicantId: string, nickname: string) => {
    setSelectedApplicantNickname(nickname);
    setIsModalOpen(true);

    setLoadingHistory(true);
    setErrorHistory(null);
    setHistoryData([]);

    try {
      console.log(`Fetching history for applicant: ${applicantId}`);
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
    applicantId: string,
    status: "accepted" | "rejected"
  ) => {
    console.log(`신청자 ${applicantId} ${status} 요청`);
    try {
      // TODO: 실제 API 호출: PUT /mypage/communities/recruiting/:communityId/applicants/:userId
      // 요청 바디: { status: status }
      // const response = await fetch(`/mypage/communities/recruiting/${communityId}/applicants/${applicantId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status }),
      // });
      // if (response.ok) {
      alert(
        `신청자 ${applicantId}의 요청이 ${
          status === "accepted" ? "수락" : "거절"
        }되었습니다.`
      );
      // Mock Data 업데이트: 신청자의 상태를 변경
      setApplicants((prevApplicants) =>
        prevApplicants.filter((app) => app.id !== applicantId)
      );
      // } else {
      //   const errorData = await response.json();
      //   alert(`처리 실패: ${errorData.message}`);
      // }
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
              onAcceptReject={handleAcceptReject} // ✨ onAcceptReject prop 전달 ✨
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-10">
            아직 신청자가 없습니다.
          </p>
        )}
      </div>

      {/* 커뮤니티 참여 이력 모달 */}
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
