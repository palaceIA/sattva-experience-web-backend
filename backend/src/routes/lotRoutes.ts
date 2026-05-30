import { Router } from 'express';
import { LotController } from '../controllers/LotController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const useAuth = process.env.NODE_ENV === 'production';
if (useAuth) {
    router.use(authMiddleware);
}

router.post('/', LotController.create);
router.get('/', LotController.getAll);
router.get('/expired', LotController.getExpiredLots);
router.get('/upcoming-expiry', LotController.getUpcomingLotsToExpire);
router.get('/:id', LotController.getById);
router.patch('/:id', LotController.update);
router.put('/:id', LotController.update);
router.post('/:id/buy', LotController.buy);
router.post('/:id/add-quantity', LotController.addQuantity);
router.delete('/:id', LotController.delete);

router.get('/immersion/:id', LotController.getByImmersionId);
router.get('/immersion/:id/active', LotController.getActiveLot);

export default router;
