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
  error: string | null; // 일반적인 에러 메시지
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    formData: SignupRequest
  ) => Promise<string | { [key: string]: string } | null>; // ✨ 반환 타입 변경 ✨
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updateData: FormData) => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<boolean>;
  issueTemporaryPassword: (email: string, name: string) => Promise<boolean>;
  handleAxiosError: (err: unknown, defaultMsg: string) => string;
}

export const useAuth = (): AuthResult => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUserProfile, setCurrentUserProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // useAuth 훅의 전역 에러 상태

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
      alert(errMsg); // 프로필 로딩 에러는 alert 유지
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

        if (errMsg === "해당 유저가 없습니다") {
          alert("회원 정보가 없습니다. 회원가입 페이지로 이동합니다.");
        } else if (errMsg === "패스워드 불일치") {
          alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          alert(errMsg);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleAxiosError, navigate]
  );

  const register = useCallback(
    async (
      formData: SignupRequest
    ): Promise<string | { [key: string]: string } | null> => {
      // ✨ 반환 타입 변경 ✨
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/auth/register", formData);
        alert(response.data.message); // 회원가입 성공 메시지
        navigate("/auth/login");
        return null; // ✨ 성공 시 null 반환 ✨
      } catch (err) {
        // ✨ Axios 에러일 경우 MultiDuplicateError 여부 확인 ✨
        if (axios.isAxiosError(err) && err.response && err.response.data) {
          if (err.response.data.errors) {
            // MultiDuplicateError에서 보낸 errors 객체
            setError("다중 중복 오류 발생"); // useAuth의 에러 상태는 일반 메시지로
            return err.response.data.errors; // ✨ errors 객체 반환 ✨
          }
          // 그 외의 Axios 에러 (단일 errorMessage)
          const errMsg = handleAxiosError(
            err,
            "회원가입 중 알 수 없는 오류가 발생했습니다."
          );
          setError(errMsg);
          return errMsg; // ✨ 단일 오류 메시지 문자열 반환 ✨
        }
        // Axios 에러가 아닌 일반 JS 에러
        const errMsg = handleAxiosError(
          err,
          "회원가입 중 알 수 없는 오류가 발생했습니다."
        );
        setError(errMsg);
        return errMsg; // ✨ 단일 오류 메시지 문자열 반환 ✨
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
        }>(`/mypage/profile-edit`, updateData, {
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
    issueTemporaryPassword,
    handleAxiosError,
  };
};
