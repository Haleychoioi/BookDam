import { Request, Response, NextFunction } from "express";
import wishListService from "../services/wishList.service";
import { bookService } from "../services/book.service";

class WishListController {

    // 추가
    addWish = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const { isbn13 } = req.body;

            if (!isbn13) {
                return res.status(400).json({ message: 'isbn13은 필수' });
            }

            //도서관련된 모든곳에 추가
            await bookService.getBookDetail(isbn13);

            const newWish = await wishListService.addWish(userId, { isbn13 });

            return res.status(200).json({ message: '위시리스트에 추가되었습니다.', data: newWish });

        } catch (error) {
            next(error);
        }
    }

    // 삭제
    removeWish = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const { isbn13 } = req.params;

            if (!isbn13) {
                return res.status(400).json({ message: 'isbn13은 필수' });
            }

            await wishListService.removeWish(userId, isbn13);

            return res.status(200).json({ message: '위시리스트에서 삭제되었습니다.', data: { isbn13 } })
        } catch (error) {
            next(error);
        }
    }

    // 위시리스트 조회
    getWishList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!;
            const wishList = await wishListService.getWishlist(userId);

            return res.status(200).json({ data: wishList })

        } catch (error) {
            next(error);
        }
    }
}

export default new WishListController();