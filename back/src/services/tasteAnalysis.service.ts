import TasteAnalysisRepository from '../repositories/tasteAnalysis.repository';
import MyLibraryAnalyzer from './myLibraryAnalyzer.service'
import { LibraryStats, BookForAnalysis } from '../types/tasteAnalysis';

class TasteAnalysisService {

  async getTasteAnalysis(userId: number): Promise<LibraryStats> {
    const completedLibraryItems = await TasteAnalysisRepository.findCompletedBookByUser(userId);

    const booksForAnalysis: BookForAnalysis[] = completedLibraryItems.map(item => {
      const authorName = item.book.author.split('(지은이)')[0].trim();

      return {
        author: authorName,
        publisher: item.book.publisher,
        categoryName: item.book.category,
        title: item.book.title,
        myRating: item.myRating ?? 0,
      };
    });

    const analysisResult = MyLibraryAnalyzer.analyze(booksForAnalysis);

    return analysisResult;
  }
}

export default new TasteAnalysisService();