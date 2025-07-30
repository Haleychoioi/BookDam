import { ReadingStatus } from "@prisma/client";


export interface UpsertMyLibraryRequest {
    isbn13: string;
    status: ReadingStatus;
    myRating?: number;
}


export interface MyLibraryResponse {
    libraryId: number;
    status: ReadingStatus;
    myRating: number | null;
    updatedAt: Date;

    book: {
        isbn13: string;
        title: string;
        author: string;
        publisher: string;
        cover: string | null;
        category: string | null;
    };

    user: {
        nickname: string;
    }
}

