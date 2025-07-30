import { Request, Response, NextFunction } from 'express';
import myLibraryService from "../services/myLibrary.service";
import { ReadingStatus } from '@prisma/client';
import { bookService } from '../services/book.service';

class MyLibraryController {

    // 서재 추가, 상태/평점 수정
    upsertBookInLibrary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const { isbn13, status, myRating } = req.body;

            if (!isbn13 || !status) {
                return res.status(400).json({ message: 'isbn13과 status는 필수' });
            }

            await bookService.getBookDetail(isbn13);
            
            const upsertBook = await myLibraryService.upsertBookInLibrary(userId, {
                isbn13,
                status,
                myRating
            })

            return res.status(200).json({ data: upsertBook });

        } catch (error) {
            next(error);
        }
    }


    // 서재 목록 조회
     getBooksInLibrary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!;
      
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const { status } = req.query;

      const result = await myLibraryService.getBooksInLibrary(
        userId,
        page,
        limit,
        status as ReadingStatus | undefined
      );

      return res.status(200).json({ data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };
    // getBooksLibrary = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const userId = req.user!;
    //         const { status } = req.query;

    //         const books = await myLibraryService.getBooksInLibrary(userId, status as ReadingStatus | undefined);

    //         return res.status(200).json({ data: books })

    //     } catch (error) {
    //         next(error);
    //     }
    // }


    deleteBookFromLibrary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const { isbn13 } = req.params;

            await myLibraryService.deleteBookFromLibrary(userId, isbn13);

            return res.status(200).json({ message: '내 서재에서 책을 삭제했습니다.' });
        } catch (error) {
            next(error);
        }
    };
}

export default new MyLibraryController();