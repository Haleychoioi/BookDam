import express from 'express';
import userController from '../controllers/user.controller';
import { signUpValidator, loginValidator, handleValidationResult } from '../middleware/validation-result-handler';

const router = express.Router();

// 회원가입
router.post('/register', 
    signUpValidator, 
    handleValidationResult,
    userController.signup
);

// 로그인  
router.post('/login',
    loginValidator,
    handleValidationResult,
    userController.login
);

// 내 정보 조회 - api명세에 없는 기능
router.get('/me', userController.getProfile)

export default router;