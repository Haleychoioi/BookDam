// src/api/communities.ts

import apiClient from "./apiClient";
import type { Community, AppliedCommunity } from "../types"; // AppliedCommunity 임포트 유지

// 백엔드에서 반환하는 TeamCommunity 스키마의 타입 (Prisma 모델 기반)
interface BackendTeamCommunity {
  teamId: number;
  postId: number; // 관련 Post의 ID
  isbn13: string | null;
  status: "RECRUITING" | "ACTIVE" | "COMPLETED" | "CLOSED"; // 백엔드 Enum
  postTitle: string; // 커뮤니티 제목 (모집글 제목)
  postContent: string; // 커뮤니티 설명 (모집글 내용)
  postAuthor: string; // 커뮤니티 생성자 닉네임 (모집글 작성자)
  createdAt: string;
  updatedAt: string;
  // 참고: currentMembers, maxMembers, role은 이 엔드포인트에서 직접 제공되지 않음
}

/**
 * 백엔드 TeamCommunity 응답을 프론트엔드 Community 타입으로 매핑합니다.
 * 백엔드 API에서 직접 제공하지 않는 필드(예: currentMembers, maxMembers)에 기본값을 할당합니다.
 * @param backendCommunity - 백엔드에서 받은 TeamCommunity 객체
 * @returns 프론트엔드 Community 객체
 */
const mapBackendCommunityToFrontendCommunity = (
  backendCommunity: BackendTeamCommunity
): Community => {
  return {
    id: backendCommunity.teamId.toString(), // teamId를 id로 매핑
    title: backendCommunity.postTitle, // postTitle을 title로 매핑
    description: backendCommunity.postContent, // postContent를 description으로 매핑
    hostName: backendCommunity.postAuthor, // postAuthor를 hostName으로 매핑
    currentMembers: 0, // ✨ 백엔드에서 현재 멤버 수를 직접 제공하지 않으므로 임시 0으로 설정 ✨
    maxMembers: 0, // ✨ 백엔드에서 최대 멤버 수를 직접 제공하지 않으므로 임시 0으로 설정 ✨
    // role은 이 목록 API에서 특정 사용자의 역할을 알 수 없으므로, 기본값 'member' 또는 'host' (로그인된 사용자가 호스트인지 확인하는 로직 필요)
    role: "member",
    status: backendCommunity.status === "RECRUITING" ? "모집중" : "모집종료", // 백엔드 상태를 프론트엔드 상태로 매핑
  };
};

// =========================================================
// 1. 커뮤니티 목록 및 상세 조회
// =========================================================

/**
 * 모든 커뮤니티 목록을 조회합니다.
 * GET /api/communities
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @returns 커뮤니티 목록 배열 및 총 결과 수
 */
export const fetchCommunities = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest"
): Promise<{ communities: Community[]; totalResults: number }> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: BackendTeamCommunity[]; // 백엔드 응답 타입 명확화
    }>(`/communities?page=${page}&pageSize=${pageSize}&sort=${sort}`);

    const mappedCommunities = response.data.data.map(
      mapBackendCommunityToFrontendCommunity
    );

    return {
      communities: mappedCommunities,
      totalResults: mappedCommunities.length, // 현재는 응답 개수를 총 결과로 사용 (백엔드 totalResults 필요)
    };
  } catch (error) {
    console.error("Failed to fetch communities:", error);
    throw error;
  }
};

/**
 * 특정 도서 관련 커뮤니티 목록을 조회합니다.
 * GET /api/communities/books/:itemId
 * @param itemId - 도서 ISBN13
 * @param size - 조회할 커뮤니티 수 (기본값: 10)
 * @returns 커뮤니티 목록 배열
 */
export const fetchCommunitiesByBook = async (
  itemId: string,
  size: number = 10
): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: BackendTeamCommunity[]; // 백엔드 응답 타입 명확화
    }>(`/communities/books/${itemId}?size=${size}`);
    return response.data.data.map(mapBackendCommunityToFrontendCommunity); // 매핑 함수 사용
  } catch (error) {
    console.error("Failed to fetch communities by book:", error);
    throw error;
  }
};

/**
 * 특정 커뮤니티 상세 정보를 조회합니다.
 * GET /api/communities/:communityId
 * @param communityId - 커뮤니티 ID
 * @returns Community 객체
 */
export const fetchCommunityById = async (
  communityId: string
): Promise<Community> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: BackendTeamCommunity; // 단일 객체
    }>(`/communities/${communityId}`);
    return mapBackendCommunityToFrontendCommunity(response.data.data); // 단일 객체 매핑
  } catch (error) {
    console.error("Failed to fetch community by ID:", error);
    throw error;
  }
};

// =========================================================
// 2. 커뮤니티 생성 및 관리 (팀장용)
// =========================================================

/**
 * 새로운 도서 기반 커뮤니티를 생성합니다.
 * POST /api/communities
 * @param communityData - 생성할 커뮤니티 데이터
 * @returns 생성된 커뮤니티 ID
 */
export const createCommunity = async (communityData: {
  bookIsbn13?: string;
  title: string;
  content: string; // 백엔드에서는 `description` 대신 `content`를 받음
  maxMembers: number;
}): Promise<string> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      communityId: number;
    }>(`/communities`, communityData);
    return response.data.communityId.toString(); // ID를 string으로 반환
  } catch (error) {
    console.error("Failed to create community:", error);
    throw error;
  }
};

/**
 * 특정 커뮤니티 상세 정보를 업데이트합니다 (recruiting, title, content, maxMembers 등).
 * PUT /api/communities/:communityId
 * @param communityId - 업데이트할 커뮤니티 ID
 * @param updateData - 업데이트할 데이터
 * @returns 업데이트된 Community 객체
 */
export const updateCommunityDetails = async (
  communityId: string,
  updateData: {
    title?: string;
    content?: string;
    maxMembers?: number;
    recruiting?: boolean; // 모집 여부
  }
): Promise<Community> => {
  try {
    const response = await apiClient.put<{
      message: string;
      data: BackendTeamCommunity;
    }>(`/communities/${communityId}`, updateData);
    return mapBackendCommunityToFrontendCommunity(response.data.data); // 업데이트된 단일 객체 매핑
  } catch (error) {
    console.error("Failed to update community details:", error);
    throw error;
  }
};

/**
 * 커뮤니티 상태를 업데이트합니다.
 * PUT /api/communities/:communityId/status
 * @param communityId - 업데이트할 커뮤니티 ID
 * @param newStatus - 변경할 새로운 상태 ("RECRUITING" | "ACTIVE" | "COMPLETED" | "CLOSED")
 * @returns 업데이트된 Community 객체
 */
export const updateCommunityStatus = async (
  communityId: string,
  newStatus: "RECRUITING" | "ACTIVE" | "COMPLETED" | "CLOSED"
): Promise<Community> => {
  try {
    const response = await apiClient.put<{
      message: string;
      data: BackendTeamCommunity;
    }>(`/communities/${communityId}/status`, { newStatus });
    return mapBackendCommunityToFrontendCommunity(response.data.data); // 업데이트된 단일 객체 매핑
  } catch (error) {
    console.error("Failed to update community status:", error);
    throw error;
  }
};

/**
 * 특정 커뮤니티를 삭제합니다 (팀장만 가능).
 * DELETE /api/communities/:communityId
 * @param communityId - 삭제할 커뮤니티 ID
 */
export const deleteCommunity = async (communityId: string): Promise<void> => {
  try {
    await apiClient.delete(`/communities/${communityId}`);
  } catch (error) {
    console.error("Failed to delete community:", error);
    throw error;
  }
};

// =========================================================
// 3. 커뮤니티 가입 신청 및 신청자 관리
// =========================================================

/**
 * 커뮤니티 가입을 신청합니다.
 * POST /api/communities/:communityId/apply
 * @param communityId - 신청할 커뮤니티 ID
 * @param applicationMessage - 신청 메시지
 */
export const applyToCommunity = async (
  communityId: string,
  applicationMessage: string
): Promise<void> => {
  try {
    await apiClient.post(`/communities/${communityId}/apply`, {
      applicationMessage,
    });
  } catch (error) {
    console.error("Failed to apply to community:", error);
    throw error;
  }
};

/**
 * 특정 모집 커뮤니티의 신청자 목록을 조회합니다 (팀장만 가능).
 * GET /api/mypage/communities/recruiting/:communityId/applicants
 * @param communityId - 커뮤니티 ID
 * @returns 신청자 목록 배열 (ApplicantWithStatus 타입과 매핑 필요)
 */
export const fetchApplicantsByCommunity = async (
  communityId: string
): Promise<{
  message: string;
  applicants: {
    // ✨ 이 타입 정의가 프론트엔드의 ApplicantWithStatus 타입과 일치하도록 합니다. ✨
    id: string; // ApplicantWithStatus.id
    nickname: string;
    appliedAt: string;
    applicationMessage: string;
    status: "pending" | "accepted" | "rejected"; // ApplicantWithStatus.status (소문자)
  }[];
}> => {
  try {
    const response = await apiClient.get<{
      message: string;
      applicants: {
        // 백엔드에서 반환하는 실제 필드와 타입을 명시
        userId: number; // 백엔드 필드
        applicationId: number; // 백엔드 필드
        applicationMessage: string;
        appliedAt: string;
        status: "PENDING" | "ACCEPTED" | "REJECTED"; // 백엔드 Status (대문자)
        user: { nickname: string }; // 백엔드 포함 관계
      }[];
    }>(`/mypage/communities/recruiting/${communityId}/applicants`);

    // 백엔드 응답을 프론트엔드 ApplicantWithStatus 타입에 맞게 매핑
    const transformedApplicants = response.data.applicants.map((app) => ({
      id: app.applicationId.toString(), // applicationId를 id로 사용
      nickname: app.user.nickname, // user 객체에서 nickname 추출
      appliedAt: app.appliedAt,
      applicationMessage: app.applicationMessage,
      status: app.status.toLowerCase() as "pending" | "accepted" | "rejected", // 백엔드 status를 소문자로 변환하여 매핑
    }));

    // ✨ 함수가 기대하는 반환 타입에 정확히 일치하도록 객체를 재구성합니다. ✨
    return {
      message: response.data.message,
      applicants: transformedApplicants,
    };
  } catch (error) {
    console.error("Failed to fetch applicants:", error);
    throw error;
  }
};

/**
 * 커뮤니티 가입 신청을 수락/거절합니다 (팀장만 가능).
 * PUT /mypage/communities/recruiting/:communityId/applicants/:userId
 * @param communityId - 커뮤니티 ID
 * @param userId - 신청자의 사용자 ID (문자열)
 * @param status - 변경할 상태 ("ACCEPTED" | "REJECTED")
 */
export const updateApplicationStatus = async (
  communityId: string,
  userId: string, // 프론트엔드에서는 string (id), 백엔드는 number (userId)
  status: "ACCEPTED" | "REJECTED"
): Promise<void> => {
  try {
    await apiClient.put(
      `/mypage/communities/recruiting/${communityId}/applicants/${userId}`,
      { status }
    );
  } catch (error) {
    console.error("Failed to update application status:", error);
    throw error;
  }
};

/**
 * 커뮤니티 모집을 취소합니다 (팀장만 가능).
 * DELETE /api/mypage/communities/recruiting/:communityId
 * @param communityId - 모집을 취소할 커뮤니티 ID
 */
export const cancelRecruitment = async (communityId: string): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/recruiting/${communityId}`);
  } catch (error) {
    console.error("Failed to cancel recruitment:", error);
    throw error;
  }
};

// =========================================================
// 4. 마이페이지 커뮤니티 참여 현황
// =========================================================

/**
 * 현재 참여 중인 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/participating
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchParticipatingCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{ data: BackendTeamCommunity[] }>( // BackendTeamCommunity[] 타입
      `/mypage/communities/participating`
    );
    // BackendTeamCommunity를 Community로 매핑
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (error) {
    console.error("Failed to fetch participating communities:", error);
    throw error;
  }
};

/**
 * 참여 중인 커뮤니티에서 탈퇴하거나 (멤버), 커뮤니티를 삭제합니다 (호스트).
 * DELETE /api/mypage/communities/participating/:communityId
 * @param communityId - 커뮤니티 ID
 */
export const leaveOrDeleteCommunity = async (
  communityId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/participating/${communityId}`);
  } catch (error) {
    console.error("Failed to leave or delete community:", error);
    throw error;
  }
};

/**
 * 내가 신청한 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/applied
 * @returns AppliedCommunity 목록 배열
 */
export const fetchAppliedCommunities = async (): Promise<
  AppliedCommunity[]
> => {
  try {
    // 백엔드 API 명세서에 따르면 AppliedCommunity는 신청 상태를 포함해야 합니다.
    // 현재 BackendTeamCommunity에는 myApplicationStatus 필드가 없으므로,
    // 이 엔드포인트가 BackendTeamCommunity를 반환한다면,
    // myApplicationStatus는 'pending' 등으로 임시 처리할 수밖에 없습니다.
    // 백엔드에서 이 필드를 제공하지 않는다면, BackendTeamCommunity를 확장하는 새 타입이 필요합니다.
    const response = await apiClient.get<{ data: BackendTeamCommunity[] }>(
      `/mypage/communities/applied`
    );

    return response.data.data.map((backendComm) => {
      // API 명세에 따라 myApplicationStatus가 이 응답에 포함되어야 함 (현재 백엔드 TeamCommunity에는 없음)
      // 따라서, 백엔드에서 해당 정보를 주지 않는다면 프론트엔드에서 임의의 기본값으로 설정해야 함
      // 이 부분은 백엔드의 `applications.service.ts`의 `findApplicantsByCommunity`와 유사하게
      // 백엔드 `communities.service.ts`에서 `myApplicationStatus`를 포함하여 데이터를
      // "Enrich" 해주지 않는 한 프론트엔드에서 정확한 값을 알 수 없습니다.
      return {
        ...mapBackendCommunityToFrontendCommunity(backendComm), // 기본 필드 매핑
        // myApplicationStatus 필드는 백엔드에서 명확히 제공되지 않으므로, 임시 'pending'으로 설정
        // 실제 백엔드가 이 데이터를 주지 않는다면, 프론트엔드 타입에서 이 필드를 선택적으로 만들거나
        // 백엔드 수정이 필요합니다.
        myApplicationStatus: "pending", // ✨ 임시 기본값 설정, 백엔드 응답에 따라 수정 필요 ✨
      };
    });
  } catch (error) {
    console.error("Failed to fetch applied communities:", error);
    throw error;
  }
};
