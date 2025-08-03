// src/services/user.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { UserRole } from "@prisma/client";
import userRepository from "../repositories/user.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  JWTPayload,
  UpdateUserData,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/user.type";
import { MultiDuplicateError } from "../middleware/error-handing-middleware";

class UserService {
  private teamMemberRepository: TeamMemberRepository;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.teamMemberRepository = new TeamMemberRepository();

    // 이메일 transporter 설정
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 임시 비밀번호 생성 (8자리 영문+숫자)
  generateTemporaryPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      // ✨ for 루프 조건 수정: i = 8 -> i < 8 ✨
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 임시 비밀번호 이메일 전송
  async sendTemporaryPasswordEmail(
    email: string,
    temporaryPassword: string,
    userName: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "임시 비밀번호 안내",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">임시 비밀번호 안내</h2>
                    <p>안녕하세요, <strong>${userName}</strong>님.</p>
                    <p>요청하신 임시 비밀번호는 다음과 같습니다. 로그인 후 반드시 비밀번호를 변경해주세요.</p>
                    <p style="font-size: 18px; font-weight: bold; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                        <strong>${temporaryPassword}</strong>
                    </p>
                </div>
            `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // ✨ 전화번호 정규화 헬퍼 함수 추가 ✨
  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, ""); // 숫자 이외의 문자 제거
  }

  // 회원가입
  async signUp(signupData: SignupRequest): Promise<SignupResponse> {
    const { name, email, password, nickname, phone, agreement, introduction } =
      signupData;

    // ✨ 전화번호 정규화 ✨
    const normalizedPhone = this.normalizePhoneNumber(phone);

    // ✨ 다중 중복 오류를 수집할 객체 ✨
    const duplicateErrors: { [key: string]: string } = {};

    const existingEmailUser = await userRepository.findByEmail(email);
    if (existingEmailUser) {
      duplicateErrors.email = "가입된 이메일 존재";
    }

    const existingNickname = await userRepository.findByNickname(nickname);
    if (existingNickname) {
      duplicateErrors.nickname = "사용중인 닉네임";
    }

    // ✨ 정규화된 전화번호로 중복 검사 ✨
    const existingPhoneUser = await userRepository.findByPhone(normalizedPhone);
    if (existingPhoneUser) {
      duplicateErrors.phone = "이미 가입된 전화번호입니다.";
    }

    // ✨ 중복 오류가 하나라도 있다면 MultiDuplicateError throw ✨
    if (Object.keys(duplicateErrors).length > 0) {
      throw new MultiDuplicateError(duplicateErrors);
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const avatarName = encodeURIComponent(nickname); // 닉네임에 따라 고유한 아바타 생성
    const profileImage = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarName}`;

    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      nickname,
      phone: normalizedPhone, // ✨ 정규화된 전화번호 저장 ✨
      agreement,
      introduction,
      profileImage,
      role: UserRole.USER,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    // 제외하는것, 나머지 모든것(password를 제외한 나머지 필드를 새 객체로 생성)
    // _는 사용하지 않는 변수를 표현

    return {
      user: userWithoutPassword, // 타입이 자동으로 맞춰짐
      message: "회원가입이 성공적으로 완료되었습니다.",
    };
  }

  // 로그인
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginData;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("UserNotFound");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("PasswordValidation");
    }

    const tokenPayload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    return {
      token,
      userId: user.userId,
      message: "로그인이 성공적으로 완료되었습니다.",
    };
  }

  // 비밀번호 찾기 - 임시 비밀번호 발급
  async findPassword(
    email: string,
    name: string
  ): Promise<{ message: string }> {
    // 이메일과 이름으로 사용자 확인
    const user = await userRepository.findByEmailAndName(email, name);
    if (!user) {
      throw new Error("UserNotFound");
    }

    // 임시 비밀번호 생성
    const temporaryPassword = this.generateTemporaryPassword();

    // 임시 비밀번호 해싱
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedTemporaryPassword = await bcrypt.hash(
      temporaryPassword,
      saltRounds
    );

    // DB에 임시 비밀번호 저장
    await userRepository.updateUserPassword(user.userId, {
      password: hashedTemporaryPassword,
    });

    // 이메일로 임시 비밀번호 전송 (사용자 이름 포함)
    await this.sendTemporaryPasswordEmail(email, temporaryPassword, user.name);

    return {
      message:
        "임시 비밀번호가 이메일로 전송되었습니다. 로그인 후 비밀번호를 변경해주세요.",
    };
  }

  // 내 정보 조회
  async getMyProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("UserNotFound");
    }

    // 비밀번호 제외하고 반환
    const { password, agreement, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 회원정보 수정
  async updateProfile(
    userId: number,
    updateData: UpdateUserData,
    file: Express.Multer.File | undefined
  ) {
    // DB에 업데이트할 내용만 담을 빈 객체
    const dataToUpdate: Partial<UpdateUserData> = {};

    // 닉네임 중복 체크 (변경하려는 경우)
    if (updateData.nickname) {
      const existingUser = await userRepository.findByNickname(
        updateData.nickname
      );
      if (existingUser && existingUser.userId !== userId) {
        throw new Error("ExistNickname");
      }
      dataToUpdate.nickname = updateData.nickname;
    }

    // 소개글
    if (updateData.introduction) {
      dataToUpdate.introduction = updateData.introduction;
    }

    // 기본 이미지로 변경
    if (updateData.deleteProfileImage === "true") {
      const currentUser = await userRepository.findById(userId);
      if (!currentUser) throw new Error("UserNotFound");

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

    const updatedUser = await userRepository.updateUser(
      userId,
      dataToUpdate as UpdateUserData
    );

    // 비밀번호 제외하고 반환
    const { password, agreement, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // 비밀번호 변경
  async changePassword(
    userId: number,
    passwordData: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new Error("PasswordFieldRequired");
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error("PasswordMismatch");
    }

    if (newPassword.length < 8) {
      throw new Error("PasswordTooShort");
    }

    if (currentPassword === newPassword) {
      throw new Error("PasswordSame");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("UserNotFound");
    }

    const isValidCurrentPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidCurrentPassword) {
      throw new Error("CurrentPasswordMismatch");
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await userRepository.updateUserPassword(user.userId, {
      password: hashedNewPassword,
    });

    return {
      message: "비밀번호가 성공적으로 변경되었습니다.",
    };
  }

  // 유저 삭제
  async deleteUser(userId: number) {
    const existingUser = await userRepository.findById(userId);

    if (!existingUser) {
      throw new Error("UserNotFound");
    }

    const leaderMembership =
      await this.teamMemberRepository.findLeaderMembershipByUserId(userId);

    if (leaderMembership) {
      throw new Error("LeaderCannotWithdraw");
    }

    await userRepository.deleteUser(userId);

    return {
      message: "유저 삭제가 완료되었습니다.",
    };
  }
}

export default new UserService();
