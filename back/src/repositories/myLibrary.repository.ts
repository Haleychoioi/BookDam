import prisma from '../utils/prisma';
import { UpsertMyLibraryRequest } from '../types/myLibrary.type';
import { ReadingStatus } from '@prisma/client';

class MyLibraryRepository {

    upsertBookInLibrary = async (userId: number, data: UpsertMyLibraryRequest) => {
        return prisma.myLibrary.upsert({
            where: {
                userId_isbn13: {
                    userId: userId,
                    isbn13: data.isbn13,
                },
            },
            // 데이터가 있으면 업데이트
            update: {
                status: data.status,
                myRating: data.myRating
            },
            // 데이터 없으면 생성
            create: {
                userId: userId,
                isbn13: data.isbn13,
                status: data.status,
                myRating: data.myRating,
            },
        })
    }

      findBooksByUserId = async (userId: number, take: number, skip: number, status?: ReadingStatus) => {
    const whereCondition = { userId, status };

    const [books, totalCount] = await Promise.all([
      prisma.myLibrary.findMany({
        where: whereCondition,
        orderBy: { updatedAt: 'desc' },
        take: take,
        skip: skip,
        select: {
          libraryId: true,
          status: true,
          myRating: true,
          updatedAt: true,
          book: { select: { isbn13: true, title: true, author: true, publisher: true, cover: true, category: true, }, },
          user: { select: { nickname: true, }, },
        },
      }),
      prisma.myLibrary.count({
        where: whereCondition,
      }),
    ]);

    return { books, totalCount };
  };
    // findBooksByUserId = async (userId: number, status?: ReadingStatus) => {
    //     return prisma.myLibrary.findMany({
    //         where: {
    //             userId,
    //             status: status,
    //         },
    //         orderBy: {
    //             updatedAt: 'desc'
    //         },
    //         select: {
    //             libraryId: true,
    //             status: true,
    //             myRating: true,
    //             updatedAt: true,
    //             book: {
    //                 select: {
    //                     isbn13: true,
    //                     title: true,
    //                     author: true,
    //                     publisher: true,
    //                     cover: true,
    //                     category: true,
    //                 },
    //             },
    //             user: {
    //                 select: {
    //                     nickname: true,
    //                 },
    //             },
    //         },
    //     });
    // }

    // 서재에 도서가 존재하는지 확인 
    findMyLibraryItemByUniqueKey = async (userId: number, isbn13: string) => {
        return await prisma.myLibrary.findUnique({
            where: {
                userId_isbn13: {
                    userId,
                    isbn13
                }
            }
        })
    }

    // 서재 도서 삭제하기
    deleteMyLibraryItem = async (userId: number, isbn13: string) => {
        return await prisma.myLibrary.delete({
            where: {
                userId_isbn13: {
                    userId,
                    isbn13
                }
            }
        })
    }
}

export default new MyLibraryRepository();