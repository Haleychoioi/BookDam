// book.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AladinQueryType, AladinSortType, AladinSearchTarget, AladinListType, AladinLookupRequest, AladinCoverSize, AladinItemIdType } from '../types/book.type';
import { aladinApiService } from '../services/aladin-api.service';
import { bookService } from '../services/book.service';
import { getCategoryId } from '../constants/categories';

class BookController {

  // 도서 검색 , 검색안하면 전체 리스트 반환
  searchBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, type, category, page, limit, sort } = req.query;

    // 검색어가 없으면 전체 리스트 반환
    if (!keyword || keyword.toString().trim() === '') {
      const categoryId = getCategoryId(category as string);
      
      const [bestsellers, newBooks] = await Promise.all([
        aladinApiService.getBookList({
          QueryType: AladinListType.BESTSELLER,
          Start: 1,
          MaxResults: 20,
          CategoryId: categoryId
        }),
        aladinApiService.getBookList({
          QueryType: AladinListType.NEW_ALL,
          Start: 1,
          MaxResults: 15,
          CategoryId: categoryId
        })
      ]);

      // 중복 제거 로직
      const bookMap = new Map();
      bestsellers.item.forEach(book => {
        bookMap.set(book.isbn13, book);
      });
      newBooks.item.forEach(book => {
        if (!bookMap.has(book.isbn13)) {
          bookMap.set(book.isbn13, book);
        }
      });

      const uniqueBooks = Array.from(bookMap.values());

      return res.status(200).json({
        status: 'success',
        message: '전체 도서 목록 조회 성공',
        data: { item: uniqueBooks }
      });
    }

    // 검색어가 있으면 기존 검색 로직
    const categoryId = getCategoryId(category as string);

    const aladinParams = {
      Query: keyword as string,
      QueryType: this.mapQueryType(type as string),
      SearchTarget: AladinSearchTarget.BOOK,
      Start: page ? parseInt(page as string) : 1,
      MaxResults: Math.min(limit ? parseInt(limit as string) : 30, 50),
      Sort: this.mapSortType(sort as string),
      CategoryId: categoryId
    };

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
  
// 상품 리스트 - 베스트셀러
  getBestSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, categoryId } = req.query;

      const aladinParams = {
        QueryType: AladinListType.BESTSELLER,
        Start: page ? parseInt(page as string) : 1,
        MaxResults: Math.min(limit ? parseInt(limit as string) : 30, 50),
        CategoryId: categoryId ? parseInt(categoryId as string) : 0
      }

      const result = await aladinApiService.getBookList(aladinParams);

      res.status(200).json({
        status: 'success',
        message: '베스트셀러 조회 성공',
        data: result
      })

    } catch (error) {
      next(error);
    }
  }


  // 상품 리스트 - 신간리스트
  getNewBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, categoryId } = req.query;

      const aladinParams = {
        QueryType: AladinListType.NEW_ALL,
        Start: page ? parseInt(page as string) : 1,
        MaxResults: Math.min(limit ? parseInt(limit as string) : 30, 50),
        CategoryId: categoryId ? parseInt(categoryId as string) : 0
      }

      const result = await aladinApiService.getBookList(aladinParams);

      res.status(200).json({
        status: 'success',
        message: '신간도서 조회 성공',
        data: result
      })

    } catch (error) {
      next(error);
    }
  }

  // 상품 리스트 - 주목할 신간
  getSpecialNewBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { page, limit, categoryId } = req.query;

      const aladinParams = {
        QueryType: AladinListType.NEW_SPECIAL,
        Start: page ? parseInt(page as string) : 1,
        MaxResults: Math.min(limit ? parseInt(limit as string) : 30, 50),
        CategoryId: categoryId ? parseInt(categoryId as string) : 0
      };

      const result = await aladinApiService.getBookList(aladinParams);

      res.status(200).json({
        status: 'success',
        message: '주목할 신간 조회 성공',
        data: result
      })

    } catch (error) {
      next(error);
    }
  }


  // 상품 상세 조회
getBookDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;

    // 🔍 로그 추가
    console.log(`🔍 도서 상세 API 호출: ${itemId}`);
    console.log(`⏰ 호출 시간: ${new Date().toISOString()}`);
    console.log(`📍 User-Agent: ${req.headers['user-agent']?.substring(0, 50)}`);

    if (!itemId) {
      return res.status(400).json({
        status: 'error',
        message: '도서 ISBN을 입력해주세요'
      });
    }

    console.log(`📚 bookService.getBookDetail 호출 시작: ${itemId}`);
    const result = await bookService.getBookDetail(itemId);
    console.log(`✅ bookService.getBookDetail 완료: ${itemId}`);

    res.status(200).json({
      status: 'success',
      message: '도서 상세 조회 성공',
      data: result
    });

  } catch (error) {
    console.error(`❌ 도서 상세 조회 에러: ${req.params.itemId}`, error);
    next(error);
  }
}

  // 상품 상세 조회
//   getBookDetail = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { itemId } = req.params;

//     if (!itemId) {
//       return res.status(400).json({
//         status: 'error',
//         message: '도서 ISBN을 입력해주세요'
//       });
//     }

//     const result = await bookService.getBookDetail(itemId);

//     res.status(200).json({
//       status: 'success',
//       message: '도서 상세 조회 성공',
//       data: result
//     });

//   } catch (error) {
//     next(error);
//   }
// }
  
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