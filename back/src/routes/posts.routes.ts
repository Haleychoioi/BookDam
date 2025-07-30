// src/routes/posts.routes.ts

import { Router } from "express";
import { PostController } from "../controllers/posts.controller"; // PostController를 import합니다.
import authenticate from "../middleware/authenticate-middleware"; // authenticate 미들웨어 import

const router = Router();
const postController = new PostController();

// API 명세서 기반 라우트 정의

// GET /posts - 전체 게시판 게시물 목록 조회 (인증 불필요)
router.get("/", postController.getPosts);

// POST /posts/write - 전체 게시판에 게시물 작성 (인증 필요)
router.post("/write", authenticate, postController.createPost);

// GET /posts/:id - 특정 게시물 상세 정보 조회 (인증 불필요)
router.get("/:id", postController.getPostById);

// PUT /posts/:id - 특정 게시물 수정 (인증 필요)
router.put("/:id", authenticate, postController.updatePost);

// PATCH /posts/:id - 특정 게시물 부분 수정 (PATCH 라우트 추가, 인증 필요)
router.patch("/:id", authenticate, postController.updatePost); // PATCH 라우트 추가

// DELETE /posts/:id - 특정 게시물 삭제 (인증 필요)
router.delete("/:id", authenticate, postController.deletePost);

export default router;
