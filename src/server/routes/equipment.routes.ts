import { Router } from 'express';
import * as controller from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAllEquipment));
router.get('/stats/overview', asyncHandler(controller.getFleetOverview));
router.post('/', requireMinRole('SUPERVISOR'), asyncHandler(controller.createEquipment));
router.get('/:id', asyncHandler(controller.getEquipmentById));
router.put('/:id', requireMinRole('SUPERVISOR'), asyncHandler(controller.updateEquipment));
router.delete('/:id', requireMinRole('MANAGER'), asyncHandler(controller.deleteEquipment));
router.patch('/:id/status', requireMinRole('SUPERVISOR'), asyncHandler(controller.updateEquipmentStatus));
router.get('/:id/telemetry', asyncHandler(controller.getEquipmentTelemetry));

export default router;
