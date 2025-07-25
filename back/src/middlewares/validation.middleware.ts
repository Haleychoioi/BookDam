import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// 회원가입 유효성 검사
export const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 형식이 아닙니다.")
    .normalizeEmail(), // 이메일 정규화 (소문자 변환 등)

  body("password")
    .isLength({ min: 4 })
    .withMessage("비밀번호는 최소 4자 이상이어야 합니다."),
  // .matches(/[a-z]/)
  // .withMessage("비밀번호는 최소 1개의 소문자를 포함해야 합니다.")
  // .matches(/[A-Z]/)
  // .withMessage("비밀번호는 최소 1개의 대문자를 포함해야 합니다.")
  // .matches(/[0-9]/)
  // .withMessage("비밀번호는 최소 1개의 숫자를 포함해야 합니다.")
  // .matches(/[^a-zA-Z0-9]/)
  // .withMessage("비밀번호는 최소 1개의 특수문자를 포함해야 합니다."),

  body("name")
    .notEmpty()
    .withMessage("이름을 입력해주세요.")
    .isLength({ max: 50 })
    .withMessage("이름은 50자 이하여야 합니다."),

  body("nickname")
    .notEmpty()
    .withMessage("닉네임을 입력해주세요.")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2자에서 20자 사이여야 합니다."),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("유효한 전화번호 형식이 아닙니다."),

  body("agreement")
    .isBoolean()
    .withMessage("약관 동의 여부를 선택해주세요.")
    .custom((value: boolean) => value === true)
    .withMessage("서비스 약관에 동의해야 합니다."),

  // 유효성 검사 결과 처리
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// 로그인 유효성 검사
export const loginValidation = [
  body("email").isEmail().withMessage("유효한 이메일 형식이 아닙니다."),
  body("password").notEmpty().withMessage("비밀번호를 입력해주세요."),

  // 유효성 검사 결과 처리
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
