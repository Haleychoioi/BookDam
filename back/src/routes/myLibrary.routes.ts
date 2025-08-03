import express from 'express';

import authenticate from '../middleware/authenticate-middleware'
import tasteAnalysisController from '../controllers/tasteAnalysis.controller';

const router = express.Router();

// 내 서재 읽은책의 평점으로 선호도 통계 데이터


export default router;