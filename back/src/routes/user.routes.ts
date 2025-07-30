import express from 'express';
import  userController  from '../controllers/user.controller';
import authenticate from '../middleware/authenticate-middleware'
import { updateProfileValidator, handleValidationResult } from '../middleware/validation-result-handler';
import upload from '../middleware/multer';

const router = express.Router();

// 내 정보 조회
router.get('/getProfile', authenticate, userController.getProfile);

// 회원정보 수정
router.put('/profile',authenticate,upload.single('profileImage'),updateProfileValidator,handleValidationResult,userController.updateProfile);

// 유저 삭제
router.delete('/delete', authenticate, handleValidationResult, userController.deleteUser);







// 비밀번호 변경
// router.put('/password', authenticate, userController.changePassword);

// 사용자 통계 (관리자용) - api에 없는 기능
// router.get('/userList', authenticate, userController.getUserStats);

export default router;