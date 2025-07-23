declare namespace Express {
  export interface Request {
    // authMiddleware에서 JWT 토큰을 검증한 후 설정
    userId?: number;
  }
}
