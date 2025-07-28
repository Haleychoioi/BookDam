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


export default router;