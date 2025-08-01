import express from 'express';
import tasteAnalysisController from '../controllers/tasteAnalysis.controller';
import authenticate from '../middleware/authenticate-middleware';

const router = express.Router();

router.get("/", authenticate, tasteAnalysisController.getTasteAnalysis);

export default router;