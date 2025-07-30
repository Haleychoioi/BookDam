import { AladinBookItem } from "./book.type";

// 내 서재 도서 타입 (알라딘 데이터 + 내 평점)
interface MyBookItem extends AladinBookItem {
  myRating: number;        // 내가 매긴 평점
}

// 통계 결과 타입들
interface CategoryStats {
  categoryName: string;
  count: number;
  averageRating: number;
  percentage: number;
}

interface AuthorStats {
  author: string;
  count: number;
  averageRating: number;
  books: string[];
}

interface PublisherStats {
  publisher: string;
  count: number;
  averageRating: number;
  books: string[];
}

interface LibraryStats {
  totalBooks: number;
  overallAverageRating: number;
  preferredCategories: CategoryStats[];
  preferredAuthors: AuthorStats[];
  preferredPublishers: PublisherStats[];
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

export class MyLibraryAnalyzer {
  private books: MyBookItem[];

  constructor(books: MyBookItem[]) {
    this.books = books;
  }

  // 전체 통계 분석
  analyze(): LibraryStats {
    return {
      totalBooks: this.books.length,
      overallAverageRating: this.getOverallAverage(),
      preferredCategories: this.getCategoryStats(),
      preferredAuthors: this.getAuthorStats(),
      preferredPublishers: this.getPublisherStats(),
      ratingDistribution: this.getRatingDistribution()
    };
  }

  // 전체 평균 평점
  private getOverallAverage(): number {
    if (this.books.length === 0) return 0;
    const sum = this.books.reduce((acc, book) => acc + book.myRating, 0);
    return Math.round((sum / this.books.length) * 100) / 100;
  }

  // 카테고리별 통계
  private getCategoryStats(): CategoryStats[] {
    const statsMap = new Map<string, number[]>();
    
    this.books.forEach(book => {
      if (!statsMap.has(book.categoryName)) {
        statsMap.set(book.categoryName, []);
      }
      statsMap.get(book.categoryName)!.push(book.myRating);
    });

    const stats: CategoryStats[] = [];
    statsMap.forEach((ratings, categoryName) => {
      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      stats.push({
        categoryName,
        count: ratings.length,
        averageRating: Math.round(averageRating * 100) / 100,
        percentage: Math.round((ratings.length / this.books.length) * 100)
      });
    });

    return stats.sort((a, b) => b.averageRating - a.averageRating);
  }

  // 작가별 통계
  private getAuthorStats(): AuthorStats[] {
    const statsMap = new Map<string, { ratings: number[], books: string[] }>();
    
    this.books.forEach(book => {
      if (!statsMap.has(book.author)) {
        statsMap.set(book.author, { ratings: [], books: [] });
      }
      const stats = statsMap.get(book.author)!;
      stats.ratings.push(book.myRating);
      stats.books.push(book.title);
    });

    const stats: AuthorStats[] = [];
    statsMap.forEach((data, author) => {
      const averageRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        author,
        count: data.books.length,
        averageRating: Math.round(averageRating * 100) / 100,
        books: data.books
      });
    });

    return stats.sort((a, b) => b.averageRating - a.averageRating);
  }

  // 출판사별 통계
  private getPublisherStats(): PublisherStats[] {
    const statsMap = new Map<string, { ratings: number[], books: string[] }>();
    
    this.books.forEach(book => {
      if (!statsMap.has(book.publisher)) {
        statsMap.set(book.publisher, { ratings: [], books: [] });
      }
      const stats = statsMap.get(book.publisher)!;
      stats.ratings.push(book.myRating);
      stats.books.push(book.title);
    });

    const stats: PublisherStats[] = [];
    statsMap.forEach((data, publisher) => {
      const averageRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        publisher,
        count: data.books.length,
        averageRating: Math.round(averageRating * 100) / 100,
        books: data.books
      });
    });

    return stats.sort((a, b) => b.averageRating - a.averageRating);
  }

  // 평점 분포
  private getRatingDistribution() {
    const distribution = new Map<number, number>();
    
    this.books.forEach(book => {
      const rating = Math.floor(book.myRating);
      distribution.set(rating, (distribution.get(rating) || 0) + 1);
    });

    return Array.from(distribution.entries())
      .map(([rating, count]) => ({
        rating,
        count,
        percentage: Math.round((count / this.books.length) * 100)
      }))
      .sort((a, b) => a.rating - b.rating);
  }

  // 높은 평점 도서만 분석 (4점 이상)
  analyzeFavorites(minRating: number = 4): LibraryStats {
    const favoriteBooks = this.books.filter(book => book.myRating >= minRating);
    const analyzer = new MyLibraryAnalyzer(favoriteBooks);
    return analyzer.analyze();
  }
}