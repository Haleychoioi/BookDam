import { Router } from "express";
import { PostController } from "../controllers/posts.controller";
import authenticate from "../middleware/authenticate-middleware";

const router = Router();
const postController = new PostController();

// GET /posts - 전체 게시판 게시물 목록 조회
router.get("/", postController.getPosts);

// POST /posts/write - 전체 게시판에 게시물 작성 (인증 필요)
router.post("/write", authenticate, postController.createPost);

// GET /posts/:id - 특정 게시물 상세 정보 조회
router.get("/:id", postController.getPostById);

// PUT /posts/:id - 특정 게시물 수정 (인증 필요)
router.put("/:id", authenticate, postController.updatePost);

// PATCH /posts/:id - 특정 게시물 부분 수정 (PATCH 라우트 추가, 인증 필요)
router.patch("/:id", authenticate, postController.updatePost);

// DELETE /posts/:id - 특정 게시물 삭제 (인증 필요)
router.delete("/:id", authenticate, postController.deletePost);

// DELETE /posts/:id/recruitment-only - 모집 게시물만 삭제
router.delete(
  "/:id/recruitment-only",
  authenticate,
  postController.deleteRecruitmentPost
);

export default router;
