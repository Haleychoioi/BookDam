import express from 'express';
import dotenv from 'dotenv';

// 환경변수를 맨 먼저 로드
dotenv.config();

import errorHandingMiddleware from './middleware/error-handing-middleware';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import bookRouter from './routes/book.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Book API Server' });
});

// 에러 미들웨어 (마지막에)
app.use(errorHandingMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`ALADIN_API_KEY: ${process.env.ALADIN_API_KEY ? '설정됨' : '설정 안됨'}`);
});