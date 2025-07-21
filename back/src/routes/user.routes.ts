import express from 'express';
import  userController  from '../controllers/user.controller';
import authenticate from '../middleware/authenticate-middleware'
import { userValidator, handleValidationResult } from '../middleware/validation-result-handler';

const router = express.Router();

// 내 정보 조회
router.get('/profile', authenticate, userController.getProfile);

// 프로필 업데이트
router.put('/profile',
    userValidator,
    authenticate,
    handleValidationResult,
    userController.updateProfile
);

// 비밀번호 변경
// router.put('/password', authenticate, userController.changePassword);

// 사용자 통계 (관리자용) - api에 없는 기능
router.get('/stats', authenticate, userController.getUserStats);

export default router;