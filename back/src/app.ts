import express from 'express';
require('dotenv').config();
import errorHandingMiddleware from './middleware/error-handing-middleware';


const app = express();
const PORT = process.env.PORT || 3000;



//라우터
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/auth", authRouter);
app.use("/mypage", userRouter);


app.get('/', (req, res) => {
  res.json({ message: 'Book API Server' });
});

//에러 미들웨어
app.use(errorHandingMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

