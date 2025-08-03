// src/services/user.service.ts (수정된 전체 코드)

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  UserRole,
  TeamRole,
  CommunityStatus,
  TeamMember,
} from "@prisma/client";
import userRepository from "../repositories/user.repository";
import { TeamMemberRepository } from "../repositories/team-members.repository";
import { CommunityRepository } from "../repositories/communities.repository";
import { PostRepository } from "../repositories/posts.repository";

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
import {
  MultiDuplicateError,
  CustomError,
} from "../middleware/error-handing-middleware";

interface CommunityHistoryEntry {
  communityName: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: "활동중" | "활동종료" | "모집중" | "알 수 없음";
}

export default class UserService {
  private teamMemberRepository: TeamMemberRepository;
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.teamMemberRepository = new TeamMemberRepository();
    this.communityRepository = new CommunityRepository();
    this.postRepository = new PostRepository();

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

  generateTemporaryPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async sendTemporaryPasswordEmail(
    // ✨ async 키워드 추가 ✨
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

    // sendMail은 Promise를 반환하므로, 함수 자체가 async여야 합니다.
    await this.transporter.sendMail(mailOptions); // ✨ await 키워드 추가 (선택 사항이지만 명확성을 위해) ✨
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, "");
  }

  async signUp(signupData: SignupRequest): Promise<SignupResponse> {
    const { name, email, password, nickname, phone, agreement, introduction } =
      signupData;

    const normalizedPhone = this.normalizePhoneNumber(phone);

    const duplicateErrors: { [key: string]: string } = {};

    const existingEmailUser = await userRepository.findByEmail(email);
    if (existingEmailUser) {
      duplicateErrors.email = "가입된 이메일 존재";
    }

    const existingNickname = await userRepository.findByNickname(nickname);
    if (existingNickname) {
      duplicateErrors.nickname = "사용중인 닉네임";
    }

    const existingPhoneUser = await userRepository.findByPhone(normalizedPhone);
    if (existingPhoneUser) {
      duplicateErrors.phone = "이미 가입된 전화번호입니다.";
    }

    if (Object.keys(duplicateErrors).length > 0) {
      throw new MultiDuplicateError(duplicateErrors);
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const avatarName = encodeURIComponent(nickname);
    const profileImage = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarName}`;

    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      nickname,
      phone: normalizedPhone,
      agreement,
      introduction,
      profileImage,
      role: UserRole.USER,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      message: "회원가입이 성공적으로 완료되었습니다.",
    };
  }

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

  async findPassword(
    email: string,
    name: string
  ): Promise<{ message: string }> {
    const user = await userRepository.findByEmailAndName(email, name);
    if (!user) {
      throw new Error("UserNotFound");
    }

    const temporaryPassword = this.generateTemporaryPassword();

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedTemporaryPassword = await bcrypt.hash(
      temporaryPassword,
      saltRounds
    );

    await userRepository.updateUserPassword(user.userId, {
      password: hashedTemporaryPassword,
    });

    await this.sendTemporaryPasswordEmail(email, temporaryPassword, user.name);

    return {
      message:
        "임시 비밀번호가 이메일로 전송되었습니다. 로그인 후 비밀번호를 변경해주세요.",
    };
  }

  async getMyProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("UserNotFound");
    }

    const { password, agreement, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: number,
    updateData: UpdateUserData,
    file: Express.Multer.File | undefined
  ) {
    const dataToUpdate: Partial<UpdateUserData> = {};

    if (updateData.nickname) {
      const existingUser = await userRepository.findByNickname(
        updateData.nickname
      );
      if (existingUser && existingUser.userId !== userId) {
        throw new Error("ExistNickname");
      }
      dataToUpdate.nickname = updateData.nickname;
    }

    if (updateData.introduction) {
      dataToUpdate.introduction = updateData.introduction;
    }

    if (updateData.deleteProfileImage === "true") {
      const currentUser = await userRepository.findById(userId);
      if (!currentUser) throw new Error("UserNotFound");

      const avatarName = encodeURIComponent(currentUser.nickname);
      const defaultImageUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarName}`;

      dataToUpdate.profileImage = defaultImageUrl;
    }

    if (file) {
      const fileUrl = `http://localhost:3000/static/images/${file.filename}`;
      dataToUpdate.profileImage = fileUrl;
    }

    try {
      const updatedUser = await userRepository.updateUser(
        userId,
        dataToUpdate as UpdateUserData
      );
      const { password, agreement, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      return Promise.reject(error); // ✨ 수정: 명시적으로 Promise.reject 반환 ✨
    }
  }

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

    try {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      await userRepository.updateUserPassword(user.userId, {
        password: hashedNewPassword,
      });

      return {
        message: "비밀번호가 성공적으로 변경되었습니다.",
      };
    } catch (error) {
      return Promise.reject(error); // ✨ 수정: 명시적으로 Promise.reject 반환 ✨
    }
  }

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

    try {
      await userRepository.deleteUser(userId);
      return {
        message: "유저 삭제가 완료되었습니다.",
      };
    } catch (error) {
      return Promise.reject(error); // ✨ 수정: 명시적으로 Promise.reject 반환 ✨
    }
  }

  public async getCommunityHistory(
    userId: number
  ): Promise<CommunityHistoryEntry[]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new CustomError(404, "User not found.");
    }

    const memberships =
      await this.teamMemberRepository.findManyMembershipsByUserId(userId);

    const history: CommunityHistoryEntry[] = [];

    for (const membership of memberships) {
      const community = membership.team;

      // '모집중' 상태의 커뮤니티는 이력에 포함하지 않습니다.
      if (community.status === CommunityStatus.RECRUITING) {
        continue;
      }

      let communityStatus: "활동중" | "활동종료" | "모집중" | "알 수 없음";
      let endDate: string | undefined;

      if (community.status === CommunityStatus.ACTIVE) {
        communityStatus = "활동중";
        endDate = undefined;
      } else if (
        community.status === CommunityStatus.CLOSED ||
        community.status === CommunityStatus.COMPLETED
      ) {
        communityStatus = "활동종료";
        endDate = community.createdAt.toISOString();
      } else {
        communityStatus = "알 수 없음";
        endDate = undefined;
      }

      history.push({
        communityName: community.postTitle,
        role: membership.role === TeamRole.LEADER ? "host" : "member",
        startDate: community.createdAt.toISOString(),
        endDate: endDate,
        status: communityStatus,
      });
    }

    return history;
  }
}
