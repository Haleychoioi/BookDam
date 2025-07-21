import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse, JWTPayload, UpdateProfileRequest } from '../types/user.type';

class UserService {

  // 회원가입
  async signUp(signupData: SignupRequest): Promise<SignupResponse> {
    const { name, email, password, nickname, phone, agreement, introduction } = signupData;

    // 1. 이메일 중복 확인
    const existingEmailUser = await userRepository.findByEmail(email);
    if (existingEmailUser) {
      throw new Error('ExistEmail');  // 에러 미들웨어에서 처리
    }

    // 3. 비밀번호 해싱
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. 사용자 생성
    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      nickname,
      phone,
      agreement,
      introduction,
      role: UserRole.USER
    });

    // 5. 응답 (비밀번호 제외) - 구조 분해 할당 사용
    const { password: _, ...userWithoutPassword } = newUser;
    // 제외하는것, 나머지 모든것(password를 제외한 나머지 필드를 새 객체로 생성)
    // _는 사용하지 않는 변수를 표현

    return {
      user: userWithoutPassword, // 타입이 자동으로 맞춰짐
      message: '회원가입이 성공적으로 완료되었습니다.'
    };
  }

  // 로그인
  async login(loginData: LoginRequest): Promise<LoginResponse> {
        const { email, password } = loginData;

        // 1. 사용자 존재 확인
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 2. 비밀번호 검증
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 3. JWT 토큰 생성
        const tokenPayload: JWTPayload = {
            userId: user.userId,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        // 4. 응답 (비밀번호 제외)
        // const { password: _, ...userWithoutPassword } = user;

        return {
            token,
            userId: user.userId,
            message: '로그인이 성공적으로 완료되었습니다.'
        };
    }

    // 내 정보 조회
    async getMyProfile(userId: number) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 제외하고 반환
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 프로필 업데이트
    async updateProfile(userId: number, updateData: UpdateProfileRequest) {
        // 닉네임 중복 체크 (변경하려는 경우)
        if (updateData.nickname) {
            const existingUser = await userRepository.findByNickname(updateData.nickname);
            if (existingUser && existingUser.userId !== userId) {
                throw new Error('이미 존재하는 닉네임입니다.');
            }
        }

        const updatedUser = await userRepository.updateUser(userId, updateData);
        
        // 비밀번호 제외하고 반환
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    // 비밀번호 변경
    // async changePassword(userId: number, oldPassword: string, newPassword: string) {
    //     // 1. 현재 사용자 정보 조회
    //     const user = await userRepository.findById(userId);
    //     if (!user) {
    //         throw new Error('사용자를 찾을 수 없습니다.');
    //     }

    //     // 2. 기존 비밀번호 확인
    //     const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    //     if (!isValidPassword) {
    //         throw new Error('현재 비밀번호가 올바르지 않습니다.');
    //     }

    //     // 3. 새 비밀번호 해싱
    //     const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    //     const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    //     // 4. 비밀번호 업데이트
    //     await userRepository.updateUser(userId, { password: hashedNewPassword });

    //     return {
    //         message: '비밀번호가 성공적으로 변경되었습니다.'
    //     };
    // }

    // 사용자 통계 (관리자용)
    async getUserStats() {
        const totalUsers = await userRepository.countUsers();
        const allUsers = await userRepository.findAllUsers();
        
        return {
            totalUsers,
            recentUsers: allUsers.slice(0, 10) // 최근 10명
        };
    }

}

export default new UserService();