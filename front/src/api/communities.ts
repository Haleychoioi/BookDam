// src/api/communities.ts

import apiClient from "./apiClient";
import type {
  Community,
  AppliedCommunity,
  ApplicantWithStatus,
  TeamCommunity,
  TeamApplication,
  TeamCommunityWithBookTitle,
  AppliedCommunityPostInfo,
} from "../types";

/**
 * 백엔드 TeamCommunity 응답을 프론트엔드 Community 타입으로 매핑합니다.
 * 백엔드 API에서 직접 제공하지 않는 필드(예: currentMembers, maxMembers)에 기본값을 할당합니다.
 * @param backendCommunity - 백엔드에서 받은 TeamCommunity 객체 (currentMembers, maxMembers, hostId, hasApplied 포함)
 * @param currentUserId - 현재 로그인한 사용자의 ID (역할 판단용)
 * @returns 프론트엔드 Community 객체
 */
const mapBackendCommunityToFrontendCommunity = (
  backendCommunity: TeamCommunity & {
    currentMembers?: number;
    maxMembers?: number;
    hostId?: number;
    hasApplied?: boolean;
  },
  currentUserId?: number
): Community => {
  const role: "host" | "member" =
    currentUserId && backendCommunity.hostId === currentUserId
      ? "host"
      : "member";

  return {
    id: backendCommunity.teamId.toString(),
    title: backendCommunity.postTitle,
    description: backendCommunity.postContent,
    hostName: backendCommunity.postAuthor,
    hostId: backendCommunity.hostId || 0,
    currentMembers: backendCommunity.currentMembers || 0,
    maxMembers: backendCommunity.maxMembers || 0,
    role: role,
    status: backendCommunity.status === "RECRUITING" ? "모집중" : "모집종료",
    createdAt: backendCommunity.createdAt,
    hasApplied: backendCommunity.hasApplied,
  };
};

// =========================================================
// 1. 커뮤니티 목록 및 상세 조회
// =========================================================

export const fetchCommunities = async (
  page: number = 1,
  pageSize: number = 10,
  sort: string = "latest",
  userId?: number
): Promise<{ communities: Community[]; totalResults: number }> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: {
        communities: (TeamCommunity & {
          currentMembers?: number;
          maxMembers?: number;
          hostId?: number;
          hasApplied?: boolean;
        })[];
        totalResults: number;
      };
    }>(
      `/mypage/communities?page=${page}&pageSize=${pageSize}&sort=${sort}${
        userId ? `&userId=${userId}` : ""
      }`
    );

    const mappedCommunities: Community[] = response.data.data.communities.map(
      (backendCommunity) => {
        const mapped = mapBackendCommunityToFrontendCommunity(
          backendCommunity,
          userId
        );
        if ("hasApplied" in backendCommunity) {
          mapped.hasApplied = backendCommunity.hasApplied;
        }
        return mapped;
      }
    );

    return {
      communities: mappedCommunities,
      totalResults: response.data.data.totalResults,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch communities:", err);
      throw err;
    }
    throw new Error("Unknown error occurred");
  }
};

export const fetchCommunitiesByBookIsbn13 = async (
  isbn13: string,
  size: number = 10,
  userId?: number
): Promise<Community[]> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: (TeamCommunity & {
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
      (backendCommunity) => {
        const mapped = mapBackendCommunityToFrontendCommunity(
          backendCommunity,
          userId
        );
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

export const fetchCommunityById = async (
  communityId: number
): Promise<TeamCommunityWithBookTitle> => {
  try {
    const response = await apiClient.get<{
      message: string;
      data: TeamCommunityWithBookTitle;
    }>(`/mypage/communities/${communityId}`);

    return response.data.data;
  } catch (err: unknown) {
    console.error("Failed to fetch community by ID:", err);
    throw err;
  }
};

// =========================================================
// 2. 커뮤니티 생성 및 관리 (팀장용)
// =========================================================

/**
 * 새로운 도서 기반 커뮤니티를 생성합니다.
 * POST /api/mypage/communities
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
 * PUT /api/mypage/communities/:communityId
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
 * PUT /api/mypage/communities/:communityId/status
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
 * DELETE /api/mypage/communities/:communityId
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
 * POST /api/communities/:communityId/apply
 * @param communityId - 신청할 커뮤니티 ID
 * @param applicationMessage - 신청 메시지
 */
export const applyToCommunity = async (
  communityId: string, // communityId는 string
  applicationMessage: string // applicationMessage 추가
): Promise<string> => {
  try {
    const response = await apiClient.post(
      `/mypage/communities/${communityId}/apply`,
      {
        applicationMessage,
      }
    );
    return response.data.message;
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
 * PUT /api/mypage/communities/recruiting/:communityId/applicants/:userId
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
 * DELETE /api/mypage/communities/recruiting/:communityId
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
 * DELETE /api/mypage/communities/applications/:applicationId
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
 * GET /api/mypage/communities/participating
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchParticipatingCommunities = async (): Promise<Community[]> => {
  try {
    const userId = localStorage.getItem("userId")
      ? Number(localStorage.getItem("userId"))
      : undefined;

    const response = await apiClient.get<{ data: TeamCommunity[] }>(
      `/mypage/communities/participating`
    );
    return response.data.data.map((backendCommunity) =>
      mapBackendCommunityToFrontendCommunity(backendCommunity, userId)
    );
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
 * DELETE /api/mypage/communities/participating/:communityId
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
 * GET /api/mypage/communities/applied
 */
export const fetchAppliedCommunities = async (): Promise<
  AppliedCommunity[]
> => {
  try {
    const response = await apiClient.get<{
      data: (TeamApplication & {
        post: AppliedCommunityPostInfo | null;
        user: { nickname: string };
      })[];
    }>(`/mypage/communities/applied`);

    const currentUserId = localStorage.getItem("userId")
      ? Number(localStorage.getItem("userId"))
      : undefined;

    return response.data.data
      .filter((backendApplication) => backendApplication.post?.team !== null)
      .map((backendApplication) => {
        const postData = backendApplication.post;
        const communityData = postData?.team;

        const mappedAppliedCommunity: AppliedCommunity = {
          id:
            communityData?.teamId.toString() ||
            backendApplication.applicationId.toString(),
          applicationId: backendApplication.applicationId,
          title: communityData?.postTitle || postData?.title || "정보 없음",
          description: communityData?.postContent || "정보 없음",
          hostName: communityData?.postAuthor || "정보 없음",
          hostId: postData?.userId || 0,
          currentMembers: communityData?.currentMembers || 0,
          maxMembers: communityData?.maxMembers || 0,
          role:
            communityData?.postAuthor &&
            currentUserId &&
            postData?.userId === currentUserId
              ? "host"
              : "member",
          status:
            communityData?.status === "RECRUITING"
              ? "모집중"
              : communityData?.status === "ACTIVE"
              ? "활동중"
              : "모집종료",
          createdAt: backendApplication.appliedAt,
          myApplicationStatus: backendApplication.status.toLowerCase() as
            | "pending"
            | "accepted"
            | "rejected",
        };
        return mappedAppliedCommunity;
      });
  } catch (err: unknown) {
    console.error("Failed to fetch applied communities:", err);
    throw err;
  }
};

/**
 * 내가 모집 중인 커뮤니티 목록을 조회합니다.
 * GET /api/mypage/communities/recruiting
 * @returns Community 목록 배열 (role 포함)
 */
export const fetchMyRecruitingCommunities = async (): Promise<Community[]> => {
  try {
    const userId = localStorage.getItem("userId")
      ? Number(localStorage.getItem("userId"))
      : undefined;

    const response = await apiClient.get<{
      data: (TeamCommunity & {
        currentMembers?: number;
        maxMembers?: number;
        hostId?: number;
      })[];
    }>(`/mypage/communities/recruiting`);
    return response.data.data.map((backendCommunity) =>
      mapBackendCommunityToFrontendCommunity(backendCommunity, userId)
    );
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
