export interface AddWishListRequest {
    isbn13: string;
}

export interface WishListResponse {
    wishListId: number;
    addedAt: Date;
    book: {
        isbn13: string;
        title: string;
        cover: string | null;
    }
    user: {
        nickname: string;
    }
}