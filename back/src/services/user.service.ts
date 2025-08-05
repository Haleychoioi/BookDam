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
    email: string,
    temporaryPassword: string,
    userName: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "bookDam 임시 비밀번호 안내",
      html: `
                <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #ffbd42; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 500; letter-spacing: 2px;">
                bookDam
            </h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">
                당신의 독서 여정을 함께합니다
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                임시 비밀번호 안내
            </h2>
            
            <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
    안녕하세요, <strong style="color: #333333;">${userName} </strong>님.
            </p>
            
            <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                비밀번호 재설정을 위한 임시 비밀번호를 발급해드렸습니다.<br>
                보안을 위해 로그인 후 즉시 새로운 비밀번호로 변경해주세요.
            </p>
            
            <!-- Password Box -->
            <div style="background-color: #fffaf5; border: 2px solid #ffbd42; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="color: #ff9500; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    임시 비밀번호
                </p>
                <p style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #333333; margin: 0; letter-spacing: 3px; word-break: break-all;">
                   ${temporaryPassword}  // ← 실제 생성된 임시 비밀번호
                </p>
            </div>
            
            <!-- Warning Box -->
            <div style="background-color: #fff8f0; border-left: 4px solid #ff9500; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #ff9500; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">
                    ⚠️ 보안 안내
                </p>
                <p style="color: #666666; margin: 0; font-size: 14px; line-height: 1.5;">
                    • 보안을 위해 로그인 후 새로운 비밀번호로 변경해주세요
                </p>
            </div>
            
            <!-- Login Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="http://localhost:5173/auth/login" style="display: inline-block; background-color: #ffbd42; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 189, 66, 0.4); transition: all 0.3s ease;">
                    로그인하기
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                문의사항이 있으시면 언제든 연락해주세요.
            </p>
            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                © 2025 bookDam. All rights reserved.<br>
                이 이메일은 발신전용입니다.
            </p>
        </div>
    </div>
</body>
            `,
    };

    // sendMail은 Promise를 반환해서 함수 자체가 async여야함
    await this.transporter.sendMail(mailOptions);
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
      return Promise.reject(error);
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
      return Promise.reject(error);
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
      return Promise.reject(error);
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
