import express from "express";
import dotenv from "dotenv";
import path from "path";

// http 및 Socket.IO 모듈 추가*
import http from "http";
import { Server } from "socket.io";
// cors, jwt import*
import cors from "cors";
import jwt from "jsonwebtoken";

// 환경변수를 맨 먼저 로드
dotenv.config();

import errorHandingMiddleware from "./middleware/error-handing-middleware";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import bookRouter from "./routes/book.routes";
// chatController 추가*
import chatController from "./chat/chat.controller";

const app = express();
const PORT = process.env.PORT || 3000;

// Express 앱을 기반으로 HTTP 서버 생성*
const server = http.createServer(app);

// HTTP 서버 위에 Socket.IO 서버를 연결 => CORS 설정을 해야 클라이언트에서 접속 가능*
const io = new Server(server, {
  cors: {
    // 클라이언트 주소를 명시적으로 지정 나중에 고쳐야되나(주의)**
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"], // 📌 여기
    methods: ["GET", "POST"],
  },
});

// Express 앱에도 cors 미들웨어를 적용합니다. 라우터보다 위에 있어야 됨
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"], // 📌 여기
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// profileImage 링크 이동할때 에러 안나게 하려면
app.use("/static", express.static(path.join(__dirname, "../public")));

// 라우터
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);

// --- Socket.IO 인증 미들웨어 설정 ---
// io.on('connection', ...) 보다 위에 미들웨어를 추가
io.use((socket, next) => {
  try {
    // 클라이언트의 연결 요청 헤더에서 토큰을 가져옴
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("인증 토큰이 없습니다."));
    }

    // JWT 토큰을 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    // 검증된 유저 정보를 socket.data 객체에 저장
    // 이제 이 소켓의 모든 이벤트 핸들러에서 socket.data.user를 사용할 수 있음
    socket.data.user = { userId: decoded.userId };

    next(); // 성공 시 다음 단계로 진행
  } catch (error) {
    console.error("Socket.IO 인증 에러:", error);
    next(new Error("인증에 실패했습니다.")); // 실패 시 연결 거부
  }
});

// Socket.IO 컨트롤러 연결 설정
// 클라이언트가 웹소켓으로 연결될 때의 로직
io.on("connection", (socket) => {
  console.log(`클라이언트 연결 성공: ${socket.id}`);

  // 컨트롤러와 io와 socket 객체를 넘겨 세부 이벤트 핸들러들을 등록
  chatController.registerHandlers(io, socket);

  // 클라이언트 연결이 끊어졌을 때
  socket.on("disconnect", () => {
    console.log(`클라이언트 연결 해제: ${socket.id}`);
  });
});

// 에러 미들웨어 (마지막에)
app.use(errorHandingMiddleware);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `ALADIN_API_KEY: ${process.env.ALADIN_API_KEY ? "설정됨" : "설정 안됨"}`
  );
});
