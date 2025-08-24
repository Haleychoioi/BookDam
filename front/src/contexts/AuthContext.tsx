import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import apiClient from '../api/apiClient';
import type { UserProfile } from '../types/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAuthState: () => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 인증 상태 확인 함수
  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');
    
    if (token && storedUserId) {
      const newUserId = Number(storedUserId);
      setIsLoggedIn(true);
      setUserId(newUserId);
      return true;
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setCurrentUserProfile(null);
      return false;
    }
  };

  // 사용자 프로필 가져오기
  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get<{ user: UserProfile; message: string }>('/mypage/getProfile');
      setCurrentUserProfile(response.data.user);
      setError(null);
    } catch (err) {
      console.error('프로필 가져오기 실패:', err);
      setError('프로필을 가져오는데 실패했습니다.');
      // 프로필 가져오기 실패 시 로그아웃 처리
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태 업데이트
  const updateAuthState = () => {
    if (checkAuthStatus()) {
      fetchUserProfile();
    }
  };

  // 인증 상태 초기화
  const clearAuthState = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentUserProfile(null);
    setError(null);
    
    // 모든 React Query 캐시 초기화
    queryClient.clear();
    
    // 특정 쿼리들 무효화
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    queryClient.invalidateQueries({ queryKey: ['allCommunities'] });
    queryClient.invalidateQueries({ queryKey: ['bestsellers'] });
    queryClient.invalidateQueries({ queryKey: ['newBooks'] });
    queryClient.invalidateQueries({ queryKey: ['specialNewBooks'] });
    queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    queryClient.invalidateQueries({ queryKey: ['teamPosts'] });
    queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    queryClient.invalidateQueries({ queryKey: ['myComments'] });
    queryClient.invalidateQueries({ queryKey: ['post'] });
    queryClient.invalidateQueries({ queryKey: ['teamPost'] });
    queryClient.invalidateQueries({ queryKey: ['appliedCommunities'] });
    queryClient.invalidateQueries({ queryKey: ['participatingCommunities'] });
    queryClient.invalidateQueries({ queryKey: ['recruitingCommunities'] });
    
    navigate('/');
  };

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, userId: newUserId, message } = response.data;
      
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userId', newUserId.toString());
      
      setIsLoggedIn(true);
      setUserId(newUserId);
      
      // 프로필 가져오기
      await fetchUserProfile();
      
      // 토스트는 각 페이지에서 처리하도록 제거
      // showToast(message, 'success');
      navigate('/');
      return true;
    } catch (err: any) {
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (err.response?.data?.errorMessage) {
        errorMessage = err.response.data.errorMessage;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // 에러 토스트는 각 페이지에서 처리하도록 제거
      // showToast(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    // 토스트는 각 페이지에서 처리하도록 제거
    // showToast('로그아웃 되었습니다.', 'success');
    clearAuthState();
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // userId가 변경될 때 프로필 가져오기
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // 윈도우 포커스 시 인증 상태 재확인
  useEffect(() => {
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const value: AuthContextType = {
    isLoggedIn,
    userId,
    currentUserProfile,
    loading,
    error,
    login,
    logout,
    updateAuthState,
    clearAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
