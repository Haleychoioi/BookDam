// src/api/communities.ts

import apiClient from "./apiClient";
import type {
  Community,
  // CommunityDetail,
  AppliedCommunity,
  ApplicantWithStatus,
  TeamCommunity,
  TeamApplication,
  TeamCommunityWithBookTitle,
} from "../types";

/**
 * 백엔드 TeamCommunity 응답을 프론트엔드 Community 타입으로 매핑합니다.
 * 백엔드 API에서 직접 제공하지 않는 필드(예: currentMembers, maxMembers)에 기본값을 할당합니다.
 * @param backendCommunity - 백엔드에서 받은 TeamCommunity 객체 (currentMembers, maxMembers, hostId, hasApplied 포함)
 * @returns 프론트엔드 Community 객체
 */
const mapBackendCommunityToFrontendCommunity = (
  backendCommunity: TeamCommunity & {
    currentMembers?: number;
    maxMembers?: number;
    hostId?: number;
    hasApplied?: boolean; // 백엔드에서 이 필드를 넘겨줄 경우를 대비
  }
): Community => {
  return {
    id: backendCommunity.teamId.toString(),
    title: backendCommunity.postTitle,
    description: backendCommunity.postContent,
    hostName: backendCommunity.postAuthor,
    hostId: backendCommunity.hostId || 0,
    currentMembers: backendCommunity.currentMembers || 0,
    maxMembers: backendCommunity.maxMembers || 0,
    role: "member",
    status: backendCommunity.status === "RECRUITING" ? "모집중" : "모집종료",
    createdAt: backendCommunity.createdAt,
    hasApplied: backendCommunity.hasApplied, // ✨ hasApplied 매핑 ✨
  };
};

// =========================================================
// 1. 커뮤니티 목록 및 상세 조회
// =========================================================

/**
 * 모든 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities (경로 변경됨)
 * @param page - 페이지 번호
 * @param pageSize - 페이지당 항목 수
 * @param sort - 정렬 기준 (예: 'latest')
 * @param userId - 현재 로그인한 사용자 ID (선택 사항, 신청 여부 확인용)
 * @returns 커뮤니티 목록 배열 및 총 결과 수
 */
export const fetchCommunities = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest",
  userId?: number // ✨ userId 인자 추가 ✨
): Promise<{ communities: Community[]; totalResults: number }> => {
  try {
    // ✨ 수정: apiClient.get 제네릭 타입 변경 및 data.communities에 접근하도록 수정 ✨
    const response = await apiClient.get<{
      message: string;
      data: {
        // 백엔드의 data 필드가 객체를 포함하도록 수정
        communities: (TeamCommunity & {
          // communities 배열
          currentMembers?: number;
          maxMembers?: number;
          hostId?: number;
          hasApplied?: boolean;
        })[];
        totalResults: number; // totalResults 포함
      };
    }>(
      `/mypage/communities?page=${page}&pageSize=${pageSize}&sort=${sort}${
        userId ? `&userId=${userId}` : ""
      }`
    );

    const mappedCommunities: Community[] = response.data.data.communities.map(
      // ✨ 수정: .communities에 접근하여 .map() 호출 ✨
      (backendCommunity) => {
        const mapped = mapBackendCommunityToFrontendCommunity(backendCommunity);
        if ("hasApplied" in backendCommunity) {
          mapped.hasApplied = backendCommunity.hasApplied;
        }
        return mapped;
      }
    );

    return {
      communities: mappedCommunities,
      totalResults: response.data.data.totalResults, // ✨ 수정: totalResults는 백엔드에서 받은 값 사용 ✨
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 도서 관련 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/books/:itemId (경로 변경됨)
 * @param isbn13 - 도서 ISBN13 (itemId 대신 isbn13으로 인자명 변경)
 * @param size - 조회할 커뮤니티 수 (기본값: 10)
 * @param userId - 현재 로그인한 사용자 ID (선택 사항, 신청 여부 확인용)
 * @returns 커뮤니티 목록 배열
 */
export const fetchCommunitiesByBookIsbn13 = async (
  // ✨ 이름 변경 ✨
  isbn13: string, // ✨ 인자명 변경 ✨
  size: number = 10,
  userId?: number
): Promise<Community[]> => {
  try {
    // 이 함수의 백엔드는 data 필드에 배열을 직접 반환하므로, 기존 코드는 올바릅니다.
    const response = await apiClient.get<{
      message: string;
      data: (TeamCommunity & {
        // 백엔드 컨트롤러가 배열을 직접 반환
        currentMembers?: number;
        maxMembers?: number;
        hostId?: number;
        hasApplied?: boolean;
      })[];
    }>(
      `/mypage/communities/books/${isbn13}?size=${size}${
        userId ? `&userId=${userId}` : ""
      }`
    );

    const mappedCommunities: Community[] = response.data.data.map(
      // 이 부분은 올바르게 작동합니다.
      (backendCommunity) => {
        const mapped = mapBackendCommunityToFrontendCommunity(backendCommunity);
        if ("hasApplied" in backendCommunity) {
          mapped.hasApplied = backendCommunity.hasApplied;
        }
        return mapped;
      }
    );
    return mappedCommunities;
  } catch (err: unknown) {
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
 * @returns TeamCommunityWithBookTitle // ✨ 이 Promise 타입이 정확해야 합니다. ✨
 */
export const fetchCommunityById = async (
  communityId: number
): Promise<TeamCommunityWithBookTitle> => {
  // ✨ 이 부분이 Promise<TeamCommunityWithBookTitle> 인지 확인 ✨
  try {
    const response = await apiClient.get<TeamCommunityWithBookTitle>( // ✨ 이 부분이 apiClient.get<TeamCommunityWithBookTitle> 인지 확인 ✨
      `/mypage/communities/${communityId}`
    );
    return response.data; // response.data는 백엔드로부터 받은 실제 데이터 (bookTitle 포함)
  } catch (err: unknown) {
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
 * POST /api/mypage/communities (경로 변경됨)
 * @param communityData - 생성할 커뮤니티 데이터
 * @returns 생성된 커뮤니티 ID
 */
export const createCommunity = async (communityData: {
  isbn13: string;
  title: string;
  content: string;
  maxMembers: number;
}): Promise<string> => {
  try {
    const response = await apiClient.post<{
      status: string;
      message: string;
      communityId: number;
    }>(`/mypage/communities`, communityData);
    return response.data.communityId.toString();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to create community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 커뮤니티 상세 정보를 업데이트합니다 (recruiting, title, content, maxMembers 등).
 * PUT /api/mypage/communities/:communityId (경로 변경됨)
 * @param communityId - 업데이트할 커뮤니티 ID
 * @param updateData - 업데이트할 데이터 { title?, content?, maxMembers?, recruiting? }
 * @returns 업데이트된 Community 객체
 */
export const updateCommunityDetails = async (
  communityId: string,
  updateData: {
    title?: string;
    content?: string;
    maxMembers?: number;
    recruiting?: boolean;
  }
): Promise<Community> => {
  try {
    const response = await apiClient.put<{
      message: string;
      data: TeamCommunity;
    }>(`/mypage/communities/${communityId}`, updateData);

    const backendComm = response.data.data;

    const mappedCommunity: Community = {
      id: backendComm.teamId.toString(),
      title: backendComm.postTitle,
      description: backendComm.postContent,
      hostName: backendComm.postAuthor,
      hostId: 0,
      currentMembers: 0,
      maxMembers: backendComm.maxMembers || 0,
      role: "host" as "host" | "member",
      status: (backendComm.status === "RECRUITING" ? "모집중" : "모집종료") as
        | "모집중"
        | "모집종료",
      createdAt: backendComm.createdAt,
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
 * PUT /api/mypage/communities/:communityId/status (경로 변경됨)
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
      data: TeamCommunity;
    }>(`/mypage/communities/${communityId}/status`, { newStatus });
    return mapBackendCommunityToFrontendCommunity(response.data.data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to update community status:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 커뮤니티를 삭제합니다 (팀장만 가능).
 * DELETE /api/mypage/communities/:communityId (경로 변경됨)
 * @param communityId - 삭제할 커뮤니티 ID
 */
export const deleteCommunity = async (communityId: number): Promise<void> => {
  try {
    const response = await apiClient.delete(
      `/mypage/communities/${communityId}`
    );
    console.log(response.data.message);
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
 * POST /api/mypage/communities/:communityId/apply (경로 변경됨)
 * @param communityId - 신청할 커뮤니티 ID
 * @param applicationMessage - 신청 메시지
 */
export const applyToCommunity = async (
  communityId: string,
  applicationMessage: string
): Promise<void> => {
  try {
    await apiClient.post(`/mypage/communities/${communityId}/apply`, {
      applicationMessage,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to apply to community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 특정 모집 커뮤니티의 신청자 목록을 조회합니다 (팀장만 가능).
 * GET /api/mypage/communities/recruiting/:communityId/applicants (경로 변경됨)
 * @param communityId - 커뮤니티 ID
 * @returns 신청자 목록 배열 (ApplicantWithStatus 타입과 매핑 필요)
 */
export const fetchApplicantsByCommunity = async (
  communityId: string
): Promise<{
  message: string;
  applicants: ApplicantWithStatus[];
}> => {
  try {
    const response = await apiClient.get<{
      message: string;
      applicants: {
        userId: number;
        applicationId: number;
        applicationMessage: string;
        appliedAt: string;
        status: "PENDING" | "ACCEPTED" | "REJECTED";
        user: { nickname: string };
      }[];
    }>(`/mypage/communities/recruiting/${communityId}/applicants`);

    const transformedApplicants: ApplicantWithStatus[] =
      response.data.applicants.map((app) => ({
        id: app.applicationId.toString(),
        applicationId: app.applicationId,
        userId: app.userId,
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
 * PUT /api/mypage/communities/recruiting/:communityId/applicants/:userId (경로 변경됨)
 * @param communityId - 커뮤니티 ID
 * @param userId - 신청자의 사용자 ID (문자열)
 * @param status - 변경할 상태 ("ACCEPTED" | "REJECTED")
 */
export const updateApplicationStatus = async (
  communityId: string,
  userId: string,
  status: "ACCEPTED" | "REJECTED"
): Promise<void> => {
  try {
    await apiClient.put(
      `/mypage/communities/recruiting/${communityId}/applicants/${userId}`,
      { status }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to update application status:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 커뮤니티 모집을 취소합니다 (팀장만 가능).
 * DELETE /api/mypage/communities/recruiting/:communityId (경로 변경됨)
 * @param communityId - 모집을 취소할 커뮤니티 ID
 */
export const cancelRecruitment = async (communityId: string): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/recruiting/${communityId}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to cancel recruitment:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 내가 신청한 커뮤니티에 대한 신청을 취소합니다.
 * DELETE /api/mypage/communities/applications/:applicationId (경로 변경됨)
 * @param applicationId - 취소할 신청서의 ID
 */
export const cancelApplication = async (
  applicationId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/applications/${applicationId}`);
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
 * GET /api/mypage/communities/participating (경로 변경됨)
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchParticipatingCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{ data: TeamCommunity[] }>(
      `/mypage/communities/participating`
    );
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch participating communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 참여 중인 커뮤니티에서 탈퇴하거나 (멤버), 커뮤니티를 삭제합니다 (호스트).
 * DELETE /api/mypage/communities/participating/:communityId (경로 변경됨)
 * @param communityId - 커뮤니티 ID
 */
export const leaveOrDeleteCommunity = async (
  communityId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/mypage/communities/participating/${communityId}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to leave or delete community:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

/**
 * 내가 신청한 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/applied (경로 변경됨)
 */
export const fetchAppliedCommunities = async (): Promise<
  AppliedCommunity[]
> => {
  try {
    // 백엔드는 ApplicationWithPostInfo (TeamApplication & { post: { postId, title }}) 배열을 반환합니다.
    const response = await apiClient.get<{
      data: (TeamApplication & {
        post: { postId: number; title: string }; // 커뮤니티 게시물 정보
      })[];
    }>(`/mypage/communities/applied`);

    return response.data.data.map((backendApplication) => {
      // backendApplication 객체에는 teamId가 직접적으로 없습니다.
      // id는 신청서 자체의 고유 ID(applicationId)를 사용하는 것이 적합합니다.
      const mappedAppliedCommunity: AppliedCommunity = {
        id: backendApplication.applicationId.toString(), // ✨ 수정: applicationId를 id로 사용 ✨
        title: backendApplication.post.title, // 연결된 게시물의 제목
        // 아래 필드들은 ApplicationWithPostInfo에 직접 제공되지 않습니다.
        // 필요하다면 백엔드 API를 수정하거나 프론트엔드에서 추가 호출이 필요합니다.
        // 일단은 기본값/빈 값으로 처리합니다. AppliedCommunity 타입 정의에 따라 조절해야 합니다.
        description: "",
        hostName: "",
        hostId: 0,
        currentMembers: 0,
        maxMembers: 0,
        role: "member", // 신청 목록이므로 기본 역할은 member로 설정
        status: "모집중", // 신청 당시 커뮤니티 상태 (백엔드에서 제공하지 않으므로 기본값)

        createdAt: backendApplication.appliedAt, // 신청 날짜
        myApplicationStatus: backendApplication.status.toLowerCase() as
          | "pending"
          | "accepted"
          | "rejected", // 나의 신청 상태
      };
      return mappedAppliedCommunity;
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
 * GET /api/mypage/communities/recruiting (경로 변경됨)
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchMyRecruitingCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{
      data: (TeamCommunity & {
        currentMembers?: number;
        maxMembers?: number;
        hostId?: number;
      })[];
    }>(`/mypage/communities/recruiting`);
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch my recruiting communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

// =========================================================
// 새로 추가된 API 함수들
// =========================================================

/**
 * 특정 커뮤니티의 모집 상태를 종료로 변경합니다. (PATCH /api/mypage/communities/:communityId/end-recruitment)
 * @param communityId - 모집을 종료할 커뮤니티 ID
 */
export const endRecruitment = async (communityId: string): Promise<void> => {
  try {
    await apiClient.patch(`/mypage/communities/${communityId}/end-recruitment`);
  } catch (error) {
    console.error(
      `Failed to end recruitment for community ${communityId}:`,
      error
    );
    throw error;
  }
};

/**
 * 내가 모집 종료한 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/ended
 * @returns Community 목록 배열
 */
export const fetchMyEndedCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{
      data: (TeamCommunity & {
        currentMembers?: number;
        maxMembers?: number;
        hostId?: number;
      })[];
    }>(`/mypage/communities/ended`);
    return response.data.data.map(mapBackendCommunityToFrontendCommunity);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch my ended communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};
