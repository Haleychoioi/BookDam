import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

// 사용자 등록 시 필요한 데이터 타입을 정의합니다.
interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  introduction?: string;
  agreement: boolean;
}

export const authService = {
  // 사용자 회원가입 로직 (JWT 토큰 반환 추가)
  async register(userData: RegisterUserData) {
    const { email, password, name, nickname, phone, introduction, agreement } =
      userData;

    // 1. 이메일 중복 확인
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new Error("이미 사용 중인 이메일입니다.");
    }

    // 2. 닉네임 중복 확인
    const existingUserByNickname = await prisma.user.findUnique({
      where: { nickname },
    });
    if (existingUserByNickname) {
      throw new Error("이미 사용 중인 닉네임입니다.");
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        phone,
        introduction,
        agreement,
        role: UserRole.USER,
      },
    });

    // 5. JWT 토큰 생성 (로그인 로직과 동일)
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
    }
    const token = jwt.sign(
      {
        userId: newUser.userId,
        email: newUser.email,
        nickname: newUser.nickname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    // 비밀번호를 제외한 사용자 정보와 생성된 토큰 반환
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  },

  // 사용자 로그인 로직
  async login(email: string, password: string) {
    // 1. 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 2. 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 3. JWT 토큰 생성
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    // 민감한 정보(비밀번호)를 제외한 사용자 정보와 토큰 반환
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },
};
