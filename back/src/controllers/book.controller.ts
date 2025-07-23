// book.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AladinQueryType, AladinSortType, AladinSearchTarget } from '../types/book.type';
import { aladinApiService } from '../services/aladin-api.service';

class BookController {

  searchBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { keyword, type, category, page, limit, sort } = req.query;

      // 검색어 필수 검증
      if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: '검색어를 입력해주세요.'
        });
      }

      // 카테고리 변환 (Controller 역할)
      const categoryId = category && !isNaN(parseInt(category as string))
        ? parseInt(category as string)
        : 0;

      // AladinApiService용 파라미터 생성
      const aladinParams = {
        Query: keyword,
        QueryType: this.mapQueryType(type as string),        // enum 변환
        SearchTarget: AladinSearchTarget.BOOK,
        Start: page ? parseInt(page as string) : 1,
        MaxResults: Math.min(limit ? parseInt(limit as string) : 10, 50),
        Sort: this.mapSortType(sort as string),              // enum 변환
        CategoryId: category ? parseInt(category as string) : 0
      };

      // AladinApiService 직접 호출
      const result = await aladinApiService.searchBooks(aladinParams);

      res.status(200).json({
        status: 'success',
        message: '도서 검색 성공',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }


  // 상품 리스트 
  getBookList = async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch(error) {
      next(error);
    }
  }






  // 상품 조회




  // enum 변환 헬퍼 메서드들
  private mapQueryType(type?: string): AladinQueryType {
    switch (type) {
      case 'title': return AladinQueryType.TITLE;
      case 'author': return AladinQueryType.AUTHOR;
      case 'publisher': return AladinQueryType.PUBLISHER;
      default: return AladinQueryType.KEYWORD;
    }
  }

  private mapSortType(sort?: string): AladinSortType {
    switch (sort) {
      case 'publishTime': return AladinSortType.PUBLISH_TIME;
      case 'title': return AladinSortType.TITLE;
      case 'salesPoint': return AladinSortType.SALES_POINT;
      default: return AladinSortType.ACCURACY;
    }
  }
}

export const bookController = new BookController();