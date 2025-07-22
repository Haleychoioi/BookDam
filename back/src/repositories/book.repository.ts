import {
    AladinSearchRequest,
    AladinListRequest,
    AladinLookupRequest,
    AladinApiResponse,
    AladinSearchTarget,
    AladinQueryType,
    AladinOutputType,
    AladinCoverSize,
    AladinListType,
    AladinItemIdType
} from '../types/book.type';

export class BookRepository {
    private readonly ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
    private readonly BASE_URL = 'http://www.aladin.co.kr/ttb/api';

    // 1. 상품 검색 API
    async searchBooks(params: AladinSearchRequest) {
        try {
            const url = `${this.BASE_URL}/ItemSearch.aspx`;

            const queryParams = {
                ttbkey: this.ALADIN_API_KEY,
                Query: params.Query,
                QueryType: params.QueryType || AladinQueryType.KEYWORD,
                SearchTarget: params.SearchTarget || AladinSearchTarget.BOOK,
                Start: params.Start || 1,
                MaxResults: params.MaxResults || 10,
                Sort: params.Sort,
                Cover: params.Cover || AladinCoverSize.MID,
                CategoryId: params.CategoryId || 0,
                Output: params.Output || AladinOutputType.JS,
                Version: params.Version || '20131101',
                outofStockfilter: params.outofStockfilter || 0,
                RecentPublishFilter: params.RecentPublishFilter || 0
            };

            // undefined 값들 제거
            const cleanParams = Object.fromEntries(
                Object.entries(queryParams).filter(([_, value]) => value !== undefined)
            );

            const queryString = new URLSearchParams(cleanParams as Record<string, string>);
            const response = await fetch(`${url}?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AladinApiResponse = await response.json();
            return data;

        } catch (error) {
            console.error('알라딘 검색 API 오류:', error);
            throw new Error('도서 검색 중 오류가 발생했습니다.');
        }
    }

}

export const bookRepository = new BookRepository();