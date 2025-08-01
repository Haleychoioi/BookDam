import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";

// cors import
import cors from "cors";

// 환경변수를 맨 먼저 로드
dotenv.config();

// CustomError 임포트 (통합 에러 핸들링을 위해 필요)
import { CustomError } from "./middleware/error-handing-middleware";

// 기존 미들웨어 및 라우터들
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import bookRouter from "./routes/book.routes";
import chatController from "./chat/chat.controller";

// 새로운 API 라우터들 추가
import routes from "./routes"; // 커뮤니티 관련 라우트들
import prisma from "./utils/prisma";

const app = express();
const PORT = process.env.PORT || 3000;

// 허용할 CORS Origin 설정 (환경 변수 사용, 기본값 제공)
const rawOrigins =
  process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5500";
const allowedOrigins = rawOrigins.split(",").map((origin) => origin.trim());

// Express 앱을 기반으로 HTTP 서버 생성
const server = http.createServer(app);

// HTTP 서버 위에 Socket.IO 서버를 연결 => CORS 설정을 해야 클라이언트에서 접속 가능
const io = new Server(server, {
  cors: {
    // 클라이언트 주소를 환경 변수에서 가져와 사용
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

// Express 앱에도 cors 미들웨어 적용 라우터보다 위에 있어야 됨
app.use(
  cors({
    origin: allowedOrigins,
    // credentials: true
  })
);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// profileImage 링크 이동할때 에러 안나게 하려면
app.use("/static", express.static(path.join(__dirname, "../public")));

// 기본 라우트 (서버 상태 확인용)
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 기존 라우터들 (도서/유저/인증)
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/mypage/wishlist", wishRouter);
app.use("/api/mypage/my-library", myLibraryRouter);

// 새로운 커뮤니티 관련 라우터들
app.use("/api", routes);

// 404 에러 핸들링 (존재하지 않는 라우트)
// CustomError를 사용하여 일관적인 에러 처리
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(
    404,
    `${req.method} ${req.url} 라우터가 없습니다.`
  );
  next(error);
});

// 통합 에러 핸들링 미들웨어 (모든 에러를 여기서 처리)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // 서버 콘솔에 에러 로그 출력

  // CustomError 인스턴스인 경우 해당 상태 코드와 메시지를 사용
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // 그 외의 예상치 못한 에러는 500 Internal Server Error로 처리
  res.status(500).json({
    status: "error",
    message: err.message || "서버 오류가 발생했습니다.",
  });
});

// 데이터베이스 연결 테스트
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("데이터베이스 연결 성공!");
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1);
  }
}

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🛡️ Server listening on port: ${PORT} 🛡️`);
  console.log(
    `ALADIN_API_KEY: ${process.env.ALADIN_API_KEY ? "설정됨" : "설정 안됨"}`
  );
  console.log(`CORS_ORIGIN: ${rawOrigins}`); // 설정된 CORS Origin 로그 출력

  // 데이터베이스 연결
  await connectToDatabase();
});

// 앱 종료 시 데이터베이스 연결 해제
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("데이터베이스 연결 해제.");
});
