import { Request, Response, NextFunction } from 'express';
import { PostService } from './posts2.service';
import { ProcessApplicationRequest } from './post2.types';

export class PostController {
  constructor(private readonly postService: PostService) {}

  public createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user as number;
      const newPost = await this.postService.createPost(req.body, userId);
      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  public applyToPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user as number;
      const postId = parseInt(req.params.postId, 10);
      const result = await this.postService.applyToPost(
        postId,
        req.body,
        userId,
      );

      if (result && 'error' in result) {
        if (result.error === 'Validation') return res.status(400).json({ message: result.message });
        if (result.error === 'Conflict') return res.status(409).json({ message: result.message });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public processApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user as number;
      const postId = parseInt(req.params.postId, 10);
      const applicationId = parseInt(req.params.applicationId, 10);
      const { status } = req.body as ProcessApplicationRequest;

      if (status !== 'ACCEPTED' && status !== 'REJECTED') {
        return res.status(400).json({ message: '잘못된 상태 값입니다.' });
      }

      const result = await this.postService.processApplication(
        postId,
        applicationId,
        userId,
        status,
      );

      if (result && 'error' in result) {
        if (result.error === 'NotFound') return res.status(404).json({ message: result.message });
        if (result.error === 'Forbidden') return res.status(403).json({ message: result.message });
        if (result.error === 'Conflict') return res.status(409).json({ message: result.message });
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public createTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user as number;
      const postId = parseInt(req.params.postId, 10);
      const result = await this.postService.createTeamFromPost(postId, userId);

      if (result && 'error' in result) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}