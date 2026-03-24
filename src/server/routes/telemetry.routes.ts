import { Router } from 'express';
import * as controller from '../controllers/telemetry.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/roles.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/fleet/latest', asyncHandler(controller.getFleetLatest));
router.get('/alerts', asyncHandler(controller.getAlerts));
router.post('/ingest', requireMinRole('OPERATOR'), asyncHandler(controller.ingest));
router.post('/ingest/bulk', requireMinRole('OPERATOR'), asyncHandler(controller.bulkIngest));
router.get('/equipment/:equipmentId', asyncHandler(controller.getByEquipment));
router.get('/equipment/:equipmentId/latest', asyncHandler(controller.getLatest));
router.get('/equipment/:equipmentId/averages', asyncHandler(controller.getAverages));

export default router;
