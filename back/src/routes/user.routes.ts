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

// 비밀번호 수정
router.put('/change-password', authenticate, userController.changePassword);

export default router;