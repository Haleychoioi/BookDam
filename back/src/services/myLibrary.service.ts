import { bookRepository } from "../repositories/book.repository";
import myLibraryRepository from "../repositories/myLibrary.repository";
import { UpsertMyLibraryRequest, MyLibraryResponse } from "../types/myLibrary.type";
import { ReadingStatus } from "@prisma/client";
import { bookService } from "./book.service";

class MyLibraryService {

  // 읽었음이면 별점 필수
  upsertBookInLibrary = async (userId: number, data: UpsertMyLibraryRequest) => {

  // 별점 범위 검증
  if (data.myRating !== undefined && data.myRating !== null && (data.myRating < 1 || data.myRating > 5)) {
    throw new Error('InvalidRatingRange');
  }

  // 상태가 명시되지 않았고 별점이 있으면 COMPLETED로 설정
  if (!data.status && data.myRating !== null && data.myRating !== undefined) {
    data.status = 'COMPLETED';
  }

  // COMPLETED 상태가 아니면 별점 null
  if (data.status !== 'COMPLETED') {
    data.myRating = null;
  }

  // COMPLETED 상태인데 별점이 없으면 에러
  if (data.status === 'COMPLETED' && (data.myRating === null || data.myRating === undefined)) {
    throw new Error('RatingRequiredForCompletion');
  }

  await bookService.getBookDetail(data.isbn13);
  
  return myLibraryRepository.upsertBookInLibrary(userId, data);
};

  getBooksInLibrary = async (userId: number, page: number, limit: number, status?: ReadingStatus) => {
    const offset = (page - 1) * limit;

    const { books, totalCount } = await myLibraryRepository.findBooksByUserId(
      userId,
      limit,
      offset,
      status
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: books,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  deleteBookFromLibrary = async (userId: number, isbn13: string) => {
    const existingItem = await myLibraryRepository.findMyLibraryItemByUniqueKey(userId, isbn13);

    if (!existingItem) {
      throw new Error('BookNotInLibrary');
    }

    return myLibraryRepository.deleteMyLibraryItem(userId, isbn13);
  };
}

export default new MyLibraryService();