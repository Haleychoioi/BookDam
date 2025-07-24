import { Router } from "express";
import { postController } from "../controllers/post.controller";
import { commentController } from "../controllers/comment.controller"; // 댓글 컨트롤러
import { authMiddleware } from "../middlewares/auth.middleware"; // 인증 미들웨어

const router = Router();

// 게시물 관련 라우트
router.get("/", postController.getPosts); // 전체 게시물 목록 조회
router.post("/", authMiddleware, postController.createPost); // 게시물 작성 (인증 필요)
router.get("/:id", postController.getPostById); // 특정 게시물 상세 조회
router.put("/:id", authMiddleware, postController.updatePost); // 게시물 수정 (인증 및 본인 확인 필요)
router.delete("/:id", authMiddleware, postController.deletePost); // 게시물 삭제 (인증 및 본인 확인 필요)

// 특정 게시물의 댓글 관련 라우트
router.get("/:postId/comments", commentController.getCommentsByPostId); // 특정 게시물 댓글 목록 조회
router.post(
  "/:postId/comments",
  authMiddleware,
  commentController.createComment
);

export default router;
