import { Router } from 'express';
import * as controller from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireMinRole('MANAGER'), asyncHandler(controller.getAll));
router.get('/stats', requireMinRole('MANAGER'), asyncHandler(controller.getStats));
router.get('/:id', requireMinRole('MANAGER'), asyncHandler(controller.getById));
router.post('/', requireMinRole('ADMIN'), asyncHandler(controller.create));
router.put('/:id', requireMinRole('MANAGER'), asyncHandler(controller.update));
router.delete('/:id', requireMinRole('ADMIN'), asyncHandler(controller.remove));
router.patch('/:id/role', requireMinRole('ADMIN'), asyncHandler(controller.updateRole));
router.patch('/:id/status', requireMinRole('MANAGER'), asyncHandler(controller.setStatus));
router.post('/:id/reset-password', requireMinRole('ADMIN'), asyncHandler(controller.resetPassword));

export default router;
