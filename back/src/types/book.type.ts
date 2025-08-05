export enum AladinQueryType {
  KEYWORD = 'Keyword',
  TITLE = 'Title', 
  AUTHOR = 'Author',
  PUBLISHER = 'Publisher'
}

export enum AladinSearchTarget {
  BOOK = 'Book',
  FOREIGN = 'Foreign',
  EBOOK = 'eBook',
  ALL = 'All'
}

export enum AladinSortType {
  ACCURACY = 'Accuracy',
  PUBLISH_TIME = 'PublishTime',
  TITLE = 'Title',
  SALES_POINT = 'SalesPoint',
  CUSTOMER_RATING = 'CustomerRating',
  MY_REVIEW_COUNT = 'MyReviewCount'
}

export enum AladinListType {
  NEW_ALL = 'ItemNewAll',
  NEW_SPECIAL = 'ItemNewSpecial',
  EDITOR_CHOICE = 'ItemEditorChoice',
  BESTSELLER = 'Bestseller',
  BLOG_BEST = 'BlogBest'
}

export enum AladinCoverSize {
  BIG = 'Big',
  MID_BIG = 'MidBig', 
  MID = 'Mid',
  SMALL = 'Small',
  MINI = 'Mini',
  NONE = 'None'
}

export enum AladinOutputType {
  XML = 'XML',
  JS = 'JS'
}

export enum AladinItemIdType {
  ISBN = 'ISBN',
  ISBN13 = 'ISBN13',
  ITEM_ID = 'ItemId'
}


// ===== 알라딘 API 요청 타입들 =====

// 1. 상품 검색 API 요청
export interface AladinSearchRequest {
  Query: string;                    // 검색어 (필수)
  QueryType?: AladinQueryType;      // 검색 종류 (기본: Keyword)
  SearchTarget?: AladinSearchTarget; // 검색 대상 (기본: Book)
  Start?: number;                   // 시작 페이지 (기본: 1)
  MaxResults?: number;              // 페이지당 결과 수 (기본: 10, 최대: 50)
  Sort?: AladinSortType;            // 정렬 (기본: Accuracy)
  Cover?: AladinCoverSize;          // 표지 크기 (기본: Mid)
  CategoryId?: number;              // 카테고리 ID (기본: 0, 전체)
  Output?: AladinOutputType;        // 출력 형식 (기본: XML)
  Version?: string;                 // API 버전 (최신: 20131101)
  outofStockfilter?: number;        // 품절 필터 (기본: 0)
  RecentPublishFilter?: number;     // 최근 출간 필터 (0~60개월, 기본: 0)
}

// 2. 상품 리스트 API 요청
export interface AladinListRequest {
  QueryType: AladinListType;        // 리스트 종류 (필수)
  SearchTarget?: AladinSearchTarget; // 조회 대상 (기본: Book)
  Start?: number;                   // 시작 페이지 (기본: 1)
  MaxResults?: number;              // 페이지당 결과 수 (기본: 10, 최대: 50)
  Cover?: AladinCoverSize;          // 표지 크기 (기본: Mid)
  CategoryId?: number;              // 카테고리 ID (기본: 0, 전체)
  Output?: AladinOutputType;        // 출력 형식 (기본: XML)
  Version?: string;                 // API 버전 (최신: 20131101)
  Year?: number;                    // 베스트셀러 조회 연도
  Month?: number;                   // 베스트셀러 조회 월
  Week?: number;                    // 베스트셀러 조회 주
}

// 3. 상품 조회 API 요청
export interface AladinLookupRequest {
  ItemId: string;                   // 상품 ID (ISBN 또는 ItemId, 필수)
  ItemIdType?: AladinItemIdType;    // ID 타입 (기본: ISBN)
  Cover?: AladinCoverSize;          // 표지 크기 (기본: Mid)
  Output?: AladinOutputType;        // 출력 형식 (기본: XML)
  Version?: string;                 // API 버전 (최신: 20131101)
  OptResult?: string[];             // 부가 정보 (ebookList, usedList, reviewList 등)
}

// ===== 알라딘 API 응답 타입들 =====

// 알라딘 API 공통 응답 구조
export interface AladinApiResponse<T = AladinBookItem> {
  version: string;                  // API 버전
  title: string;                    // API 결과 제목
  link: string;                     // 관련 알라딘 페이지 URL
  pubDate: string;                  // API 출력일
  totalResults: number;             // 총 결과 수
  startIndex: number;               // 시작 인덱스
  itemsPerPage: number;             // 페이지당 항목 수
  query?: string;                   // 검색 쿼리
  searchCategoryId?: number;        // 검색 카테고리 ID
  searchCategoryName?: string;      // 검색 카테고리명
  item: T[];                        // 상품 목록
}

// 알라딘 책 정보 (API 응답)
export interface AladinBookItem {
  title: string;                    // 상품명
  link: string;                     // 상품 링크 URL
  author: string;                   // 저자/아티스트
  pubDate: string;                  // 출간일
  description: string;              // 상품 설명 (요약)
  isbn: string;                     // 10자리 ISBN
  isbn13: string;                   // 13자리 ISBN
  itemId: number;                   // 알라딘 상품 ID
  cover: string;                    // 표지 이미지 URL
  publisher: string;                // 출판사
  adult: boolean;                   // 성인 등급 여부
  bestDuration?: string;            // 베스트셀러 기간 정보
  bestRank?: number;                // 베스트셀러 순위
  categoryName: string;             // 카테고리명
  
  // 시리즈 정보
  seriesInfo?: {
    seriesId: number;
    seriesLink: string;
    seriesName: string;
  };
  
  // 부가 정보
  subInfo?: {
    subTitle?: string;              // 부제
    originalTitle?: string;         // 원제
    itemPage?: number;              // 페이지 수
    fullDescription?: string;       // 상세 설명
    fullDescription2?: string;      // 출판사 제공 설명
    toc?: string;                   // 목차
    story?: string;                 // 줄거리
    // ... 기타 부가 정보들
  };
}

// ===== 내부 DB 저장용 타입들 =====

// Book 테이블과 매칭되는 타입
export interface BookEntity {
  isbn13: string;                   // ISBN13 (Primary Key)
  title: string;                    // 책 제목
  author: string;                   // 저자
  publisher: string;                // 출판사
  pubDate: string | null;           // 출간일
  description: string | null;       // 책 설명
  cover: string | null;             // 표지 이미지 URL
  category: string | null;          // 카테고리
  pageCount: number | null;         // 페이지 수
  createdAt: Date;                  // 등록일시
}

// MyLibrary 테이블과 매칭되는 타입
export interface MyLibraryEntity {
  libraryId: number;
  userId: number;
  bookIsbn13: string;
  myRating: number | null;
  status: ReadingStatus;
  addedAt: Date;
  updatedAt: Date;
}

// WishList 테이블과 매칭되는 타입
export interface WishListEntity {
  wishListId: number;
  userId: number;
  bookIsbn13: string;
  addedAt: Date;
}

// 독서 상태 enum
export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  COMPLETED = 'COMPLETED'
}

// ===== 클라이언트 응답용 타입들 =====

// 책 검색 결과 (클라이언트에게 전달)
export interface BookSearchResponse {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  books: BookSummary[];
}

// 책 요약 정보 (검색 결과용)
export interface BookSummary {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string | null;
  cover: string | null;
  category: string | null;
  description: string | null;
}

// 책 상세 정보 (상세 조회용)
export interface BookDetail extends BookSummary {
  pageCount: number | null;
  toc: string | null;              // 목차
  fullDescription: string | null;   // 상세 설명
  bestRank: number | null;         // 베스트셀러 순위
  seriesInfo: {
    seriesId: number;
    seriesName: string;
  } | null;
}

// ===== Service/Repository 메서드용 타입들 =====

// 책 검색 파라미터
export interface BookSearchParams {
  query: string;
  queryType?: 'title' | 'author' | 'publisher' | 'keyword';
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'accuracy' | 'publishTime' | 'title' | 'salesPoint';
}

// 책 리스트 조회 파라미터
export interface BookListParams {
  type: 'newAll' | 'newSpecial' | 'bestseller' | 'editorChoice';
  category?: string;
  page?: number;
  limit?: number;
  period?: {                        // 베스트셀러용
    year?: number;
    month?: number;
    week?: number;
  };
}

// 알라딘 API에서 내부 DB로 변환하는 함수용 타입
export interface BookCreateData {
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate?: string | null;
  description?: string | null;
  cover?: string | null;
  category?: string | null;
  pageCount?: number | null;  // undefined → null로 변경 service에서 에러가 안남
  toc?: string | null;
  story?: string | null;
}

// 개인 도서관 추가/수정 요청
export interface MyLibraryCreateRequest {
  bookIsbn13: string;
  status: ReadingStatus;
  myRating?: number;
}

export interface MyLibraryUpdateRequest {
  status?: ReadingStatus;
  myRating?: number;
}

// 위시리스트 추가 요청
export interface WishListCreateRequest {
  bookIsbn13: string;
}