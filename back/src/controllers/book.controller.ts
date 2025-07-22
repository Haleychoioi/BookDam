// controllers/book.controller.ts
import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';
import { BookSearchParams } from '../types/book.type';

export class BookController {
  
  // ===== 도서 검색 =====
  
  // 키워드로 도서 검색
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

      // queryType 유효성 검사
      const validQueryTypes = ['title', 'author', 'publisher', 'keyword'];
      const queryType = type && validQueryTypes.includes(type as string) 
        ? type as 'title' | 'author' | 'publisher' | 'keyword'
        : 'keyword';

      // sort 유효성 검사
      const validSortTypes = ['accuracy', 'publishTime', 'title', 'salesPoint'];
      const sortType = sort && validSortTypes.includes(sort as string)
        ? sort as 'accuracy' | 'publishTime' | 'title' | 'salesPoint'
        : 'accuracy';

      const searchParams: BookSearchParams = {
        query: keyword,
        queryType: queryType,
        category: category as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sort: sortType
      };

      const result = await bookService.searchBooks(searchParams);

      res.status(200).json({
        status: 'success',
        message: '도서 검색 성공',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();