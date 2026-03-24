import { Router } from 'express';
import * as controller from '../controllers/incidents.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/stats', asyncHandler(controller.getStats));
router.post('/', asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', requireMinRole('SUPERVISOR'), asyncHandler(controller.update));
router.patch('/:id/close', requireMinRole('SUPERVISOR'), asyncHandler(controller.close));

export default router;
