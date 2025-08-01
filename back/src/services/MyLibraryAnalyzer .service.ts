import {
  BookForAnalysis,
  LibraryStats,
  CategoryStats,
  AuthorStats,
  PublisherStats,
} from '../types/tasteAnalysis';

class MyLibraryAnalyzer {
  public analyze(books: BookForAnalysis[]): LibraryStats {
    if (books.length === 0) {
      return {
        totalBooks: 0,
        overallAverageRating: 0,
        preferredCategories: [],
        preferredAuthors: [],
        preferredPublishers: [],
        ratingDistribution: [],
      };
    }
    return {
      totalBooks: books.length,
      overallAverageRating: this.getOverallAverage(books),
      preferredCategories: this.getCategoryStats(books),
      preferredAuthors: this.getAuthorStats(books),
      preferredPublishers: this.getPublisherStats(books),
      ratingDistribution: this.getRatingDistribution(books),
    };
  }

  private getOverallAverage(books: BookForAnalysis[]): number {
    const sum = books.reduce((acc, book) => acc + book.myRating, 0);
    return Math.round((sum / books.length) * 100) / 100;
  }

  private getCategoryStats(books: BookForAnalysis[]): CategoryStats[] {
    const statsMap = new Map<string, number[]>();
    books.forEach(book => {
      const categoryName = book.categoryName || '기타';
      if (!statsMap.has(categoryName)) {
        statsMap.set(categoryName, []);
      }
      statsMap.get(categoryName)!.push(book.myRating);
    });

    const stats: CategoryStats[] = [];
    statsMap.forEach((ratings, categoryName) => {
      const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      stats.push({
        categoryName,
        count: ratings.length,
        averageRating: Math.round(averageRating * 100) / 100,
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
      const averageRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        author,
        count: data.books.length,
        averageRating: Math.round(averageRating * 100) / 100,
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
      const averageRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      stats.push({
        publisher,
        count: data.books.length,
        averageRating: Math.round(averageRating * 100) / 100,
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