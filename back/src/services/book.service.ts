// book.service.ts
import { bookRepository } from '../repositories/book.repository';
import { aladinApiService } from './aladin-api.service';
import { AladinBookItem, BookCreateData } from '../types/book.type';

export class BookService {

  // 상품조회 = aladin에서 getBookDetail안만듦
  // async getBookDetail(isbn13: string) {
  //   let book = await bookRepository.findByIsbn(isbn13);
  //   if (!book) {
  //     const response = await aladinApiService.getBookDetail({
  //       ItemId: isbn13,
  //       OptResult: ['Toc', 'Story']
  //     });
  //     book = await this.saveBook(response.item[0]);
  //   }

  //   return book;
  // }


  //알라딘 책 정보 → DB에 이미 있는지 확인 → 없으면 DB컬럼 형식으로 변환해서 저장
  // 책을 DB에 저장 => 책 캐싱
  async saveBook(aladinBook: AladinBookItem) {

    // 이미 있는지 확인
    const existingBook = await bookRepository.findByIsbn(aladinBook.isbn13);
    if (existingBook) {
      return existingBook;
    }

    // 변환 후 저장
    const bookData = this.toBookCreateData(aladinBook);
    return await bookRepository.create(bookData);
  }

  // 알라딘 도서 정보를 BookCreateData로 변환
  private toBookCreateData = (aladinBook: AladinBookItem): BookCreateData => {
    return {
      isbn13: aladinBook.isbn13,
      title: aladinBook.title,
      author: aladinBook.author,
      publisher: aladinBook.publisher,
      pubDate: aladinBook.pubDate || null,
      description: aladinBook.description || null,
      cover: aladinBook.cover || null,
      category: this.mapCategory(aladinBook.categoryName),
      pageCount: aladinBook.subInfo?.itemPage || null,
      toc: aladinBook.subInfo?.toc || null,
      story: aladinBook.subInfo?.story || null,
    };
  }


  // book.service.ts - mapCategory 개선
  private mapCategory(aladinCategory: string): string | null {
    // "국내도서>" 다음의 첫 번째 카테고리 추출
    const mainCategory = this.extractMainCategory(aladinCategory);

    const categoryMap: { [key: string]: string } = {
      '소설/시/희곡': '소설',
      '에세이': '에세이',
      '자기계발': '자기계발',
      '경제경영': '경영',
      '인문학': '인문학',
      '역사': '역사',
      '자연과학': '과학',
      '요리/살림': '요리',
      // ...
    };

    return mainCategory ? (categoryMap[mainCategory] || mainCategory) : null;
  }

  // 메인 카테고리 추출 헬퍼 함수
  private extractMainCategory(fullCategory: string): string | null {
    if (fullCategory.startsWith('국내도서>')) {
      const parts = fullCategory.split('>');
      return parts[1]?.trim(); // "소설/시/희곡"
    }
    return null;
  }


  // 카테고리 매핑 (알라딘 카테고리명 → 우리 카테고리)
  // private mapCategory(aladinCategory: string): string | null {
  //   const categoryMap: { [key: string]: string } = {
  //     '소설': '소설',
  //     '에세이': '에세이',
  //     '자기계발': '자기계발',
  //     '경영': '경영',
  //     '인문학': '인문학',
  //     '역사': '역사',
  //     '과학': '과학',
  //     '철학': '철학',
  //     '심리학': '심리학',
  //     '컴퓨터': '컴퓨터',
  //     '외국어': '외국어',
  //     '여행': '여행',
  //     '요리': '요리',
  //     '건강': '건강',
  //     '취미': '취미',
  //     '아동': '아동',
  //     '청소년': '청소년'
  //   };

  //   return categoryMap[aladinCategory] || aladinCategory;
  // }
}

export const bookService = new BookService();