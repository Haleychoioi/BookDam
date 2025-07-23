import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

// 인증 미들웨어 함수
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Authorization 헤더에서 토큰 가져오기
  const authHeader = req.headers.authorization;

  // Authorization 헤더가 없거나 'Bearer '로 시작하지 않으면 401
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "인증 토큰이 제공되지 않았거나 형식이 올바르지 않습니다.",
    });
  }

  // 'Bearer ' 부분을 제외한 실제 토큰 문자열 추출
  const token = authHeader.split(" ")[1];

  // JWT_SECRET 설정 확인 오류 -> 500
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set.");
    return res
      .status(500)
      .json({ message: "서버 설정 오류: JWT 비밀 키가 정의되지 않았습니다." });
  }

  try {
    // 2. 토큰 검증
    // jwt.verify 함수로 토큰 유효성 검사, 유효하다면 JwtPayload 타입 반환
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // 3. userId를 추출하여 Request 객체에 추가 -> 다음 미들웨어/컨트롤러에서 req.userId를 통해 사용자 ID에 접근 가능
    req.userId = decoded.userId;

    // 4. 다음 미들웨어/라우트 핸들러로 제어 넘기기
    next();
  } catch (error) {
    // 토큰 검증 실패 시
    console.error("JWT verification failed:", error);
    return res
      .status(401)
      .json({ message: "유효하지 않거나 만료된 인증 토큰입니다." });
  }
};
