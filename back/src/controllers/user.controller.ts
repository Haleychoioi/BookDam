import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { SignupRequest, LoginRequest } from '../types/user.type';

class UserController {

    // userService에서 인스턴스를 생성해서 굳이 여기서 필요가 없음
    // 컨트롤러에서 인스턴스를 생성하면 this.userService로 사용해야됨

    // 생성자 제거
    // private userService: UserService;

    // constructor() {
    //     this.userService = new UserService();
    // }

    // 회원가입
    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signupData: SignupRequest = req.body;
            const result = await userService.signUp(signupData);

            res.status(201).json(result);
        } catch (error) {
            next(error);  // 에러 미들웨어로 전달
        }
    };

    // 로그인
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const loginData: LoginRequest = req.body;
            const result = await userService.login(loginData);

            res.status(200).json(result);
        } catch (error) {
            next(error);  // 에러 미들웨어로 전달
        }
    };

    // 내 정보 조회
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const userId = req.user!; // authenticate 미들웨어에서 토큰이 없으면 반환기능이 있기 때문에 !사용해도 됨
            const userProfile = await userService.getMyProfile(userId);

            res.status(200).json({
                user: userProfile,
                message: "내 정보 조회 성공"
            });
        } catch (error) {
            next(error);  // 에러 미들웨어로 전달
        }
    };

    // 프로필 업데이트 (닉네임, 한줄소개, 이미지)
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const userId = req.user!;
            const updateData = req.body;
            const file = req.file;

            const updatedUser = await userService.updateProfile(userId, updateData, file);

            res.status(200).json({
                user: updatedUser,
                message: "프로필이 성공적으로 업데이트되었습니다"
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
                message: "계정이 성공적으로 삭제되었습니다."
            });

        } catch (error) {
            next(error);
        }
    }




    // 비밀번호 변경
    // changePassword = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const userId = req.user!;
    //         const { oldPassword, newPassword } = req.body;

    //         const result = await userService.changePassword(userId, oldPassword, newPassword);

    //         res.status(200).json(result);
    //     } catch (error) {
    //         next(error);  // 에러 미들웨어로 전달
    //     }
    // };
    

    // 사용자 통계 - 토큰 검증만, 권한 체크는 나중에 추가
    getUserStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // req.user는 이미 authenticate 미들웨어에서 설정됨
            // 일단 권한 체크는 생략 (나중에 authorization 미들웨어 추가 예정)

            const stats = await userService.getUserStats();

            res.status(200).json({
                stats,
                message: "사용자 통계 조회 성공"
            });
        } catch (error) {
            next(error);  // 에러 미들웨어로 전달
        }
    };
}

export default new UserController();