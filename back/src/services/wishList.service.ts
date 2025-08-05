import wishlistRepository from '../repositories/wishList.repository'
import { AddWishListRequest, WishListResponse } from '../types/wishList.type';
import { bookService } from './book.service';

class WishlistService {

  addWish = async (userId: number, data: AddWishListRequest) => {
    const existingWish = await wishlistRepository.findWishByUserIdAndIsbn(
      userId,
      data.isbn13
    );

    if (existingWish) {
      throw new Error('BookAlreadyInWishlist');
    }

    await bookService.getBookDetail(data.isbn13);

    return wishlistRepository.addWish(userId, data);
  };

  removeWish = async (userId: number, isbn13: string) => {
    const existingWish = await wishlistRepository.findWishByUserIdAndIsbn(
      userId,
      isbn13
    );

    if (!existingWish) {
      throw new Error('WishNotFound');
    }

    return wishlistRepository.removeWish(userId, isbn13);
  };

  getWishlist = async (userId: number): Promise<WishListResponse[]> => {
    const wishlist = await wishlistRepository.findWishListByUserId(userId);
    return wishlist;
  };
}

export default new WishlistService();