import prisma from "../utils/prisma";
import { BookCreateData } from '../types/book.type';

export class BookRepository {
    
    // 책 조회 (ISBN으로)
    async findByIsbn(isbn13: string) {
        return await prisma.book.findUnique({
            where: { isbn13 }
        });
    }

    // 책 생성 => data에서 에러나면 npx prisma generate
    async create(data: BookCreateData) {
        return await prisma.book.create({
            data
        });
    }

}

export const bookRepository = new BookRepository();