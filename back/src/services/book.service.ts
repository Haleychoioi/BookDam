import { bookRepository } from "../repositories/book.repository";
import { aladinApiService } from "./aladin-api.service";
import { AladinBookItem, BookCreateData } from "../types/book.type";
import { CATEGORY_MAPPING } from "../constants/categories";
import { AladinItemIdType } from "../types/book.type";

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
        ItemIdType: isISBN13
          ? AladinItemIdType.ISBN13
          : AladinItemIdType.ITEM_ID,
        OptResult: ["Toc", "Story"],
      });
      book = await this.saveBook(response.item[0]);
    }

    return book;
  }

  // 알라딘 책 정보를 DB에 저장 (중복 체크 제거)
  async saveBook(aladinBook: AladinBookItem) {
    try {
      // 변환 후 바로 저장 (getBookDetail에서 이미 중복 체크했음)
      const bookData = this.toBookCreateData(aladinBook);
      return await bookRepository.create(bookData);
    } catch (error: any) {
      // 이미 존재하는 책일 경우
      if (error.code === "P2002") {
        return await bookRepository.findByIsbn(aladinBook.isbn13);
      }
      throw error;
    }
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
  };

  private mapCategory(aladinCategory: string): string {
    const mainCategory = this.extractMainCategory(aladinCategory);
    if (mainCategory) {
      return (
        CATEGORY_MAPPING[mainCategory as keyof typeof CATEGORY_MAPPING] ||
        mainCategory
      );
    }
    return "기타";
  }

  private extractMainCategory(fullCategory: string): string | null {
    if (fullCategory.startsWith("국내도서>")) {
      const parts = fullCategory.split(">");
      return parts[1]?.trim();
    }
    return null;
  }
}

export const bookService = new BookService();
