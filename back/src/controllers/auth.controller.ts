import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  // 사용자 회원가입 처리
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        name,
        nickname,
        phone,
        introduction,
        agreement,
      } = req.body;

      if (
        !email ||
        !password ||
        !name ||
        !nickname ||
        !phone ||
        agreement === undefined
      ) {
        return res
          .status(400)
          .json({ message: "모든 필수 필드를 입력해주세요." });
      }

      // authService를 통해 사용자 등록 로직 실행
      const { user, token } = await authService.register({
        email,
        password,
        name,
        nickname,
        phone,
        introduction,
        agreement,
      });

      // 성공 응답 전송
      res.status(201).json({
        status: "success",
        message: "회원가입이 성공적으로 완료되었습니다.",
        user: {
          userId: user.userId,
          email: user.email,
          nickname: user.nickname,
        },
        token,
      });
    } catch (error: any) {
      next(error);
    }
  },

  // 사용자 로그인 처리
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "이메일과 비밀번호를 입력해주세요." });
      }

      const { user, token } = await authService.login(email, password);

      res.status(200).json({
        status: "success",
        message: "로그인 성공",
        user: {
          userId: user.userId,
          email: user.email,
          nickname: user.nickname,
        },
        token,
      });
    } catch (error: any) {
      next(error);
    }
  },
};
