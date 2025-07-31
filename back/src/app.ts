import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
dotenv.config();

import errorHandlingMiddleware, { CustomError } from "./middleware/error-handing-middleware";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import bookRouter from "./routes/book.routes";
import wishRouter from './routes/wishList.route';
import myLibraryRouter from './routes/myLibrary.routes';
import tasteAnalysisRouter from './routes/tasteAnalysis.routes';

import routes from "./routes";
import prisma from "./utils/prisma";

const app = express();
const PORT = process.env.PORT || 3000;

const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5500";
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

// 기존 라우터들 (유저/도서/마이페이지)
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use('/api/mypage/wishlist', wishRouter);
app.use('/api/mypage/taste-analysis', tasteAnalysisRouter);
app.use('/api/mypage/my-library', myLibraryRouter);

// 새로운 커뮤니티 관련 라우터들
app.use("/api", routes);

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