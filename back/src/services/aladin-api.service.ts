import { URLSearchParams } from 'url';
import {
    AladinSearchRequest,
    AladinListRequest,
    AladinLookupRequest,
    AladinApiResponse,
    AladinSearchTarget,
    AladinQueryType,
    AladinOutputType,
    AladinCoverSize,
    AladinItemIdType
} from '../types/book.type';
import { query } from 'express-validator';
import { join } from 'path';

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
                Object.entries(queryParams).filter(([_, value]) => value !== undefined)
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

        } catch (error) {
            console.error('알라딘 상품 리스트 API 오류', error);
            throw new Error('Aladin');
        }
    }



    // // 상품 조회
    async getBookDetail(params: AladinLookupRequest): Promise<AladinApiResponse> {
        try {
            const url = `${this.BASE_URL}/ItemLookUp.aspx`;

            const queryParams = {
                ttbkey: this.ALADIN_API_KEY,
                ItemId: params.ItemId,                                    
                ItemIdType: params.ItemIdType || AladinItemIdType.ITEM_ID, 
                Cover: params.Cover || AladinCoverSize.MID,               
                Output: params.Output || AladinOutputType.JS,             
                Version: params.Version || '20131101',                    
                OptResult: params.OptResult?.join(',')                    
            };

            console.log('알라딘 API 요청 파라미터 (대문자):', queryParams);

            const cleanParams = Object.fromEntries(
                Object.entries(queryParams).filter(([_, value]) => value !== undefined)
            );

            const queryString = new URLSearchParams(cleanParams as Record<string, string>);
            const finalUrl = `${url}?${queryString}`;

            console.log('최종 요청 URL (대문자):', finalUrl);

            const response = await fetch(finalUrl);

            console.log('응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP 에러 응답:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('응답 전체 내용 (처음 200자):', responseText.substring(0, 200));

            const data = JSON.parse(responseText);

            if (data.errorCode) {
                console.error('알라딘 API 에러:', data.errorCode, data.errorMessage);
                throw new Error(`알라딘 API 오류: ${data.errorMessage} (코드: ${data.errorCode})`);
            }

            return data;

        } catch (error) {
            console.error('알라딘 상품 조회 API 상세 오류:', error);
            throw new Error('Aladin');
        }
    }



}

export const aladinApiService = new AladinApiService();