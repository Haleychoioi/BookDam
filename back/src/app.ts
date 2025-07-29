import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// http 및 Socket.IO 모듈 추가
import http from 'http';
import { Server } from 'socket.io';
// cors, jwt import
import cors from 'cors';
import jwt from 'jsonwebtoken';

// 환경변수를 맨 먼저 로드
dotenv.config();

// 기존 미들웨어 및 라우터들
import errorHandingMiddleware from './middleware/error-handing-middleware';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import bookRouter from './routes/book.routes';
// chatController 추가
import chatController from './chat/chat.controller';

// 새로운 API 라우터들 추가
import routes from "./routes"; // 커뮤니티 관련 라우트들
import prisma from "./utils/prisma"; // Prisma 데이터베이스 연결

const app = express();
const PORT = process.env.PORT || 3000;

// Express 앱을 기반으로 HTTP 서버 생성
const server = http.createServer(app);

// HTTP 서버 위에 Socket.IO 서버를 연결 => CORS 설정을 해야 클라이언트에서 접속 가능
const io = new Server(server, {
  cors: {
    // 클라이언트 주소를 명시적으로 지정 나중에 고쳐야되나(주의)
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"],
    methods: ['GET', 'POST'],
  },
});

// Express 앱에도 cors 미들웨어를 적용. 라우터보다 위에 있어야 됨
// 배포할때 다시 변경
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"]
}));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// profileImage 링크 이동할때 에러 안나게 하려면
app.use('/static', express.static(path.join(__dirname, '../public')));

// 기본 라우트 (서버 상태 확인용)
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 기존 라우터들 (도서/유저/인증)
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);

// 새로운 커뮤니티 관련 라우터들
app.use("/api", routes);

// 404 에러 핸들링 (존재하지 않는 라우트)
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  (error as any).status = 404;
  next(error);
});

// --- Socket.IO 인증 미들웨어 설정 ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('인증 토큰이 없습니다.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    socket.data.user = { userId: decoded.userId };
    
    next();
  } catch (error) {
    console.error('Socket.IO 인증 에러:', error);
    next(new Error('인증에 실패했습니다.'));
  }
});

// Socket.IO 컨트롤러 연결 설정
io.on('connection', (socket) => {
  console.log(`클라이언트 연결 성공: ${socket.id}`);

  // 컨트롤러와 io와 socket 객체를 넘겨 세부 이벤트 핸들러들을 등록
  chatController.registerHandlers(io, socket);

  // 클라이언트 연결이 끊어졌을 때
  socket.on('disconnect', () => {
    console.log(`클라이언트 연결 해제: ${socket.id}`);
  });
});

// 에러 핸들링 미들웨어 (통합)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "서버 오류가 발생했습니다.",
  });
});

// 에러 미들웨어 (기존 것도 적용 - 필요하다면)
app.use(errorHandingMiddleware);

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
server.listen(PORT, async () => {
    console.log(`🛡️ Server listening on port: ${PORT} 🛡️`);
    console.log(`ALADIN_API_KEY: ${process.env.ALADIN_API_KEY ? '설정됨' : '설정 안됨'}`);
    
    // 데이터베이스 연결
    await connectToDatabase();
});

// 앱 종료 시 데이터베이스 연결 해제
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('데이터베이스 연결 해제.');
});