import { User, UserRole } from '@prisma/client'

// ===== 회원가입 관련 =====

// 회원가입 요청
export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    nickname: string;
    phone: string;
    agreement: boolean;
    profileImage: string;
    introduction?: string;
}

// 회원가입 성공 응답
export interface SignupResponse {
    message: string;
    user: Omit<User, 'password'>;
}

// ===== 로그인 관련 =====

// 로그인 요청
export interface LoginRequest {
    email: string;
    password: string;
}

// 로그인 성공 응답 (JWT 토큰 포함)
export interface LoginResponse {
  token: string;
  userId: number;
  message: string;
//   user: Omit<User, 'password'>;
}

// ===== 사용자 정보 수정 =====

export interface UpdateUserData {
    nickname: string;
    introduction?: string;
    profileImage?: string;
    deleteProfileImage?: string;
}

export interface UpdatePasswordData {
    password: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordResponse {
    message: string;
}

// ===== JWT 관련 =====

// JWT 페이로드 (사용자 ID, 역할 포함)
export interface JWTPayload {
    userId: number;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
