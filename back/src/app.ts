import express from 'express';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Book API Server' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

