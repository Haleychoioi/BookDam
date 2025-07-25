import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  registerValidation,
  loginValidation,
} from "../middlewares/validation.middleware";

const router = Router();

// 사용자 회원가입 라우트
router.post("/register", registerValidation, authController.register);

// 사용자 로그인 라우트
router.post("/login", loginValidation, authController.login);

export default router;
