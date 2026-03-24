import { Router } from 'express';
import * as controller from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', asyncHandler(controller.getDashboard));
router.get('/kpi', asyncHandler(controller.getKPISnapshot));
router.get('/production/trend', asyncHandler(controller.getProductionTrend));
router.get('/maintenance/cost-trend', asyncHandler(controller.getMaintenanceCostTrend));
router.get('/fuel/trend', asyncHandler(controller.getFuelConsumptionTrend));
router.get('/equipment/utilization', asyncHandler(controller.getEquipmentUtilization));
router.get('/safety/metrics', asyncHandler(controller.getSafetyMetrics));

export default router;
