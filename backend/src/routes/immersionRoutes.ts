import { Router } from 'express';
import { ImmersionController } from '../controllers/ImmersionController';

const router = Router();

// Rotas para Imersões
router.post('/', ImmersionController.create);
router.get('/', ImmersionController.getAll);
router.get('/active', ImmersionController.getActive);
router.get('/:id', ImmersionController.getById);
router.get('/:id/with-lots', ImmersionController.getWithLots);
router.put('/:id', ImmersionController.update);
router.delete('/:id', ImmersionController.delete);

export default router;
