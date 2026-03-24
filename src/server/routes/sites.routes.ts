import { Router } from 'express';
import * as controller from '../controllers/sites.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAll));
router.post('/', requireMinRole('ADMIN'), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', requireMinRole('MANAGER'), asyncHandler(controller.update));
router.delete('/:id', requireMinRole('ADMIN'), asyncHandler(controller.remove));
router.get('/:id/zones', asyncHandler(controller.getZones));
router.post('/:id/zones', requireMinRole('MANAGER'), asyncHandler(controller.createZone));

export default router;
