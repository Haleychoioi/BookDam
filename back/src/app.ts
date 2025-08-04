// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
dotenv.config();

import errorHandlingMiddleware, {
  CustomError,
} from "./middleware/error-handing-middleware";
import authRouter from "./routes/auth.routes";
import bookRouter from "./routes/book.routes";
import myPageRouter from "./routes/myPage.routes"; // myPageRouter 임포트 유지
import postsRouter from "./routes/posts.routes";
import {
  postCommentsRouter,
  standaloneCommentsRouter,
} from "./routes/comments.routes";

// ✨ ApplicationController 임포트 및 인스턴스화 제거 (이제 myPage.routes.ts에서 처리) ✨
// import { ApplicationController } from './controllers/applications.controller';
// const applicationController = new ApplicationController();

import prisma from "./utils/prisma";
import authenticate from "./middleware/authenticate-middleware"; // authenticate 임포트 유지

const app = express();
const PORT = process.env.PORT || 3000;

const rawOrigins =
  process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5500";
const allowedOrigins = rawOrigins.split(",").map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("커뮤니티 API 서버가 정상 작동 중입니다!");
});

// 모든 메인 라우터들을 여기에 연결합니다.
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);

// ✨ DEBUGGING: 모집 취소 DELETE 라우트 제거 (myPage.routes.ts로 이동) ✨
// app.delete(
//   "/api/mypage/communities/recruiting/:communityId",
//   authenticate,
//   (req: Request, res: Response, next: NextFunction) => {
//       console.log(`[DEBUG - app.ts Direct Hit] DELETE /api/mypage/communities/recruiting/${req.params.communityId}`);
//       applicationController.cancelRecruitment(req, res, next);
//   }
// );

// DEBUGGING: /api/mypage/test-route GET 라우트 유지 (테스트용)
app.get("/api/mypage/test-route", (req: Request, res: Response) => {
  console.log("[DEBUG - app.ts] Test route for /api/mypage/test-route hit!");
  res
    .status(200)
    .json({
      message: "Test route for mypage is working directly from app.ts!",
    });
});

app.use("/api/mypage", myPageRouter); // myPageRouter 마운트 유지

app.use("/api/posts", postsRouter);
app.use("/api/posts", postCommentsRouter);
app.use("/api/comments", standaloneCommentsRouter);

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
