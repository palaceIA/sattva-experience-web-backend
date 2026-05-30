import { Router } from 'express';
import { LotController } from '../controllers/LotController';

const router = Router();

// Rotas para Lotes
router.post('/', LotController.create);
router.get('/', LotController.getAll);
router.get('/expired', LotController.getExpiredLots);
router.get('/upcoming-expiry', LotController.getUpcomingLotsToExpire);
router.get('/:id', LotController.getById);
router.put('/:id', LotController.update);
router.post('/:id/buy', LotController.buy);
router.post('/:id/add-quantity', LotController.addQuantity);
router.delete('/:id', LotController.delete);

// Rotas para Lotes de uma Imersão
router.get('/immersion/:id', LotController.getByImmersionId);
router.get('/immersion/:id/active', LotController.getActiveLot);

export default router;
