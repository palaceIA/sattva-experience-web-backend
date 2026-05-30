import { Router } from 'express';
import { ImmersionController } from '../controllers/ImmersionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { lotImageUpload } from '../middleware/uploadMiddleware';

const router = Router();
const useAuth = process.env.NODE_ENV === 'production';
if (useAuth) {
    router.use(authMiddleware);
}

router.post('/', ImmersionController.create);
router.get('/', ImmersionController.getAll);
router.get('/active', ImmersionController.getActive);
router.get('/:id', ImmersionController.getById);
router.get('/:id/with-lots', ImmersionController.getWithLots);
router.post('/:id/image', lotImageUpload, ImmersionController.uploadImage);
router.patch('/:id', ImmersionController.update);
router.put('/:id', ImmersionController.update);
router.delete('/:id', ImmersionController.delete);

export default router;
