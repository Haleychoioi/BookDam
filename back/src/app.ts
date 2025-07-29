import express from 'express';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

//에러 미들웨어

//라우터
import authRouter from './routes/auth.routes';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/auth", authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Book API Server' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

