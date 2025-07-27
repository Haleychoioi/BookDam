import { bookRepository } from '../repositories/book.repository';
import { 
  BookSearchParams, 
  BookSearchResponse,
  BookSummary,
  AladinBookItem,
  AladinQueryType,
  AladinSearchTarget,
  AladinSortType
} from '../types/book.type';

export class BookService {

  // ===== 검색 관련 메서드들 =====

  // 도서 검색
  async searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
    try {
      // 사용자 파라미터를 알라딘 API 파라미터로 변환
      const aladinParams = {
        Query: params.query,
        QueryType: this.mapQueryType(params.queryType),
        SearchTarget: AladinSearchTarget.BOOK,
        Start: params.page || 1,
        MaxResults: Math.min(params.limit || 10, 50), // 최대 50개 제한
        Sort: this.mapSortType(params.sort)
      };

      const response = await bookRepository.searchBooks(aladinParams);
      
      // 알라딘 응답을 클라이언트 응답으로 변환
      return {
        totalResults: response.totalResults,
        currentPage: params.page || 1,
        itemsPerPage: params.limit || 10,
        books: response.item.map(this.toBookSummary)
      };

    } catch (error) {
      console.error('도서 검색 서비스 오류:', error);
      throw new Error('도서 검색 중 오류가 발생했습니다.');
    }
  }

  // ===== 데이터 변환 메서드들 =====

  // 알라딘 도서 정보를 BookSummary로 변환
  private toBookSummary = (aladinBook: AladinBookItem): BookSummary => {
    return {
      isbn13: aladinBook.isbn13,
      title: aladinBook.title,
      author: aladinBook.author,
      publisher: aladinBook.publisher,
      pubDate: aladinBook.pubDate || null,
      cover: aladinBook.cover || null,
      category: this.mapCategory(aladinBook.categoryName),
      description: aladinBook.description || null,
    };
  }

  // ===== 매핑 유틸리티 메서드들 =====

  // 검색 타입 매핑
  private mapQueryType(queryType?: string): AladinQueryType {
    switch (queryType) {
      case 'title': return AladinQueryType.TITLE;
      case 'author': return AladinQueryType.AUTHOR;
      case 'publisher': return AladinQueryType.PUBLISHER;
      default: return AladinQueryType.KEYWORD;
    }
  }

  // 정렬 타입 매핑
  private mapSortType(sort?: string): AladinSortType {
    switch (sort) {
      case 'publishTime': return AladinSortType.PUBLISH_TIME;
      case 'title': return AladinSortType.TITLE;
      case 'salesPoint': return AladinSortType.SALES_POINT;
      default: return AladinSortType.ACCURACY;
    }
  }

  // 카테고리 매핑 (알라딘 카테고리명 → 우리 카테고리)
  private mapCategory(aladinCategory: string): string | null {
    const categoryMap: { [key: string]: string } = {
      '소설': '소설',
      '에세이': '에세이',
      '자기계발': '자기계발',
      '경영': '경영',
      '인문학': '인문학',
      '역사': '역사',
      '과학': '과학',
      '철학': '철학',
      '심리학': '심리학',
      '컴퓨터': '컴퓨터',
      '외국어': '외국어',
      '여행': '여행',
      '요리': '요리',
      '건강': '건강',
      '취미': '취미',
      '아동': '아동',
      '청소년': '청소년'
    };

    return categoryMap[aladinCategory] || aladinCategory;
  }
}

export const bookService = new BookService();