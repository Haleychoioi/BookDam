import prisma from '../utils/prisma';
import { ReadingStatus } from '@prisma/client';

class TasteAnalysisRepository {

    async findCompletedBookByUser(userId: number) {
        return await prisma.myLibrary.findMany({
            where: {
                userId: userId,
                status: ReadingStatus.COMPLETED,
            },
            include: {
                book: true,
            },
        });
    }
}

export default new TasteAnalysisRepository();