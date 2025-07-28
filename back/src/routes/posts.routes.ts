// src/routes/posts.routes.ts

import { Router } from "express";
import { PostController } from "../controllers/posts.controller"; // PostController를 import합니다.

const router = Router();
const postController = new PostController();

// API 명세서 기반 라우트 정의 (예시)
// GET /posts - 전체 게시판 게시물 목록 조회
router.get("/", postController.getPosts);
// POST /posts/write - 전체 게시판에 게시물 작성
router.post("/write", postController.createPost);
// GET /posts/:id - 특정 게시물 상세 정보 조회
router.get("/:id", postController.getPostById);
// PUT /posts/:id - 특정 게시물 수정
router.put("/:id", postController.updatePost);
// DELETE /posts/:id - 특정 게시물 삭제
router.delete("/:id", postController.deletePost);

export default router;
