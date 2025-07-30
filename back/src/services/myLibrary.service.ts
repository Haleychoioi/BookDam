import myLibraryRepository from "../repositories/myLibrary.repository";
import { UpsertMyLibraryRequest, MyLibraryResponse } from "../types/myLibrary.type";
import { ReadingStatus } from "@prisma/client";

class MyLibraryService {

    // 에러 미들웨어에 추가해야됨
    // 읽었음이면 별점 필수
    upsertBookInLibrary = async (userId: number, data: UpsertMyLibraryRequest) => {
    // 읽었음 상태로 변경 -> 별점은 필수
    if (data.status === 'COMPLETED' && (data.myRating === null || data.myRating === undefined)) {
      throw new Error('RatingRequiredForCompletion');
    }

    // 별점 0 ~5 사이로
    if (data.myRating !== undefined && data.myRating !== null && (data.myRating < 1 || data.myRating > 5)) {
      throw new Error('InvalidRatingRange');
    }

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