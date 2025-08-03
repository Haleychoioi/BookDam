// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
dotenv.config();

import errorHandlingMiddleware, {
  CustomError,
} from "./middleware/error-handing-middleware";
import authRouter from "./routes/auth.routes"; // 인증 라우터
import bookRouter from "./routes/book.routes"; // 도서 라우터
import myPageRouter from "./routes/myPage.routes"; // 마이페이지 통합 라우터 (여기서 커뮤니티 라우트도 처리)

// ✨ 추가: 일반 게시물 및 댓글 라우터 임포트 ✨
import postsRouter from "./routes/posts.routes";
import {
  postCommentsRouter,
  standaloneCommentsRouter,
} from "./routes/comments.routes";

import prisma from "./utils/prisma";

const app = express();
const PORT = process.env.PORT || 3000;

const rawOrigins =
  process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.0.1:5500";
const allowedOrigins = rawOrigins.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    // credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 모든 메인 라우터들을 여기에서 직접 연결합니다.
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/mypage", myPageRouter); // ✨ /api/mypage 경로 아래로 모든 마이페이지/커뮤니티 라우트 통합 ✨

// ✨ 추가: 일반 게시물 및 댓글 라우터들을 /api 아래에 마운트 ✨
app.use("/api/posts", postsRouter);
app.use("/api/posts", postCommentsRouter); // 게시물에 종속된 댓글 라우트
app.use("/api/comments", standaloneCommentsRouter); // 개별 댓글 라우트

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(
    404,
    `${req.method} ${req.url} 라우터가 없습니다.`
  );
  next(error);
});

app.use(errorHandlingMiddleware);

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("데이터베이스 연결");
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  console.log(`Server listening on port: ${PORT}`);
  console.log(`CORS_ORIGIN: ${rawOrigins}`);

  await connectToDatabase();
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("데이터베이스 연결 해제.");
});
