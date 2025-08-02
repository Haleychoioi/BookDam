// src/api/communities.ts

import apiClient from "./apiClient";
import type {
  Community,
  AppliedCommunity,
  TeamCommunity,
  ApplicantWithStatus,
} from "../types";

/**
 * 백엔드 TeamCommunity 응답을 프론트엔드 Community 타입으로 매핑합니다.
 * 백엔드 API에서 직접 제공하지 않는 필드(예: currentMembers, maxMembers)에 기본값을 할당합니다.
 * @param backendCommunity - 백엔드에서 받은 TeamCommunity 객체
 * @returns 프론트엔드 Community 객체
 */
const mapBackendCommunityToFrontendCommunity = (
  backendCommunity: TeamCommunity
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
      data: TeamCommunity[]; // 백엔드 응답 타입 명확화
    }>(`/communities?page=${page}&pageSize=${pageSize}&sort=${sort}`);

    const mappedCommunities = response.data.data.map(
      mapBackendCommunityToFrontendCommunity
    );

    return {
      communities: mappedCommunities,
      totalResults: mappedCommunities.length, // 현재는 응답 개수를 총 결과로 사용 (백엔드 totalResults 필요)
    };
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      // Error 인스턴스 확인
      console.error("Failed to fetch communities:", err); // 'error' 대신 'err' 사용
      throw err; // 'error' 대신 'err' 사용
    }
    throw new Error("Unknown error occurred"); // 알 수 없는 오류 처리
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
      data: TeamCommunity[]; // 백엔드 응답 타입 명확화
    }>(`/communities/books/${itemId}?size=${size}`);
    return response.data.data.map(mapBackendCommunityToFrontendCommunity); // 매핑 함수 사용
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to fetch communities by book:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 커뮤니티 상세 정보를 조회합니다.
 * GET /api/communities/:communityId
 * @param communityId - 커뮤니티 ID
 * @returns TeamCommunity 객체
 */
export const fetchCommunityById = async (
  communityId: string
): Promise<TeamCommunity> => {
  try {
    // try-catch 블록 추가 (일관성 유지)
    const response = await apiClient.get<TeamCommunity>(
      `/communities/${communityId}`
    );
    return response.data;
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to fetch community by ID:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
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
    return response.data.communityId.toString(); // ID를 string으로 변환
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to create community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 커뮤니티 상세 정보를 업데이트합니다 (recruiting, title, content, maxMembers 등).
 * PUT /api/communities/:communityId
 * @param communityId - 업데이트할 커뮤니티 ID
 * @param updateData - 업데이트할 데이터 { title?, content?, maxMembers?, recruiting? }
 * @returns 업데이트된 Community 객체
 */
export const updateCommunityDetails = async (
  communityId: string,
  updateData: {
    title?: string;
    content?: string; // 백엔드에서는 description 대신 content로 받습니다.
    maxMembers?: number;
    recruiting?: boolean; // 모집 여부 (true/false)
  }
): Promise<Community> => {
  try {
    const response = await apiClient.put<{
      message: string;
      data: TeamCommunity; // 백엔드는 업데이트된 TeamCommunity 객체를 반환합니다.
    }>(`/communities/${communityId}`, updateData);

    const backendComm = response.data.data;

    // TeamCommunity 응답을 Community 타입에 맞게 변환합니다.
    // 'currentMembers'는 이 API 응답에 없으므로 기본값 0을 사용합니다.
    // 'role'과 'status'는 정확한 리터럴 타입으로 명시적 캐스팅합니다.
    const mappedCommunity: Community = {
      id: backendComm.teamId.toString(),
      title: backendComm.postTitle,
      description: backendComm.postContent,
      hostName: backendComm.postAuthor,
      currentMembers: 0, // 이 API 응답에 현재 멤버 수는 포함되지 않으므로 0으로 가정
      maxMembers: backendComm.maxMembers || 0, // TeamCommunity에 maxMembers가 있을 수 있음 (Post에서 유래)
      role: "host" as "host" | "member", // 'host' 리터럴을 명시적 캐스팅
      status: (backendComm.status === "RECRUITING" ? "모집중" : "모집종료") as
        | "모집중"
        | "모집종료", // 조건부 결과도 명시적 캐스팅
    };
    return mappedCommunity;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to update community details:", err);
      throw err;
    }
    throw new Error("Unknown error occurred while updating community details.");
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
  // 반환 타입은 Community
  try {
    const response = await apiClient.put<{
      message: string;
      data: TeamCommunity; // 백엔드는 TeamCommunity를 반환
    }>(`/communities/${communityId}/status`, { newStatus });
    return mapBackendCommunityToFrontendCommunity(response.data.data);
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to update community status:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 커뮤니티를 삭제합니다 (팀장만 가능).
 * DELETE /api/communities/:communityId
 * @param communityId - 삭제할 커뮤니티 ID
 */
// 커뮤니티 삭제 (팀장용) API
export const deleteCommunity = async (communityId: number): Promise<void> => {
  try {
    const response = await apiClient.delete(`/communities/${communityId}`);
    console.log(response.data.message); // 성공 메시지 로깅
  } catch (error) {
    console.error(`Failed to delete community ${communityId}:`, error);
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
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to apply to community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
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
  applicants: ApplicantWithStatus[]; // 반환 타입 ApplicantWithStatus[]로 직접 지정
}> => {
  try {
    const response = await apiClient.get<{
      message: string;
      applicants: {
        userId: number;
        applicationId: number;
        // postId는 백엔드 응답에 직접 없으므로 제거 (혹은 매핑 시 고정값 부여)
        applicationMessage: string;
        appliedAt: string;
        status: "PENDING" | "ACCEPTED" | "REJECTED";
        user: { nickname: string };
      }[];
    }>(`/mypage/communities/recruiting/${communityId}/applicants`);

    // 백엔드 응답을 프론트엔드 ApplicantWithStatus 타입에 맞게 매핑
    const transformedApplicants: ApplicantWithStatus[] =
      response.data.applicants.map((app) => ({
        id: app.applicationId.toString(), // applicationId를 id로 사용
        applicationId: app.applicationId, // 추가: applicationId 필드
        userId: app.userId, // 추가: userId 필드
        nickname: app.user.nickname,
        appliedAt: app.appliedAt,
        applicationMessage: app.applicationMessage,
        status: app.status.toLowerCase() as "pending" | "accepted" | "rejected",
      }));

    return {
      message: response.data.message,
      applicants: transformedApplicants,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch applicants:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 커뮤니티 가입 신청을 수락/거절합니다 (팀장만 가능).
 * PUT /api/mypage/communities/recruiting/:communityId/applicants/:userId
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
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to update application status:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
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
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to cancel recruitment:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 내가 신청한 커뮤니티에 대한 신청을 취소합니다.
 * DELETE /api/mypage/communities/applications/:applicationId
 * @param applicationId - 취소할 신청서의 ID
 */
export const cancelApplication = async (
  applicationId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/applications/${applicationId}`); // 백엔드 라우트와 매칭
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to cancel application:", err);
      throw err;
    }
    throw new Error("Unknown error occurred while canceling application.");
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
  // 반환 타입은 Community[]
  try {
    const response = await apiClient.get<{ data: TeamCommunity[] }>(
      `/mypage/communities/participating`
    );
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to fetch participating communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
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
  } catch (err: unknown) {
    // 'error' 대신 'err: unknown' 사용
    if (err instanceof Error) {
      console.error("Failed to leave or delete community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 내가 신청한 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/applied
 */
export const fetchAppliedCommunities = async (): Promise<
  AppliedCommunity[]
> => {
  try {
    const response = await apiClient.get<{ data: TeamCommunity[] }>(
      `/mypage/communities/applied`
    );

    return response.data.data.map((backendComm) => {
      // TeamCommunity (백엔드 응답)를 AppliedCommunity (프론트엔드 타입)로 명시적으로 매핑합니다.
      const mappedCommunity: AppliedCommunity = {
        id: backendComm.teamId.toString(), // TeamCommunity의 teamId를 AppliedCommunity의 id로 매핑
        title: backendComm.postTitle, // TeamCommunity의 postTitle을 AppliedCommunity의 title로 매핑
        description: backendComm.postContent, // TeamCommunity의 postContent를 AppliedCommunity의 description으로 매핑
        hostName: backendComm.postAuthor, // TeamCommunity의 postAuthor를 AppliedCommunity의 hostName으로 매핑
        status: backendComm.status === "RECRUITING" ? "모집중" : "모집종료", // TeamCommunity의 status를 매핑

        // 아래 필드들은 TeamCommunity 응답에 직접 포함되지 않거나 기본값/유추가 필요합니다.
        currentMembers: 0, // 백엔드에서 제공되지 않으므로 임시 기본값. 정확한 값을 원한다면 백엔드 API 개선 필요.
        maxMembers: backendComm.maxMembers || 0, // TeamCommunity에 optional maxMembers가 있으므로 사용, 없으면 0.
        role: "member", // 이 API는 사용자 역할을 제공하지 않므로 'member'로 기본값 설정.

        // AppliedCommunity 고유 필드
        // myApplicationStatus는 백엔드 `GET /mypage/communities/applied` API 응답에 직접 포함되지 않으므로,
        // 현재는 임시로 'pending' 값을 사용합니다. 정확한 상태를 얻으려면 백엔드 API 개선이 필요합니다.
        myApplicationStatus: "pending",
      };
      return mappedCommunity;
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch applied communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 내가 모집 중인 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/recruiting
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchMyRecruitingCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{ data: TeamCommunity[] }>(
      `/mypage/communities/recruiting`
    );
    // mapBackendCommunityToFrontendCommunity 함수는 role과 currentMembers, maxMembers를 기본값으로 매핑합니다.
    // 백엔드에서 이 정보를 직접 제공하도록 업데이트하면 더 정확해집니다.
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch my recruiting communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};
