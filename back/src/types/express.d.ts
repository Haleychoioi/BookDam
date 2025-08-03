// src/types/express.d.ts
// 이 파일은 프로젝트의 아무 곳(예: src/types/express.d.ts)에 생성되어야 합니다.
import { JWTPayload } from "./user.type"; // JWTPayload의 실제 경로에 따라 수정해야 합니다.

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload; // ✨ req.user에 JWTPayload 타입 추가 ✨
    }
  }
}
