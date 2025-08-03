import { body, param, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const signUpValidator: ValidationChain[] = [
    body('email')
        .notEmpty().withMessage("이메일을 작성해주세요")
        .isEmail().withMessage("이메일 형식으로 작성해주세요."),
    body('password')
        .notEmpty().withMessage("비밀번호를 작성해주세요.")
        .isLength({ min: 6 }).withMessage("비밀번호 최소 6자"),
    body('name')
        .notEmpty().withMessage("이름을 작성해주세요."),
    body('phone')
        .notEmpty().withMessage("전화번호를 작성해주세요."),
    body('nickname')
        .notEmpty().withMessage("닉네임을 작성해주세요.")
        .isLength({ min: 1, max: 10 }).withMessage("닉네임은 1~10자로 입력해주세요."),
    body('agreement')
        .custom(value => value === true)
        .withMessage("동의안내서를 체크해주세요.")
];


export const loginValidator: ValidationChain[] = [
    body('email')
        .notEmpty().withMessage("이메일을 작성해주세요.")
        .isEmail().withMessage("이메일 형식으로 작성해주세요."),
    body('password')
        .notEmpty().withMessage('비밀번호가 없습니다.')
];

export const temporaryPassword: ValidationChain[] = [
    body('email')
        .notEmpty().withMessage("이메일을 작성해주세요.")
        .isEmail().withMessage("이메일 형식으로 작성해주세요."),
    body('name')
        .notEmpty().withMessage('성함을 작성해주세요.')
];

export const updateProfileValidator: ValidationChain[] = [
    body('nickname')
        .optional()
        .notEmpty().withMessage("닉네임을 작성해주세요.")
        .isLength({ min: 1, max: 10 }).withMessage("닉네임은 1~10자로 입력해주세요.")
];

export const getUserValidator: ValidationChain[] = [
    param('userId')
        .isInt().withMessage("userId를 숫자로 입력해주세요.")
];

export const handleValidationResult = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const extractedError = result.array().map((error: any) => error.msg);
        return res.status(400).json({
            errorMessage: extractedError[0]
        });
    }
    next();
};