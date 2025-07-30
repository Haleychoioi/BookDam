import express from 'express';
import wishListController from '../controllers/wishList.controller';
import authenticate from '../middleware/authenticate-middleware'

const router = express.Router();

// 위시리스트 추가
router.post('/', authenticate, wishListController.addWish);

// 삭제
router.delete('/:isbn13', authenticate, wishListController.removeWish);

// 전체 위시리스트
router.get('/', authenticate, wishListController.getWishList);

export default router;