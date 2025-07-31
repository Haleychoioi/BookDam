import {
  BookForAnalysis,
  LibraryStats,
  CategoryStats,
  AuthorStats,
  PublisherStats,
  FullCategoryStats,
} from '../types/tasteAnalysis';

import { CATEGORY_MAPPING, CATEGORY_ID_MAP } from '../constants/categories';

const ALL_CATEGORIES = [
  ...Object.keys(CATEGORY_ID_MAP).filter(key => key !== '전체'),
  '기타',
];

class MyLibraryAnalyzer {
  public analyze(books: BookForAnalysis[]): LibraryStats {
    if (books.length === 0) {
      return {
        totalBooks: 0,
        overallAverageRating: 0,
        preferredCategories: [],
        allCategoryStats: ALL_CATEGORIES.map(categoryName => ({
          categoryName,
          count: 0,
          averageRating: 0,
        })),
        preferredAuthors: [],
        preferredPublishers: [],
        ratingDistribution: [],
      };
    }

    const categoryDataMap = this.getCategoryDataMap(books);

    return {
      totalBooks: books.length,
      overallAverageRating: this.getOverallAverage(books),
      preferredCategories: this.getCategoryStats(books, categoryDataMap),
      allCategoryStats: this.getFullCategoryStats(categoryDataMap),
      preferredAuthors: this.getAuthorStats(books),
      preferredPublishers: this.getPublisherStats(books),
      ratingDistribution: this.getRatingDistribution(books),
    };
  }


  private getCategoryDataMap(books: BookForAnalysis[]): Map<string, number[]> {
    const statsMap = new Map<string, number[]>();

    books.forEach(book => {
      const sourceCategory = book.categoryName as keyof typeof CATEGORY_MAPPING;

      const standardizedCategory = CATEGORY_MAPPING[sourceCategory] || '기타';

      if (!statsMap.has(standardizedCategory)) {
        statsMap.set(standardizedCategory, []);
      }
      statsMap.get(standardizedCategory)!.push(book.myRating);
    });

    return statsMap;
  }


  private getCategoryStats(
    books: BookForAnalysis[],
    statsMap: Map<string, number[]>,
  ): CategoryStats[] {
    const stats: CategoryStats[] = [];
    statsMap.forEach((ratings, categoryName) => {
      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      stats.push({
        categoryName,
        count: ratings.length,
        averageRating: Math.round(averageRating * 10) / 10,
        percentage: Math.round((ratings.length / books.length) * 100),
      });
    });

    return stats
      .sort((a, b) => {
        const scoreB = b.count * b.averageRating;
        const scoreA = a.count * a.averageRating;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  private getFullCategoryStats(
    statsMap: Map<string, number[]>,
  ): FullCategoryStats[] {
    const fullStats = ALL_CATEGORIES.map(categoryName => {
      const ratings = statsMap.get(categoryName);

      if (ratings && ratings.length > 0) {
        const averageRating =
          ratings.reduce((a, b) => a + b, 0) / ratings.length;
        return {
          categoryName,
          count: ratings.length,
          averageRating: Math.round(averageRating * 10) / 10,
        };
      } else {
        return {
          categoryName,
          count: 0,
          averageRating: 0,
        };
      }
    });
    return fullStats.sort((a, b) => b.count - a.count);
  }

  private getOverallAverage(books: BookForAnalysis[]): number {
    const sum = books.reduce((acc, book) => acc + book.myRating, 0);
    return Math.round((sum / books.length) * 10) / 10;
  }

  private getAuthorStats(books: BookForAnalysis[]): AuthorStats[] {
    const statsMap = new Map<string, { ratings: number[]; books: string[] }>();
    books.forEach(book => {
      if (!statsMap.has(book.author)) {
        statsMap.set(book.author, { ratings: [], books: [] });
      }
      const stats = statsMap.get(book.author)!;
      stats.ratings.push(book.myRating);
      stats.books.push(book.title);
    });

    const stats: AuthorStats[] = [];
    statsMap.forEach((data, author) => {
      const averageRating =
        data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        author,
        count: data.books.length,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    });

    return stats
      .sort((a, b) => {
        const scoreB = b.count * b.averageRating;
        const scoreA = a.count * a.averageRating;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  private getPublisherStats(books: BookForAnalysis[]): PublisherStats[] {
    const statsMap = new Map<string, { ratings: number[]; books: string[] }>();
    books.forEach(book => {
      if (!statsMap.has(book.publisher)) {
        statsMap.set(book.publisher, { ratings: [], books: [] });
      }
      const stats = statsMap.get(book.publisher)!;
      stats.ratings.push(book.myRating);
      stats.books.push(book.title);
    });

    const stats: PublisherStats[] = [];
    statsMap.forEach((data, publisher) => {
      const averageRating =
        data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        publisher,
        count: data.books.length,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    });

    return stats
      .sort((a, b) => {
        const scoreB = b.count * b.averageRating;
        const scoreA = a.count * a.averageRating;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  private getRatingDistribution(books: BookForAnalysis[]) {
    const distribution = new Map<number, number>();
    books.forEach(book => {
      const rating = Math.round(book.myRating);
      distribution.set(rating, (distribution.get(rating) || 0) + 1);
    });

    return Array.from(distribution.entries())
      .map(([rating, count]) => ({
        rating,
        count,
        percentage: Math.round((count / books.length) * 100),
      }))
      .sort((a, b) => a.rating - b.rating);
  }
}

export default new MyLibraryAnalyzer();