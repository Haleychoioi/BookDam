import { AladinBookItem } from "./book.type";

// 내 서재 도서 타입 (알라딘 데이터 + 내 평점)
export interface MyBookItem extends AladinBookItem {
  myRating: number;        // 내가 매긴 평점
}

// 취향 분석 기능 전용 타입
export interface BookForAnalysis {
  author: string;
  publisher: string;
  categoryName: string | null;
  title: string;
  myRating: number;
}

// 통계 결과 타입들
export interface CategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
  percentage: number;
}

export interface AuthorStats {
  author: string;
  count: number;
  averageRating: number;
}

export interface PublisherStats {
  publisher: string;
  count: number;
  averageRating: number;
}

export interface FullCategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
}

export interface LibraryStats {
  totalBooks: number;
  overallAverageRating: number;
  preferredCategories: CategoryStats[];
  allCategoryStats: FullCategoryStats[];
  preferredAuthors: AuthorStats[];
  preferredPublishers: PublisherStats[];
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

