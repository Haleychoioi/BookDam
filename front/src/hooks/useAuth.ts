// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import axios from "axios";
import type { UserProfile, SignupRequest } from "../types";

interface AuthResult {
  isLoggedIn: boolean;
  userId: number | null;
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (formData: SignupRequest) => Promise<boolean>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updateData: FormData) => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<boolean>;
  issueTemporaryPassword: (email: string, name: string) => Promise<boolean>; // ✨ 새로 추가할 함수 타입 선언 ✨
}

export const useAuth = (): AuthResult => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAxiosError = useCallback(
    (err: unknown, defaultMsg: string): string => {
      if (axios.isAxiosError(err) && err.response) {
        return (
          err.response.data.errorMessage ||
          err.response.data.message ||
          err.message
        );
      } else if (err instanceof Error) {
        return err.message;
      }
      return defaultMsg;
    },
    []
  );

  // 사용자 프로필 정보를 불러오는 함수
  const fetchUserProfile = useCallback(async (): Promise<void> => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        user: UserProfile;
        message: string;
      }>(`/mypage/getProfile`);
      setCurrentUserProfile(response.data.user);
    } catch (err) {
      const errMsg = handleAxiosError(
        err,
        "프로필 정보를 불러오는데 실패했습니다."
      );
      setError(errMsg);
      alert(errMsg);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      window.dispatchEvent(new Event("loginStatusChange"));
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [handleAxiosError, navigate]);

  // 초기 로딩 및 localStorage 변경 감지
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("accessToken");
      const storedUserId = localStorage.getItem("userId");
      const wasLoggedIn = isLoggedIn;

      setIsLoggedIn(!!token);
      setUserId(storedUserId ? Number(storedUserId) : null);

      if (!!token && storedUserId && (!wasLoggedIn || !currentUserProfile)) {
        fetchUserProfile();
      } else if (!token) {
        setCurrentUserProfile(null);
      }
    };

    checkAuthStatus();
    window.addEventListener("loginStatusChange", checkAuthStatus);
    return () => {
      window.removeEventListener("loginStatusChange", checkAuthStatus);
    };
  }, [fetchUserProfile, isLoggedIn, currentUserProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/auth/login", {
          email,
          password,
        });
        const { token, userId, message } = response.data;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", userId.toString());
        window.dispatchEvent(new Event("loginStatusChange"));
        alert(message);
        navigate("/");
        return true;
      } catch (err) {
        const errMsg = handleAxiosError(err, "로그인 중 오류가 발생했습니다.");
        setError(errMsg);
        alert(errMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleAxiosError, navigate]
  );

  const register = useCallback(
    async (formData: SignupRequest): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/auth/register", formData);
        alert(response.data.message);
        navigate("/auth/login");
        return true;
      } catch (err) {
        const errMsg = handleAxiosError(
          err,
          "회원가입 중 오류가 발생했습니다."
        );
        setError(errMsg);
        alert(errMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, handleAxiosError]
  );

  const logout = useCallback(() => {
    setLoading(true);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentUserProfile(null);
    window.dispatchEvent(new Event("loginStatusChange"));
    alert("로그아웃 되었습니다.");
    navigate("/");
    setLoading(false);
  }, [navigate]);

  const updateProfile = useCallback(
    async (updateData: FormData): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put<{
          user: UserProfile;
          message: string;
        }>(`/mypage/profile`, updateData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setCurrentUserProfile(response.data.user);
        alert(response.data.message);
        return true;
      } catch (err) {
        const errMsg = handleAxiosError(err, "프로필 수정에 실패했습니다.");
        setError(errMsg);
        alert(errMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleAxiosError]
  );

  const changePassword = useCallback(
    async (passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put(
          `/mypage/change-password`,
          passwordData
        );
        alert(response.data.message);
        return true;
      } catch (err) {
        const errMsg = handleAxiosError(err, "비밀번호 변경에 실패했습니다.");
        setError(errMsg);
        alert(errMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleAxiosError]
  );

  const deleteUser = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/mypage/delete`);
      logout();
      return true;
    } catch (err) {
      const errMsg = handleAxiosError(err, "회원 탈퇴에 실패했습니다.");
      setError(errMsg);
      alert(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout, handleAxiosError]);

  // ✨ 새로 추가된 임시 비밀번호 발급 함수 ✨
  const issueTemporaryPassword = useCallback(
    async (email: string, name: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/auth/password/issue-temp", {
          email,
          name,
        });
        alert(response.data.message);
        return true;
      } catch (err) {
        const errMsg = handleAxiosError(
          err,
          "임시 비밀번호 발급에 실패했습니다."
        );
        setError(errMsg);
        alert(errMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleAxiosError]
  );

  return {
    isLoggedIn,
    userId,
    currentUserProfile,
    loading,
    error,
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    deleteUser,
    changePassword,
    issueTemporaryPassword, // ✨ 새로 추가된 함수 반환 ✨
  };
};
