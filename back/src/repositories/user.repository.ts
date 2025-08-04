// src/zip/repositories/user.repository.ts
import { User, UserRole } from "@prisma/client";
import prisma from "../utils/prisma"; // ✨ 이 부분을 확인하고, 이 import를 클래스 밖으로 옮겨 직접 사용합니다. ✨

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  agreement: boolean;
  introduction?: string;
  profileImage?: string;
  role?: UserRole;
}

export interface UserUpdateData {
  nickname?: string; // nickname 필드를 선택적으로 변경
  introduction?: string;
  profileImage?: string; // profileImage 필드를 추가
}

export interface UpdatePasswordData {
  password: string;
}

class UserRepository {
  // ✨ constructor를 제거합니다. prisma 인스턴스를 직접 import하여 사용합니다. ✨
  // constructor() {
  //   this.prisma = prisma; // 이렇게 초기화해도 되지만, 일반적으로는 직접 import해서 사용합니다.
  // }

  // 이메일로 사용자 찾기
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } }); // ✨ this.prisma 대신 prisma 직접 사용 ✨
  }

  // 닉네임으로 사용자 찾기
  async findByNickname(nickname: string) {
    return await prisma.user.findFirst({
      where: {
        nickname: nickname,
      },
    });
  }

  // 전화번호로 사용자 찾기 추가 (정규화 포함)
  async findByPhone(phone: string) {
    const normalizedPhone = phone.replace(/[^0-9]/g, "");
    return await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
      },
    });
  }

  // 사용자 ID로 사용자 찾기
  async findById(userId: number) {
    return await prisma.user.findUnique({
      where: { userId },
    });
  }

  // 비밀번호 찾기
  async findByPasswordByUserId(userId: number) {
    return await prisma.user.findUnique({
      where: { userId },
    });
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
        profileImage: userData.profileImage,
        introduction: userData.introduction,
      },
    });
  }

  // 유저 정보 수정
  async updateUser(userId: number, updateData: UserUpdateData) {
    return await prisma.user.update({
      // ✨ this.prisma 대신 prisma 직접 사용 ✨
      where: { userId },
      data: updateData,
    });
  }

  // 비밀번호 전용 업데이트
  async updateUserPassword(userId: number, passwordData: UpdatePasswordData) {
    return await prisma.user.update({
      // ✨ this.prisma 대신 prisma 직접 사용 ✨
      where: { userId },
      data: {
        password: passwordData.password,
      },
    });
  }

  async findByEmailAndName(email: string, name: string) {
    return await prisma.user.findFirst({
      // ✨ this.prisma 대신 prisma 직접 사용 ✨
      where: {
        email: email,
        name: name,
      },
    });
  }

  // 사용자 삭제
  async deleteUser(userId: number) {
    // ✨ 이 부분이 핵심적인 수정입니다. ✨
    console.log(`Attempting to delete user with ID: ${userId}`);
    const result = await prisma.user.delete({
      // ✨ this.prisma 대신 prisma 직접 사용 ✨
      where: { userId },
    });
    console.log(
      `Successfully deleted user with ID: ${userId}, count: ${result ? 1 : 0}`
    ); // 삭제 여부 확인
    // deleteMany는 count를 반환하지만, delete는 삭제된 레코드를 반환하거나 오류를 던집니다.
    // 여기서는 성공하면 에러를 던지지 않고, 호출하는 쪽에서 삭제 여부를 판단할 수 있도록 합니다.
  }

  // 모든 사용자 조회 (관리자용)
  async findAllUsers() {
    return await prisma.user.findMany({
      // ✨ this.prisma 대신 prisma 직접 사용 ✨
      orderBy: { createdAt: "desc" },
    });
  }

  // 사용자 수 조회
  async countUsers() {
    return await prisma.user.count(); // ✨ this.prisma 대신 prisma 직접 사용 ✨
  }

  // 이메일과 사용자명 중복 체크 (한 번에)
  async checkDuplicates(email: string, nickname: string) {
    const [emailUser, nicknameUser] = await Promise.all([
      this.findByEmail(email),
      this.findByNickname(nickname),
    ]);

    return {
      emailExists: !!emailUser,
      usernameExists: !!nicknameUser,
    };
  }
}

export default new UserRepository();
