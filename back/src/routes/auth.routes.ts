import express from "express";
import userController from "../controllers/user.controller";
import {
  signUpValidator,
  loginValidator,
  temporaryPassword,
  handleValidationResult,
} from "../middleware/validation-result-handler";

const router = express.Router();

// 회원가입
router.post("/register", signUpValidator, handleValidationResult, userController.signup
);

// 로그인
router.post("/login", loginValidator, handleValidationResult, userController.login
);

// 임시 비밀번호 이메일 발송
router.post('/password/issue-temp', temporaryPassword, handleValidationResult, userController.findPassword);

export default router;
