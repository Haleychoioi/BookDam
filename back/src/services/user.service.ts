import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse, JWTPayload, UpdateUserData } from '../types/user.type';

class UserService {

    // 회원가입
    async signUp(signupData: SignupRequest): Promise<SignupResponse> {
        const { name, email, password, nickname, phone, agreement, introduction } = signupData;

        // 1. 이메일 중복 확인
        const existingEmailUser = await userRepository.findByEmail(email);
        if (existingEmailUser) {
            throw new Error('ExistEmail');
        }

        // 2. 닉네임 중복 확인
        const existingNickname = await userRepository.findByNickname(nickname);
        if (existingNickname) {
            throw new Error('ExistNickname');
        }

        // 3. 비밀번호 해싱
        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 기본 프로필 이미지 설정
        const avatarName = encodeURIComponent(nickname) // 닉네임에 따라 고유한 아바타 생성
        const profileImage = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarName}`;

        // 4. 사용자 생성
        const newUser = await userRepository.createUser({
            name,
            email,
            password: hashedPassword,
            nickname,
            phone,
            agreement,
            introduction,
            profileImage,
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
            throw new Error('UserNotFound');
        }

        // 2. 비밀번호 검증
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('PasswordValidation');
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
            throw new Error('UserNotFound');
        }

        // 비밀번호 제외하고 반환
        const { password, agreement, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 회원정보 수정
    async updateProfile(userId: number, updateData: UpdateUserData, file: Express.Multer.File | undefined) {

        // DB에 업데이트할 내용만 담을 빈 객체
        const dataToUpdate: Partial<UpdateUserData> = {};

        // 닉네임 중복 체크 (변경하려는 경우)
        if (updateData.nickname) {
            const existingUser = await userRepository.findByNickname(updateData.nickname);
            if (existingUser && existingUser.userId !== userId) {
                throw new Error('ExistNickname');
            }
            dataToUpdate.nickname = updateData.nickname;
        }

        // 소개글
        if (updateData.introduction) {
            dataToUpdate.introduction = updateData.introduction;
        }

        // 기본 이미지로 변경
        if (updateData.deleteProfileImage === 'true') {
            const currentUser = await userRepository.findById(userId);
            if (!currentUser) throw new Error('UserNotFound');

            const avatarName = encodeURIComponent(currentUser.nickname);
            const defaultImageUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarName}`;

            dataToUpdate.profileImage = defaultImageUrl;
        }

        // 파일 업로드
        if (file) {
            // 주의: 3000부분은 배포 시 서버 주소로 변경해야함
            const fileUrl = `http://localhost:3000/static/images/${file.filename}`;
            dataToUpdate.profileImage = fileUrl;
        }

        const updatedUser = await userRepository.updateUser(userId, dataToUpdate as UpdateUserData);

        // 비밀번호 제외하고 반환
        const { password, agreement, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }


    // 유저 삭제
    async deleteUser(userId: number) {
        const existingUser = await userRepository.findById(userId);

        if (!existingUser) {
            throw new Error('UserNotFound');
        }

        await userRepository.deleteUser(userId);

        return {
            message: "유저 삭제"
        }
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