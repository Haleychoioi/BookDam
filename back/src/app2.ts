// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./routes"; // 모든 라우트를 통합한 index.ts 파일을 import합니다.
import prisma from "./utils/prisma"; // 단일 PrismaClient 인스턴스를 import합니다.

// .env 파일 로드 (환경 변수 사용을 위해)
dotenv.config();

// Express 애플리케이션 인스턴스 생성
const app = express();

// 미들웨어 설정
app.use(express.json()); // JSON 형식의 요청 본문을 파싱합니다.
app.use(express.urlencoded({ extended: true })); // URL-encoded 형식의 요청 본문을 파싱합니다.

// 모든 라우트 연결
// '/api' 경로 아래에 모든 커뮤니티 관련 라우트를 연결합니다.
// 예: /api/communities, /api/posts 등
app.use("/api", routes);

// 기본 라우트 (선택 사항)
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 404 에러 핸들링 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  // 에러 객체에 상태 코드 추가 (선택 사항)
  (error as any).status = 404;
  next(error); // 다음 에러 핸들러 미들웨어로 에러를 전달합니다.
});

// 에러 핸들링 미들웨어
// 이 미들웨어는 모든 라우트 및 다른 미들웨어에서 발생한 에러를 처리합니다.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // 개발 환경에서는 자세한 에러 정보를, 프로덕션 환경에서는 간략한 에러 정보를 제공합니다.
  console.error(err); // 서버 콘솔에 에러를 기록합니다.

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "서버 오류가 발생했습니다.",
    // 개발 모드에서만 스택 트레이스 제공 (선택 사항)
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 서버 포트 설정
const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️ Server listening on port: ${PORT} 🛡️
  ################################################
  `);
});

// 데이터베이스 연결 테스트 (선택 사항, 서버 시작 시 연결 확인)
async function connectToDatabase() {
  try {
    await prisma.$connect(); // import한 prisma 인스턴스 사용
    console.log("데이터베이스 연결 성공!");
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1); // 연결 실패 시 프로세스 종료
  } finally {
    // 앱이 종료될 때 Prisma 연결을 끊습니다.
    // process.on('beforeExit', async () => {
    //   await prisma.$disconnect();
    //   console.log('데이터베이스 연결 해제.');
    // });
  }
}

// 서버 시작 시 데이터베이스 연결 시도
connectToDatabase();
