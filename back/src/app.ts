import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";

// http 및 Socket.IO 모듈 추가
import http from "http";
import { Server } from "socket.io";

// cors, jwt import
import cors from "cors";
import jwt from "jsonwebtoken";

// 환경변수를 맨 먼저 로드
dotenv.config();

// CustomError 임포트 (통합 에러 핸들링을 위해 필요)
import { CustomError } from "./middleware/error-handing-middleware";

// 기존 미들웨어 및 라우터들
// errorHandingMiddleware는 통합 에러 핸들러로 대체되므로, 여기서는 사용하지 않습니다.
// import errorHandingMiddleware from "./middleware/error-handing-middleware";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import bookRouter from "./routes/book.routes";
// chatController 추가
import chatController from "./chat/chat.controller";

// 새로운 API 라우터들 추가
import routes from "./routes"; // 커뮤니티 관련 라우트들
import prisma from "./utils/prisma"; // Prisma 데이터베이스 연결

const app = express();
const PORT = process.env.PORT || 3000;

// 허용할 CORS Origin 설정 (환경 변수 사용, 기본값 제공)
const allowedOrigin = process.env.CORS_ORIGIN || "http://127.0.0.1:5500";

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

// Express 앱에도 cors 미들웨어를 적용합니다. 라우터보다 위에 있어야 됨
app.use(
  cors({
    origin: allowedOrigin, // 환경 변수에서 가져온 origin 사용
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 기존 라우터들 (도서/유저/인증)
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);

// 새로운 커뮤니티 관련 라우터들
app.use("/api", routes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(
    404,
    `${req.method} ${req.url} 라우터가 없습니다.`
  );
  next(error);
});

// --- Socket.IO 인증 미들웨어 설정 ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("인증 토큰이 없습니다."));
    }

    // JWT_SECRET 환경 변수 유효성 검사
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
      return next(new Error("서버 설정 오류: JWT_SECRET이 없습니다."));
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
    };
    socket.data.user = { userId: decoded.userId };

    next();
  } catch (error) {
    console.error("Socket.IO 인증 에러:", error);
    next(new Error("인증에 실패했습니다."));
  }
});

// Socket.IO 컨트롤러 연결 설정
io.on("connection", (socket) => {
  console.log(`클라이언트 연결 성공: ${socket.id}`);

  // 컨트롤러와 io와 socket 객체를 넘겨 세부 이벤트 핸들러들을 등록
  chatController.registerHandlers(io, socket);

  // 클라이언트 연결이 끊어졌을 때
  socket.on("disconnect", () => {
    console.log(`클라이언트 연결 해제: ${socket.id}`);
  });
});

// --- Socket.IO 인증 미들웨어 설정 ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("인증 토큰이 없습니다."));
    }

    // JWT_SECRET 환경 변수 유효성 검사
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
      return next(new Error("서버 설정 오류: JWT_SECRET이 없습니다."));
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
    };
    socket.data.user = { userId: decoded.userId };

    next();
  } catch (error) {
    console.error("Socket.IO 인증 에러:", error);
    next(new Error("인증에 실패했습니다."));
  }
});

// Socket.IO 컨트롤러 연결 설정
io.on("connection", (socket) => {
  console.log(`클라이언트 연결 성공: ${socket.id}`);

  // 컨트롤러와 io와 socket 객체를 넘겨 세부 이벤트 핸들러들을 등록
  chatController.registerHandlers(io, socket);

  // 클라이언트 연결이 끊어졌을 때
  socket.on("disconnect", () => {
    console.log(`클라이언트 연결 해제: ${socket.id}`);
  });
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

// 에러 미들웨어 (기존 것도 적용 - 필요하다면)
// 위에서 통합 에러 핸들러를 정의했으므로, 이 미들웨어는 중복될 수 있습니다.
// 만약 errorHandingMiddleware가 특별한 로직을 가지고 있지 않다면 제거하는 것이 좋습니다.
// 현재는 주석 처리하여 중복을 방지합니다.
// app.use(errorHandingMiddleware);

// 데이터베이스 연결 테스트
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("데이터베이스 연결");
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1); // 데이터베이스 연결 실패 시 프로세스 종료
  }
}

// 서버 시작
server.listen(PORT, async () => {
  console.log(`🛡️ Server listening on port: ${PORT} 🛡️`);
  console.log(
    `ALADIN_API_KEY: ${process.env.ALADIN_API_KEY ? "설정됨" : "설정 안됨"}`
  );
  console.log(`CORS_ORIGIN: ${allowedOrigin}`); // 설정된 CORS Origin 로그 출력

  // 데이터베이스 연결
  await connectToDatabase();
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("데이터베이스 연결 해제.");
});
