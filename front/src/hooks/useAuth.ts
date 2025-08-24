// src/hooks/useAuth.ts

import { useAuthContext } from '../contexts/AuthContext';
import type {
  SignupRequest,
  ChangePasswordRequest,
} from "../types";
import type { QueryObserverResult } from "@tanstack/react-query";

interface AuthResult {
  isLoggedIn: boolean;
  userId: number | null;
  currentUserProfile: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    formData: SignupRequest
  ) => Promise<string | { [key: string]: string } | null>;
  logout: () => void;
  fetchUserProfile: () => Promise<QueryObserverResult<any, Error>>;
  updateProfile: (updateData: FormData) => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<boolean>;
  issueTemporaryPassword: (email: string, name: string) => Promise<boolean>;
  handleAxiosError: (err: unknown, defaultMsg: string) => string;
  navigate: any;
}

export const useAuth = (): AuthResult => {
  const authContext = useAuthContext();
  
  // 기존 API와의 호환성을 위한 더미 함수들
  const register = async () => {
    console.warn('register 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return null;
  };

  const fetchUserProfile = async () => {
    console.warn('fetchUserProfile 함수는 AuthContext에서 지원되지 않습니다. currentUserProfile을 직접 사용하세요.');
    return {} as QueryObserverResult<any, Error>;
  };

  const updateProfile = async () => {
    console.warn('updateProfile 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return false;
  };

  const deleteUser = async () => {
    console.warn('deleteUser 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return false;
  };

  const changePassword = async () => {
    console.warn('changePassword 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return false;
  };

  const issueTemporaryPassword = async () => {
    console.warn('issueTemporaryPassword 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return false;
  };

  const handleAxiosError = () => {
    console.warn('handleAxiosError 함수는 AuthContext에서 지원되지 않습니다. 직접 구현해주세요.');
    return '오류가 발생했습니다.';
  };

  return {
    ...authContext,
    register,
    fetchUserProfile,
    updateProfile,
    deleteUser,
    changePassword,
    issueTemporaryPassword,
    handleAxiosError,
    navigate: null, // useNavigate는 컴포넌트에서 직접 사용해야 합니다
  };
};
