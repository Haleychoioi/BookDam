/**
 * API: GET /api/mypage/taste-analysis 의 전체 응답 구조
 */
export interface LibraryStats {
  totalBooks: number;
  overallAverageRating: number;
  allCategoryStats: FullCategoryStats[]; // 모든 카테고리 통계
  preferredCategories: CategoryStats[]; // 선호 카테고리 Top 5
  preferredAuthors: AuthorStats[]; // 선호 작가 Top 5
  preferredPublishers: PublisherStats[]; // 선호 출판사 Top 5
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

/**
 * 전체 카테고리 통계 객체
 */
export interface FullCategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
}

/**
 * 선호 카테고리 객체
 */
export interface CategoryStats extends FullCategoryStats {
  percentage: number;
}

/**
 * 선호 작가 객체
 */
export interface AuthorStats {
  author: string;
  count: number;
  averageRating: number;
}

/**
 * 선호 출판사 객체
 */
export interface PublisherStats {
  publisher: string;
  count: number;
  averageRating: number;
}
