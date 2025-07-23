import { URLSearchParams } from 'url';
import {
    AladinSearchRequest,
    AladinListRequest,
    AladinLookupRequest,
    AladinApiResponse,
    AladinSearchTarget,
    AladinQueryType,
    AladinOutputType,
    AladinCoverSize
} from '../types/book.type';

export class AladinApiService {
    private readonly ALADIN_API_KEY = process.env.ALADIN_API_KEY!;
    private readonly BASE_URL = 'http://www.aladin.co.kr/ttb/api';

    // 상품 검색
    async searchBooks(params: AladinSearchRequest): Promise<AladinApiResponse> {
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
            throw new Error('Aladin');
        }
    }


    // 상품 리스트 
    async getBookList(params: AladinListRequest): Promise<AladinApiResponse> {
        try {
            const url = `${this.BASE_URL}/ItemList.aspx`;

            const queryParams = {
                ttbkey: this.ALADIN_API_KEY,
                QueryType: params.QueryType,
                SearchTarget: params.SearchTarget || AladinSearchTarget.BOOK,
                Start: params.Start || 1,
                MaxResults: params.MaxResults || 10,
                Cover: params.Cover || AladinCoverSize.MID,
                CategoryId: params.CategoryId || 0,
                Output: params.Output || AladinOutputType.JS,
                Version: params.Version || '20131101',
                Year: params.Year,
                Month: params.Month,
                Week: params.Week
            };

            // queryParams에서 undefined인 값을 제거
            // Object.entries 객체를 배열로 반환
            // filter로 값이 있는 배열만 거르고 fromEntires로 다시 객체로 반환
            const cleanParams = Object.fromEntries(
                Object.entries(queryParams).filter(([_, value])=> value !== undefined)
            );

            // URLSearchParams = URL의 쿼리 문자열을 만들어줌
            // as = 타입 단원/ 모든 키와 값이 string
            const queryString = new URLSearchParams(cleanParams as Record<string, string>);
            const response = await fetch(`${url}?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AladinApiResponse = await response.json();
            return data;

        } catch(error) {
            console.error('알라딘 상품 리스트 API 오류', error);
            throw new Error('Aladin');
        }
    }


    // 상품 조회 
    // async getBookDetail(params: AladinLookupRequest): Promise<AladinApiResponse> {
    //     try {
    //         const url = `${this.BASE_URL}/ItemLookUp.aspx`;

    //     } catch(error) {
    //         console.error('알라딘 상품 조회 API 오류');
    //         throw new Error('Aladin');
    //     }

    // }

}

export const aladinApiService = new AladinApiService();