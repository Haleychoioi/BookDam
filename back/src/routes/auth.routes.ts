import express from "express";
import {
  signUpValidator,
  loginValidator,
  temporaryPassword,
  handleValidationResult,
} from "../middleware/validation-result-handler";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";

const userRepository = new UserRepository();

const router = express.Router();

// 회원가입
router.post("/register", signUpValidator, handleValidationResult, userController.signup);

// 로그인
router.post("/login", loginValidator, handleValidationResult, userController.login);

// 임시 비밀번호 이메일 발송
router.post('/password/issue-temp', temporaryPassword, handleValidationResult, userController.issueTemporaryPassword);

export default router;
