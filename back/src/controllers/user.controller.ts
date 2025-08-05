import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import { SignupRequest, LoginRequest } from "../types/user.type";
import { CustomError } from "../middleware/error-handing-middleware";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(); 
  }

  // 회원가입
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signupData: SignupRequest = req.body;
      const result = await this.userService.signUp(signupData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };


  // 로그인
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginRequest = req.body;
      const result = await this.userService.login(loginData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };


  // 내 정보 조회
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      const userProfile = await this.userService.getMyProfile(userId);

      res.status(200).json({
        user: userProfile,
        message: "내 정보 조회 성공",
      });
    } catch (error) {
      next(error);
    }
  };


  // 프로필 업데이트 (닉네임, 한줄소개, 이미지)
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      const updateData = req.body;
      const file = req.file;

      const updatedUser = await this.userService.updateProfile(
        userId,
        updateData,
        file
      );

      res.status(200).json({
        user: updatedUser,
        message: "프로필이 성공적으로 업데이트되었습니다",
      });
    } catch (error) {
      next(error);
    }
  };


  // 비밀번호 변경
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      const result = await this.userService.changePassword(userId, {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };


  // 비밀번호 찾기 - 임시 비밀번호 발급
  findPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body;

      const result = await this.userService.findPassword(email, name);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };


  // 유저 삭제
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;

      await this.userService.deleteUser(userId);

      res.status(200).json({
        message: "계정이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };


  // 특정 사용자의 커뮤니티 참여 이력 조회
  getCommunityHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId: rawUserId } = req.params;

      if (rawUserId === undefined) {
        throw new CustomError(400, "사용자 ID가 필요합니다.");
      }

      const userId = Number(rawUserId);
      if (isNaN(userId)) {
        throw new CustomError(400, "유효한 사용자 ID가 아닙니다.");
      }

      const history = await this.userService.getCommunityHistory(userId);

      res.status(200).json({
        status: "success",
        message: "커뮤니티 참여 이력 조회 성공",
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
