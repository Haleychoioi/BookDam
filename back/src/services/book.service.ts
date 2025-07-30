import { bookRepository } from '../repositories/book.repository';
import { aladinApiService } from './aladin-api.service';
import { AladinBookItem, BookCreateData } from '../types/book.type';
import { CATEGORY_MAPPING } from '../constants/categories';
import { AladinItemIdType } from '../types/book.type';

export class BookService {

  // 상품 조회
  async getBookDetail(identifier: string) {
  const isISBN13 = /^97[89]\d{10}$/.test(identifier);
  
  let book;
  
  // ISBN13이면 DB에서 먼저 찾아보기
  if (isISBN13) {
    book = await bookRepository.findByIsbn(identifier);
  }
  
  // DB에 없거나 itemId면 알라딘 API 호출
  if (!book) {
    const response = await aladinApiService.getBookDetail({
      ItemId: identifier,
      ItemIdType: isISBN13 ? AladinItemIdType.ISBN13 : AladinItemIdType.ITEM_ID, // 이 부분이 핵심!
      OptResult: ['Toc', 'Story']
    });
    book = await this.saveBook(response.item[0]);
  }

  return book;
}

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

  private mapCategory(aladinCategory: string): string | null {
    const mainCategory = this.extractMainCategory(aladinCategory);
    return mainCategory ? (CATEGORY_MAPPING[mainCategory as keyof typeof CATEGORY_MAPPING] || mainCategory) : null;
  }

  private extractMainCategory(fullCategory: string): string | null {
    if (fullCategory.startsWith('국내도서>')) {
      const parts = fullCategory.split('>');
      return parts[1]?.trim();
    }
    return null;
  }

}

export const bookService = new BookService();