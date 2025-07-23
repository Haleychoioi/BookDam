import { Request, Response, NextFunction } from "express";
import { communityService } from "../services/community.service";

export const communityController = {
  // 퍼블릭 커뮤니티 목록 조회 (GET /communities)
  async getPublicCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");
      const sort = (req.query.sort as string) || "latest";

      const { communities, totalPages, currentPage } =
        await communityService.getPublicCommunities({ page, size, sort });
      res.status(200).json({ communities, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 특정 도서 관련 커뮤니티 목록 조회 (GET /communities/books/:bookId)
  async getCommunitiesByBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookIsbn13 = req.params.bookId;
      const page = parseInt((req.query.page as string) || "1");
      const size = parseInt((req.query.size as string) || "10");

      const { communities, totalPages, currentPage } =
        await communityService.getCommunitiesByBook(bookIsbn13, { page, size });
      res.status(200).json({ communities, totalPages, currentPage });
    } catch (error) {
      next(error);
    }
  },

  // 커뮤니티 가입 신청 (POST /communities/:postId/apply)
  async applyForCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const postId = parseInt(req.params.postId);
      const { applicationMessage } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      await communityService.applyForCommunity(
        userId,
        postId,
        applicationMessage
      );
      res.status(201).json({ status: "success", message: "가입 신청 완료" });
    } catch (error) {
      next(error);
    }
  },

  // 도서 기반 커뮤니티 생성 (POST /communities)
  async createTeamCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { bookId, name, description, category, maxMembers } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "인증 정보가 없습니다." });
      }

      const newCommunity = await communityService.createTeamCommunity(userId, {
        bookId,
        name,
        description,
        category,
        maxMembers,
      });
      res
        .status(201)
        .json({ status: "success", communityId: newCommunity.teamId });
    } catch (error) {
      next(error);
    }
  },
};
