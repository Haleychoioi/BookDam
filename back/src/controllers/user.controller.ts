import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { SignupRequest, LoginRequest } from '../types/user.type';

class UserController {

    // 회원가입
    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signupData: SignupRequest = req.body;
            const result = await userService.signUp(signupData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    // 로그인
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const loginData: LoginRequest = req.body;
            const result = await userService.login(loginData);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    // 내 정보 조회
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const userProfile = await userService.getMyProfile(userId);

            res.status(200).json({
                user: userProfile,
                message: '내 정보 조회 성공',
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

            const updatedUser = await userService.updateProfile(
                userId,
                updateData,
                file
            );

            res.status(200).json({
                user: updatedUser,
                message: '프로필이 성공적으로 업데이트되었습니다',
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

            const result = await userService.changePassword(userId, {
                currentPassword,
                newPassword,
                confirmNewPassword
            });

            res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            next(error);
        }
    }


    // 비밀번호 찾기 - 임시 비밀번호 발급
    findPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, name } = req.body;

            const result = await userService.findPassword(email, name);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };



    // 유저 삭제
    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;

            await userService.deleteUser(userId);

            res.status(200).json({
                message: '계정이 성공적으로 삭제되었습니다.',
            });
        } catch (error) {
            next(error);
        }
    };

}

export default new UserController();