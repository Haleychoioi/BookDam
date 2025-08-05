// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "../api/apiClient";

import type {
  UserProfile,
  SignupRequest,
  ChangePasswordRequest,
} from "../types";
import type { QueryObserverResult } from "@tanstack/react-query";

interface AuthResult {
  isLoggedIn: boolean;
  userId: number | null;
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    formData: SignupRequest
  ) => Promise<string | { [key: string]: string } | null>;
  logout: () => void;
  fetchUserProfile: () => Promise<QueryObserverResult<UserProfile, Error>>;
  updateProfile: (updateData: FormData) => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<boolean>;
  issueTemporaryPassword: (email: string, name: string) => Promise<boolean>;
  handleAxiosError: (err: unknown, defaultMsg: string) => string;
  navigate: ReturnType<typeof useNavigate>;
}

export const useAuth = (): AuthResult => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

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

  const {
    data: currentUserProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile,
    refetch: refetchUserProfile,
  } = useQuery<UserProfile, Error>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await apiClient.get<{
        user: UserProfile;
        message: string;
      }>("/mypage/getProfile");
      return response.data.user;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("accessToken");
      const storedUserId = localStorage.getItem("userId");

      const newUserId = storedUserId ? Number(storedUserId) : null;
      const newIsLoggedIn = !!token && !!storedUserId;

      setIsLoggedIn(newIsLoggedIn);
      setUserId(newUserId);
    };

    checkAuthStatus();
    window.addEventListener("loginStatusChange", checkAuthStatus);
    return () => {
      window.removeEventListener("loginStatusChange", checkAuthStatus);
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (loginData: { email: string; password: string }) => {
      const response = await apiClient.post("/auth/login", loginData);
      const { token, userId, message } = response.data;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userId.toString());
      window.dispatchEvent(new Event("loginStatusChange"));
      showToast(message, "success");
      navigate("/");
      return true;
    },
    onError: (err) => {
      const errMsg = handleAxiosError(err, "로그인 중 오류가 발생했습니다.");
      if (
        errMsg === "해당 유저가 없습니다" ||
        errMsg === "패스워드 불일치" ||
        errMsg === "잘못된 입력입니다"
      ) {
        showToast("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
      } else {
        showToast(errMsg, "error");
      }
    },
  });

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        await loginMutation.mutateAsync({ email, password });
        return true;
      } catch {
        return false;
      }
    },
    [loginMutation]
  );

  const registerMutation = useMutation({
    mutationFn: async (formData: SignupRequest) => {
      const response = await apiClient.post("/auth/register", formData);
      showToast(response.data.message, "success");
      navigate("/auth/login");
      return null;
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        if (err.response.data.errors) {
          return err.response.data.errors;
        }
        const errMsg = handleAxiosError(
          err,
          "회원가입 중 알 수 없는 오류가 발생했습니다."
        );
        return errMsg;
      }
      const errMsg = handleAxiosError(
        err,
        "회원가입 중 알 수 없는 오류가 발생했습니다."
      );
      return errMsg;
    },
  });

  const register = useCallback(
    async (
      formData: SignupRequest
    ): Promise<string | { [key: string]: string } | null> => {
      return await registerMutation.mutateAsync(formData);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
    queryClient.setQueryData(["currentUserProfile"], null);
    window.dispatchEvent(new Event("loginStatusChange"));
    navigate("/");
  }, [navigate, queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: FormData) => {
      const response = await apiClient.put<{
        user: UserProfile;
        message: string;
      }>("/mypage/profile-edit", updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUserProfile"], data.user);
      showToast(data.message, "success");
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["teamPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myComments"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["teamPost"] });
    },
    onError: (err) => {
      const errMsg = handleAxiosError(err, "프로필 수정에 실패했습니다.");
      showToast(errMsg, "error");
    },
  });

  const updateProfile = useCallback(
    async (updateData: FormData): Promise<boolean> => {
      try {
        await updateProfileMutation.mutateAsync(updateData);
        return true;
      } catch {
        return false;
      }
    },
    [updateProfileMutation]
  );

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: ChangePasswordRequest) => {
      const response = await apiClient.put(
        "/mypage/change-password",
        passwordData
      );
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message, "success");
    },
    onError: (err) => {
      const errMsg = handleAxiosError(err, "비밀번호 변경에 실패했습니다.");
      showToast(errMsg, "error");
    },
  });

  const changePassword = useCallback(
    async (passwordData: ChangePasswordRequest): Promise<boolean> => {
      try {
        await changePasswordMutation.mutateAsync(passwordData);
        return true;
      } catch {
        return false;
      }
    },
    [changePasswordMutation]
  );

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete("/mypage/delete");
      return true;
    },
    onSuccess: () => {
      showToast("정상적으로 탈퇴되었습니다.", "success");
      logout();
    },
    onError: (err) => {
      const errMsg = handleAxiosError(err, "회원 탈퇴에 실패했습니다.");
      showToast(errMsg, "error");
    },
  });

  const deleteUser = useCallback(async (): Promise<boolean> => {
    if (deleteUserMutation.isPending) return false;
    try {
      await deleteUserMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteUserMutation]);

  const issueTemporaryPasswordMutation = useMutation({
    mutationFn: async (credentials: { email: string; name: string }) => {
      const response = await apiClient.post(
        "/auth/password/issue-temp",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message, "success");
    },
    onError: (err) => {
      const errMsg = handleAxiosError(
        err,
        "임시 비밀번호 발급에 실패했습니다."
      );
      showToast(errMsg, "error");
    },
  });

  const issueTemporaryPassword = useCallback(
    async (email: string, name: string): Promise<boolean> => {
      if (issueTemporaryPasswordMutation.isPending) return false;
      try {
        await issueTemporaryPasswordMutation.mutateAsync({ email, name });
        return true;
      } catch {
        return false;
      }
    },
    [issueTemporaryPasswordMutation]
  );

  const loading =
    isLoadingProfile ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending ||
    deleteUserMutation.isPending ||
    issueTemporaryPasswordMutation.isPending;

  const error = isErrorProfile
    ? errorProfile?.message
    : loginMutation.isError ||
      registerMutation.isError ||
      updateProfileMutation.isError ||
      changePasswordMutation.isError ||
      deleteUserMutation.isError ||
      issueTemporaryPasswordMutation.isError
    ? "서버 오류 또는 알 수 없는 오류가 발생했습니다."
    : null;

  return {
    isLoggedIn,
    userId,
    currentUserProfile: currentUserProfile || null,
    loading,
    error,
    login,
    register,
    logout,
    fetchUserProfile: refetchUserProfile,
    updateProfile,
    deleteUser,
    changePassword,
    issueTemporaryPassword,
    handleAxiosError,
    navigate,
  };
};
