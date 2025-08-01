import { Request, Response, NextFunction } from 'express';
import tasteAnalysisService from '../services/tasteAnalysis.service';

class TasteAnalysisController {
  public getTasteAnalysis = async (req: Request, res: Response) => {
    try {
      
      const userId = req.user! as number;

      const analysisResult = await tasteAnalysisService.getTasteAnalysis(userId);

      res.status(200).json(analysisResult);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '취향 분석 중 에러가 발생했습니다.' });
    }
  };
}

export default new TasteAnalysisController();