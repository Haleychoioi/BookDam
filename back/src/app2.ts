import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// 라우트
import postRoutes from "./routes/post.routes"; // 전체 게시판 게시물
import commentManagementRoutes from "./routes/commentManagement.routes"; // 퍼블릭 댓글 관리 (수정/삭제)
import communityRoutes from "./routes/community.routes"; // 커뮤니티 관련 (목록, 가입 신청, 생성)
import teamPostRoutes from "./routes/teamPost.routes"; // 팀 내부 게시물 상세, 수정, 삭제
import teamCommentManagementRoutes from "./routes/teamCommentManagement.routes"; // 팀 댓글 관리 (수정/삭제)

// 미들웨어
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 모든 도메인에서의 요청을 허용 (개발 시 유용, 실제 배포 시에는 특정 도메인으로 제한 권장)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Book Community API Server" });
});

// 전체 게시판
app.use("/posts", postRoutes);
// 퍼블릭 댓글 관리 (댓글 수정/삭제)
app.use("/comments", commentManagementRoutes);

// 커뮤니티
app.use("/communities", communityRoutes);
// 팀 내부 게시물 상세, 수정, 삭제
app.use("/team-posts", teamPostRoutes);
// 팀 내부 댓글 수정, 삭제
app.use("/team-comments", teamCommentManagementRoutes);

// 에러 핸들링 미들웨어
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});
