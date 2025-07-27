import { User, UserRole } from '@prisma/client';
import prisma from "../utils/prisma";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  agreement: boolean;
  introduction?: string;
  role?: UserRole
}

export interface UserUpdateData {
  nickname: string;
  introduction?: string;
}


class UserRepository {

  // 이메일로 사용자 찾기
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  // 닉네임으로 사용자 찾기
  async findByNickname(nickname: string) {
    return await prisma.user.findFirst({
      where: {
        nickname: nickname
      }
    });
  }

  // 사용자 ID로 사용자 찾기
  async findById(userId: number) {
    return await prisma.user.findUnique({
      where: { userId }
    });
  }

  // 비밀번호 찾기
  async findByPassword(userId: number) {
    return await prisma.user.findUnique({
      where: { userId }
    })
  }

  // 새 사용자 생성
  async createUser(userData: CreateUserData) {
  return await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || UserRole.USER,
      nickname: userData.nickname,
      agreement: userData.agreement,
      introduction: userData.introduction,
    }
  });
}

  // 유저 정보 수정
  async updateUser(userId: number, updateData: UserUpdateData) {
  return await prisma.user.update({
    where: { userId },
    data: updateData,
  });
}

  // 사용자 삭제
  async deleteUser(userId: number) {
    return await prisma.user.delete({
      where: { userId }
    });
  }

  // 모든 사용자 조회 (관리자용)
  async findAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // 사용자 수 조회
  async countUsers() {
    return await prisma.user.count();
  }

  // 이메일과 사용자명 중복 체크 (한 번에)
  async checkDuplicates(email: string, nickname: string) {
    const [emailUser, nicknameUser] = await Promise.all([
      this.findByEmail(email),
      this.findByNickname(nickname)
    ]);

    return {
      emailExists: !!emailUser,
      usernameExists: !!nicknameUser
    };
  }

}


export default new UserRepository();


// Promise사용안해도 TypeScript가 자동으로 인식
// async findByUsername(username: string): Promise<User | null> {
//     return await prisma.user.findUnique({ where: { username } });
// }