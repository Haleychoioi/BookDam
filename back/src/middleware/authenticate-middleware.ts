import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types/user.type';


declare global {
  namespace Express {
    interface Request {
      user?: number; // userId만 저장
    }
  }
}

function verifyToken(token: string | undefined) {
  if (!token) return false;
  
  try {
    return jwt.verify(token,process.env.JWT_SECRET!) as JWTPayload;
  } catch(e) {
    return false;
  }
}

export default function(req: Request, res: Response, next: NextFunction) {
    console.log('=== authenticate 미들웨어 시작 ===');
    
    const authHeader = req.get('authorization');
    console.log('authHeader:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token:', token);
    
    const verifiedToken = verifyToken(token);
    console.log('verifiedToken:', verifiedToken);
    
    if(!verifiedToken) {
        console.log('토큰 검증 실패! 에러 던지기');
        return next(new Error("TokenNotMatched"));
    }
    
    // 여기서는 verifiedToken이 JWTPayload임이 보장됨
    console.log('verifiedToken.userId:', verifiedToken.userId); 
    console.log('토큰 검증 성공, req.user 설정');
    req.user = verifiedToken.userId;
    console.log('req.user 설정 후:', req.user);
    next();
}

// export default function(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.get('authorization');
//   const token = authHeader && authHeader.split(' ')[1];
  
//   const verifiedToken = verifyToken(token);
  
//   if(!verifiedToken) {
//     return next(new Error("TokenNotMatched"));
//   }
  

//   // JWTPlayload, global Request로 any 없이 사용
//   req.user = verifiedToken.userId;

//   next();
// }