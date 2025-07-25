import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// 라우트 파일 임포트
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import commentManagementRoutes from "./routes/commentManagement.routes"; // 퍼블릭 댓글 관리 라우트 (수정/삭제)
import communityRoutes from "./routes/community.routes"; // 커뮤니티 관련 라우트 (목록, 가입 신청, 생성)
import teamPostRoutes from "./routes/teamPost.routes"; // 팀 내부 게시물 상세, 수정, 삭제 라우트
import teamCommentManagementRoutes from "./routes/teamCommentManagement.routes"; // 팀 댓글 관리 라우트 (수정/삭제)

import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Book Community API Server" });
});

app.use("/auth", authRoutes);
// 전체 게시판
app.use("/posts", postRoutes);
// 퍼블릭 댓글 관리(댓글 수정/삭제)
app.use("/comments", commentManagementRoutes);

// 커뮤니티
app.use("/communities", communityRoutes);
// 팀 내부 게시물 상세, 수정, 삭제
app.use("/team-posts", teamPostRoutes);
// 팀 내부 댓글 (수정, 삭제)
app.use("/team-comments", teamCommentManagementRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});
