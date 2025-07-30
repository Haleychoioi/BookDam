import prisma from '../utils/prisma';
import { AddWishListRequest, WishListResponse } from '../types/wishList.type';

class WishListRepository {

    // 위시 추가
    async addWish(userId: number, data: AddWishListRequest) {
        return await prisma.wishList.create({
            data: {
                userId: userId,
                isbn13: data.isbn13
            }
        })
    }

    // 위시 삭제
    async removeWish(userId: number, isbn13: string) {
        return await prisma.wishList.delete({
            where: {
                userId_isbn13: {
                    userId,
                    isbn13,
                },
            },
        });
    }

    // 사용자의 전체 위시 리스트
    async findWishListByUserId(userId: number) {
        return await prisma.wishList.findMany({
            where: { userId },
            orderBy: {
                addedAt: 'desc'
            },
            select: {
                wishListId: true,
                addedAt: true,
                book: {
                    select: {
                        isbn13: true,
                        title: true,
                        cover: true
                    }
                },
                user: {
                    select: {
                        nickname: true
                    }
                }
            },
        });
    };

    // 위시리스트에 존재하는지 확인
    async findWishByUserIdAndIsbn(userId: number, isbn13: string) {
        return await prisma.wishList.findUnique({
            where: {
                userId_isbn13: {
                    userId,
                    isbn13
                }
            }
        })
    }
}

export default new WishListRepository();