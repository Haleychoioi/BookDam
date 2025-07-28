// book.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AladinQueryType, AladinSortType, AladinSearchTarget, AladinListType, AladinLookupRequest, AladinCoverSize, AladinItemIdType } from '../types/book.type';
import { aladinApiService } from '../services/aladin-api.service';

const getCategoryId = (category?: string): number => {
  const categoryIdMap: { [key: string]: number } = {
    '소설': 1,
    '에세이': 55889,
    '자기계발': 336,
    '경영': 170,
    '인문학': 656,
    '역사': 74,
    '과학': 983,
    '사회과학': 798,
    '예술': 517,
    '만화': 2551,
    '장르소설': 112011,
    '고전': 2105,
    '전체': 0
  };

  return category ? (categoryIdMap[category] || 0) : 0;
};
class BookController {

  // searchBooks = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { keyword, type, category, page, limit, sort } = req.query;

  //     // 검색어 필수 검증
  //     if (!keyword || typeof keyword !== 'string') {
  //       return res.status(400).json({
  //         status: 'error',
  //         message: '검색어를 입력해주세요.'
  //       });
  //     }

  //     // 카테고리 변환 (Controller 역할)
  //     const categoryId = category && !isNaN(parseInt(category as string))
  //       ? parseInt(category as string)
  //       : 0;

  //     // AladinApiService용 파라미터 생성
  //     const aladinParams = {
  //       Query: keyword,
  //       QueryType: this.mapQueryType(type as string),        // enum 변환
  //       SearchTarget: AladinSearchTarget.BOOK,
  //       Start: page ? parseInt(page as string) : 1,
  //       MaxResults: Math.min(limit ? parseInt(limit as string) : 30, 50),
  //       Sort: this.mapSortType(sort as string),              // enum 변환
  //       CategoryId: categoryId
  //     };

  //     // AladinApiService 직접 호출
  //     const result = await aladinApiService.searchBooks(aladinParams);

  //     res.status(200).json({
  //       status: 'success',
  //       message: '도서 검색 성공',
  //       data: result
  //     });

  //   } catch (error) {
  //     next(error);
  //   }
  // }




  // getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { category, page = 1, limit = 35 } = req.query;
  //     const categoryId = getCategoryId(category as string);

  //     const [bestsellers, newBooks] = await Promise.all([
  //       aladinApiService.getBookList({
  //         QueryType: AladinListType.BESTSELLER,
  //         Start: 1,
  //         MaxResults: 20,
  //         CategoryId: categoryId
  //       }),
  //       aladinApiService.getBookList({
  //         QueryType: AladinListType.NEW_ALL,
  //         Start: 1,
  //         MaxResults: 15,
  //         CategoryId: categoryId
  //       })
  //     ]);

  //     // 중복 제거
  //     const bookMap = new Map();

  //     // 베스트셀러 우선
  //     bestsellers.item.forEach(book => {
  //       bookMap.set(book.isbn13, book);
  //     });

  //     // 신간 추가 (중복되지 않는 것만)
  //     newBooks.item.forEach(book => {
  //       if (!bookMap.has(book.isbn13)) {
  //         bookMap.set(book.isbn13, book);
  //       }
  //     });

  //     const uniqueBooks = Array.from(bookMap.values());

  //     res.status(200).json({
  //       status: 'success',
  //       message: '전체 도서 목록 조회 성공',
  //       data: { item: uniqueBooks }
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // 상품 리스트 -  베스트셀러
  
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


  // 상품 조회
  getBookDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { itemId } = req.params;

      if (!itemId) {
        return res.status(400).json({
          status: 'error',
          message: '도서 ISBN을 입력해주세요'
        });
      }

      // 숫자가 아닌 경우 검증 -> validation 추가하가

      //쿼리 파라미터에서 추가 옵션들 추출
      const { Cover, OptResult } = req.query;

      const lookUpParams: AladinLookupRequest = {
        ItemId: itemId,
        ItemIdType: itemId.length === 13 ? AladinItemIdType.ISBN13 : AladinItemIdType.ITEM_ID,
        Cover: Cover as AladinCoverSize,
        OptResult: OptResult
          ? (OptResult as string).split(',')
          : ['description', 'fulldescription', 'fulldescription2', 'toc', 'story', 'subInfo']
      }

      const result = await aladinApiService.getBookDetail(lookUpParams);

      res.status(200).json({
        status: 'success',
        message: '도서 상세 조회 성공',
        data: result
      })

    } catch (error) {
      next(error);
    }
  }



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