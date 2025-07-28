// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import prisma from "./utils/prisma";

// .env 파일 로드 (환경 변수 사용을 위해)
dotenv.config();

// Express 애플리케이션 인스턴스 생성
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 모든 라우트 연결
// '/api' 경로 아래에 모든 커뮤니티 관련 라우트를 연결합니다.
app.use("/api", routes);

// 기본 라우트 (선택 사항)
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  // 에러 객체에 상태 코드 추가 (선택 사항)
  (error as any).status = 404;
  next(error);
});

// 에러 핸들링 미들웨어
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "서버 오류가 발생했습니다.",
  });
});

// 서버 포트 설정
const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`🛡️ Server listening on port: ${PORT} 🛡️`);
});

// 데이터베이스 연결 테스트 (선택 사항, 서버 시작 시 연결 확인)
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("데이터베이스 연결 성공!");
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1);
  } finally {
    // 앱이 종료될 때 Prisma 연결을 끊습니다.
    // process.on('beforeExit', async () => {
    //   await prisma.$disconnect();
    //   console.log('데이터베이스 연결 해제.');
    // });
  }
}

connectToDatabase();
