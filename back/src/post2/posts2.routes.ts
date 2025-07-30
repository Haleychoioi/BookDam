import { Router } from 'express';
import { PostRepository } from './post2.repository';
import { PostService } from './posts2.service';
import { PostController } from './post2.controller';
import authMiddleware from '../middleware/authenticate-middleware';

const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

const postRouter = Router();

// 게시글 생성
postRouter.post('/', authMiddleware, postController.createPost);

// 모집글 지원
postRouter.post('/:postId/applications', authMiddleware, postController.applyToPost);

// 지원서 처리 (승인/거절)
postRouter.patch(
  '/:postId/applications/:applicationId',
  authMiddleware,
  postController.processApplication,
);

// 팀 생성
postRouter.post('/:postId/teams', authMiddleware, postController.createTeam);

export default postRouter;