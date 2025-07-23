// book.repository.ts
import { PrismaClient } from '@prisma/client';
import { BookCreateData } from '../types/book.type';

const prisma = new PrismaClient();

export class BookRepository {
    
    // 책 조회 (ISBN으로)
    async findByIsbn(isbn13: string) {
        return await prisma.book.findUnique({
            where: { isbn13 }
        });
    }

    // 책 생성
    async create(data: BookCreateData) {
        return await prisma.book.create({
            data
        });
    }

}

export const bookRepository = new BookRepository();