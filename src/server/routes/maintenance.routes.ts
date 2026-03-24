import { Router } from 'express';
import * as controller from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.get('/stats', asyncHandler(controller.getStats));
router.get('/upcoming', asyncHandler(controller.getUpcoming));
router.get('/overdue', asyncHandler(controller.getOverdue));
router.post('/', requireMinRole('MAINTENANCE_TECH'), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', requireMinRole('MAINTENANCE_TECH'), asyncHandler(controller.update));
router.delete('/:id', requireMinRole('SUPERVISOR'), asyncHandler(controller.remove));
router.patch('/:id/complete', requireMinRole('MAINTENANCE_TECH'), asyncHandler(controller.complete));

export default router;
