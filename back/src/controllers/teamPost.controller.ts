import { Request, Response, NextFunction } from "express";
import { teamPostService } from "../services/teamPost.service";

export const teamPostController = {
  // 특정 커뮤니티 (팀) 내부 게시물 목록 조회 (GET /communities/:teamId/posts)
  // community.routes.ts에서 호출
  async getTeamPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const teamId = parseInt(req.params.teamId);
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");
      const sort = (req.query.sort as string) || "latest";

      const { teamPosts, totalPages, currentPage } =
        await teamPostService.getTeamPosts(teamId, { page, size, sort });
      res.status(200).json({ teamPosts, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 특정 커뮤니티 (팀) 내부 게시물 작성 (POST /communities/:teamId/posts)
  async createTeamPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const teamId = parseInt(req.params.teamId);
      const { title, content, type } = req.body; // type: NOTICE, QUESTION, DISCUSSION

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const newTeamPost = await teamPostService.createTeamPost(userId, teamId, {
        title,
        content,
        type,
      });
      res
        .status(201)
        .json({ status: "success", teamPostId: newTeamPost.teamPostId });
    } catch (error) {
      next(error);
    }
  },

  // 팀 내부 게시물 상세 조회 (GET /team-posts/:id)
  async getTeamPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const teamPostId = parseInt(req.params.id);
      const teamPost = await teamPostService.getTeamPostById(teamPostId);
      if (!teamPost) {
        return res
          .status(404)
          .json({ message: "팀 게시물을 찾을 수 없습니다." });
      }
      res.status(200).json(teamPost);
    } catch (error) {
      next(error);
    }
  },

  // 팀 내부 게시물 수정 (PUT /team-posts/:id)
  async updateTeamPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const teamPostId = parseInt(req.params.id);
      const { title, content, type } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const updatedPost = await teamPostService.updateTeamPost(
        teamPostId,
        userId,
        { title, content, type }
      );
      if (!updatedPost) {
        return res.status(404).json({
          message: "팀 게시물을 찾을 수 없거나 수정 권한이 없습니다.",
        });
      }
      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 수정 완료" });
    } catch (error) {
      next(error);
    }
  },

  // 팀 내부 게시물 삭제 (DELETE /team-posts/:id)
  async deleteTeamPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const teamPostId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const deleted = await teamPostService.deleteTeamPost(teamPostId, userId);
      if (!deleted) {
        return res.status(404).json({
          message: "팀 게시물을 찾을 수 없거나 삭제 권한이 없습니다.",
        });
      }
      res
        .status(200)
        .json({ status: "success", message: "팀 게시물 삭제 완료" });
    } catch (error) {
      next(error);
    }
  },
};
